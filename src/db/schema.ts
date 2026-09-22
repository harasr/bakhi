import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  // Demonstration of ALE (Application-Level Encryption) for PII
  encryptedEmail: text('encrypted_email'), 
  encryptedPhone: text('encrypted_phone'),
  encryptedIdCard: text('encrypted_id_card'),
  highScore: integer('high_score').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const scores = pgTable('scores', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  value: integer('value').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  scores: many(scores),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  user: one(users, {
    fields: [scores.userId],
    references: [users.id],
  }),
}));
