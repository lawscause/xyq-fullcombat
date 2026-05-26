import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, session);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice);
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAdmin = ReturnType<typeof createAdminClient>;

async function handleCheckoutCompleted(
  supabase: SupabaseAdmin,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.user_id;
  if (!userId) return;

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  await (supabase.from("memberships") as any).upsert({
    user_id: userId,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: subscription.id,
    status: "active",
    tier: subscription.items.data[0]?.price.lookup_key || "monthly",
    current_period_start: new Date(
      (subscription as any).current_period_start * 1000
    ).toISOString(),
    current_period_end: new Date(
      (subscription as any).current_period_end * 1000
    ).toISOString(),
  });

  // Ensure user has member role
  await (supabase.from("user_roles") as any).upsert({
    user_id: userId,
    role: "member",
  });
}

async function handleSubscriptionUpdated(
  supabase: SupabaseAdmin,
  subscription: Stripe.Subscription
) {
  const { data: membership } = await (supabase
    .from("memberships")
    .select("user_id")
    .eq("stripe_subscription_id", subscription.id)
    .single() as any);

  if (!membership) return;

  const status =
    subscription.status === "active"
      ? "active"
      : subscription.status === "past_due"
        ? "grace"
        : "expired";

  await (supabase
    .from("memberships")
    .update({
      status,
      current_period_start: new Date(
        (subscription as any).current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        (subscription as any).current_period_end * 1000
      ).toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id) as any);
}

async function handleSubscriptionDeleted(
  supabase: SupabaseAdmin,
  subscription: Stripe.Subscription
) {
  await (supabase
    .from("memberships")
    .update({ status: "expired" })
    .eq("stripe_subscription_id", subscription.id) as any);
}

async function handlePaymentFailed(
  supabase: SupabaseAdmin,
  invoice: Stripe.Invoice
) {
  const subscriptionId = (invoice as any).subscription;
  if (!subscriptionId) return;

  await (supabase
    .from("memberships")
    .update({ status: "grace" })
    .eq("stripe_subscription_id", subscriptionId as string) as any);
}
