import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

export const explanations = pgTable("explanations", {
  id: serial("id").primaryKey(),

  userId: text("user_id").notNull().default("demo-user"),

  language: text("language").notNull(),
  source: text("source").notNull(),
  lineNumber: integer("line_number").notNull(),

  code: text("code").notNull(),
  explanation: text("explanation").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),

  explanationId: integer("explanation_id")
    .references(() => explanations.id, { onDelete: "cascade" })
    .notNull(),

  question: text("question").notNull(),

  choices: jsonb("choices").notNull(),

  correctAnswer: text("correct_answer").notNull(),

  userAnswer: text("user_answer"),

  isCorrect: boolean("is_correct"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
