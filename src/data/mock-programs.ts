import type { CoachProgram } from "@/types/program";

/**
 * Mock coach program data for development and testing.
 * In production, this will be fetched from the backend.
 */
export const mockFarsiProgram: CoachProgram = {
  id: "mock-program-zore-farsi-2w",
  title: "2-Week Farsi Fundamentals Sprint",
  coachName: "Zore",
  coachImageSrc: "/coaches/coach_zore.png",
  domain: "Language",
  dueDateLabel: "Due 26 Jan",
  yieldIconPaths: ["/coaches/streak_yield.png", "/coaches/words_yield.png", "/coaches/mastery_yield.png"],
  objective: "Lay down the core Farsi building blocks so you can read simple phrases, introduce yourself, and follow basic conversations.",
  currentState: {
    headline: "You know almost no Farsi",
    description: "You might recognize a few words or letters, but the script feels intimidating and you can't yet form or understand basic sentences.",
  },
  targetState: {
    headline: "Comfortable with Farsi basics",
    description: "You can sound out most letters, read and write a handful of high-frequency words, and hold a short, slow introduction about yourself.",
  },
  milestones: [
    {
      id: "w1-alphabet-sounds",
      weekNumber: 1,
      title: "Crack the alphabet and core sounds",
      description: "Master the Farsi script shapes, common letter connections, and the sounds that dont exist in English.",
      tickets: [
        {
          ticket_id: "farsi-letters-01",
          ticket_key: "CC-53",
          ticket_type: "task",
          title: "Learn and write the first 12 Farsi letters",
          ticket_status: "In Progress",
        },
        {
          ticket_id: "farsi-sounds-01",
          ticket_key: "CC-54",
          ticket_type: "task",
          title: "Practice difficult sounds 10 minutes per day",
          ticket_status: "Todo",
        },
      ],
    },
    {
      id: "w2-phrases-routines",
      weekNumber: 2,
      title: "Build everyday phrases and a mini routine",
      description: "Use your reading to learn greetings, introductions, numbers, and a 510 minute daily practice loop you can actually stick to.",
      tickets: [
        {
          ticket_id: "farsi-greetings-01",
          ticket_key: "CC-55",
          ticket_type: "task",
          title: "Memorise and record 5 greeting exchanges",
          ticket_status: "Todo",
        },
        {
          ticket_id: "farsi-intro-01",
          ticket_key: "CC-56",
          ticket_type: "task",
          title: "Write and say a 4-sentence self-introduction",
          ticket_status: "Todo",
        },
      ],
    },
  ],
  successCriteria: [
    "You can read and write your name plus 10-15 high-frequency Farsi words",
    "You can introduce yourself in Farsi in 3-4 short sentences without reading a script",
    "You follow the gist of a slow, simple Farsi introduction from someone else (even if you miss details)",
  ],
  coachNotes:
    "We're optimising for confidence, not perfection. Expect repetition, messy handwriting, and mispronunciations—that's exactly how your brain locks in a new script.",
};

export const mockLatestCoachMessage =
  "I've sketched a first pass for this 2-week sprint, but I want to tailor it around you. Tell me what your goals are for these two weeks so we can tune the plan together.";

export const mockSubmitCoachPromptResponseMessage =
  "Thanks for sharing that. I've adjusted Week 1 so we plan your training around that constraint instead of fighting it.";

export const mockCoachCompletionMessage =
  "Amazing! Let's crush this together. I'll be with you every step of the way, keeping you on track and celebrating your wins!";
