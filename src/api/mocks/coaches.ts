/**
 * Mock coach profiles for development and testing.
 * In production, this will be fetched from the backend.
 */

export interface CoachYield {
  id: string;
  alt: string;
  imageSrc: string;
  count: number;
}

export interface CoachStat {
  id: string;
  label: string;
  value: number;
}

export interface CoachProfile {
  id: string;
  name: string;
  title: string;
  imageSrc: string;
  notificationsCount: number;
  domains: string[];
  managedProjectTitles?: string[];
  yields: CoachYield[];
  stats: CoachStat[];
}

export const mockCoaches: CoachProfile[] = [
  {
    id: "zore",
    name: "Zore",
    title: "Training Coach",
    imageSrc: "/coaches/coach_zore.png",
    notificationsCount: 2,
    domains: ["Training", "Health", "Recovery"],
    managedProjectTitles: ["Command Center"],
    yields: [
      { id: "workouts", alt: "Workouts yield", imageSrc: "/coaches/workouts_yield.png", count: 10 },
      { id: "streak", alt: "Streak yield", imageSrc: "/coaches/streak_yield.png", count: 4 },
      { id: "completion", alt: "Completion yield", imageSrc: "/coaches/completion_yield.png", count: 5 },
    ],
    stats: [
      { id: "commitment", label: "Commitment", value: 72 },
      { id: "momentum", label: "Momentum", value: 69 },
      { id: "responsiveness", label: "Responsiveness", value: 75 },
    ],
  },
  {
    id: "amari",
    name: "Amari",
    title: "Momentum Coach",
    imageSrc: "/coaches/coach_amari.png",
    notificationsCount: 3,
    domains: ["Momentum", "Deep Work"],
    yields: [
      { id: "streak", alt: "Streak yield", imageSrc: "/coaches/streak_yield.png", count: 5 },
      { id: "words", alt: "Words yield", imageSrc: "/coaches/words_yield.png", count: 12 },
      { id: "combos", alt: "Combos yield", imageSrc: "/coaches/combos_yield.png", count: 3 },
    ],
    stats: [
      { id: "commitment", label: "Commitment", value: 86 },
      { id: "momentum", label: "Momentum", value: 78 },
      { id: "responsiveness", label: "Responsiveness", value: 92 },
    ],
  },
  {
    id: "moksha",
    name: "Moksha",
    title: "Deep Work Coach",
    imageSrc: "/coaches/coach_moksha.png",
    notificationsCount: 1,
    domains: ["Deep Work", "Reading"],
    yields: [
      { id: "books", alt: "Books read yield", imageSrc: "/coaches/books_read_yield.png", count: 4 },
      { id: "logged", alt: "Logged yield", imageSrc: "/coaches/logged_yield.png", count: 9 },
      { id: "mastery", alt: "Mastery yield", imageSrc: "/coaches/mastery_yield.png", count: 2 },
    ],
    stats: [
      { id: "commitment", label: "Commitment", value: 64 },
      { id: "momentum", label: "Momentum", value: 52 },
      { id: "responsiveness", label: "Responsiveness", value: 71 },
    ],
  },
  {
    id: "pingala",
    name: "Pingala",
    title: "Systems Coach",
    imageSrc: "/coaches/coach_pingala.png",
    notificationsCount: 0,
    domains: ["Systems", "Planning", "Execution"],
    yields: [
      { id: "completion", alt: "Completion yield", imageSrc: "/coaches/completion_yield.png", count: 7 },
      { id: "milestone", alt: "Milestone yield", imageSrc: "/coaches/milestone_yield.png", count: 3 },
      { id: "streak", alt: "Streak yield", imageSrc: "/coaches/streak_yield.png", count: 6 },
      { id: "workouts", alt: "Workouts yield", imageSrc: "/coaches/workouts_yield.png", count: 2 },
    ],
    stats: [
      { id: "commitment", label: "Commitment", value: 93 },
      { id: "momentum", label: "Momentum", value: 88 },
      { id: "responsiveness", label: "Responsiveness", value: 80 },
    ],
  },
  {
    id: "wealthy",
    name: "Wealthy",
    title: "Wealth Coach",
    imageSrc: "/coaches/coach_wealthy.png",
    notificationsCount: 0,
    domains: ["Wealth", "Systems"],
    yields: [
      { id: "milestone", alt: "Milestone yield", imageSrc: "/coaches/milestone_yield.png", count: 2 },
      { id: "logged", alt: "Logged yield", imageSrc: "/coaches/logged_yield.png", count: 8 },
      { id: "combos", alt: "Combos yield", imageSrc: "/coaches/combos_yield.png", count: 1 },
    ],
    stats: [
      { id: "commitment", label: "Commitment", value: 58 },
      { id: "momentum", label: "Momentum", value: 47 },
      { id: "responsiveness", label: "Responsiveness", value: 62 },
    ],
  },
];
