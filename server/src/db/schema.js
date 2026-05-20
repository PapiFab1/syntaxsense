import {
    pgTable,
    serial,
    text,
    integer,
    timestamp,
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