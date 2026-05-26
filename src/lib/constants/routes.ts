export const ROUTES = {
  // Public
  HOME: "/",
  ABOUT: "/about",
  SCHEDULE: "/schedule",
  INSTRUCTORS: "/instructors",
  CONTACT: "/contact",

  // Auth
  LOGIN: "/login",
  REGISTER: "/register",

  // Member
  DASHBOARD: "/dashboard",
  LESSONS: "/lessons",
  SEMINARS: "/seminars",
  PRACTICE: "/practice",
  EVENTS: "/events",
  NOTES: "/notes",
  SEARCH: "/search",
  ACCOUNT: "/account",

  // Admin
  ADMIN: "/admin",
  INSTRUCTOR_DASHBOARD: "/instructor",
} as const;

export const NAV_ITEMS = {
  public: [
    { label: "About", href: ROUTES.ABOUT },
    { label: "Schedule", href: ROUTES.SCHEDULE },
    { label: "Instructors", href: ROUTES.INSTRUCTORS },
    { label: "Contact", href: ROUTES.CONTACT },
  ],
  member: [
    { label: "Dashboard", href: ROUTES.DASHBOARD },
    { label: "Practice", href: ROUTES.PRACTICE },
    { label: "Lessons", href: ROUTES.LESSONS },
    { label: "Seminars", href: ROUTES.SEMINARS },
    { label: "Events", href: ROUTES.EVENTS },
    { label: "Notes", href: ROUTES.NOTES },
  ],
} as const;
