import { db } from './index.ts';
import { users, scores } from '../../src/db/schema.ts';
import { desc, eq, sql } from 'drizzle-orm';
import { encrypt } from '../security.ts';

/**
 * Security Architect Tip: Use Prepared Statements (via Drizzle) 
 * and sanitize all inputs. ALE is used for sensitive fields.
 */

/**
 * Security Architect Tip: Use ACID Transactions for multi-step updates.
 * Ensure PII is always encrypted before touching the database.
 */

export async function registerAndSyncUser(uid: string, data: { 
  displayName?: string | null, 
  photoUrl?: string | null, 
  email?: string | null,
  phone?: string | null,
  idCard?: string | null
}) {
  return await db.transaction(async (tx) => {
    try {
      const values = {
        uid,
        displayName: data.displayName,
        photoUrl: data.photoUrl,
        encryptedEmail: data.email ? encrypt(data.email) : null,
        encryptedPhone: data.phone ? encrypt(data.phone) : null,
        encryptedIdCard: data.idCard ? encrypt(data.idCard) : null,
      };

      const result = await tx.insert(users)
        .values(values)
        .onConflictDoUpdate({
          target: users.uid,
          set: {
            ...values,
            updatedAt: sql`now()`,
          },
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Transaction failed: User sync", error);
      throw new Error("Failed to synchronize user data securely.");
    }
  });
}

export async function saveScore(uid: string, value: number) {
  return await db.transaction(async (tx) => {
    try {
      // 1. Get user with locking for update if we were doing complex balance updates
      // Here simple select is fine as it's just a high score check
      const userResult = await tx.select().from(users).where(eq(users.uid, uid)).limit(1);
      if (userResult.length === 0) throw new Error("User not found");
      const user = userResult[0];

      // 2. Insert score record
      await tx.insert(scores).values({
        userId: user.id,
        value,
      });

      // 3. Update high score if needed
      if (value > (user.highScore || 0)) {
        await tx.update(users)
          .set({ 
            highScore: value,
            updatedAt: sql`now()`,
          })
          .where(eq(users.id, user.id));
      }
    } catch (error) {
      console.error("Transaction failed: Save score", error);
      throw new Error("Database score preservation failed.");
    }
  });
}

export async function getTopTen() {
  try {
    return await db.select({
      displayName: users.displayName,
      photoUrl: users.photoUrl,
      highScore: users.highScore,
    })
    .from(users)
    .orderBy(desc(users.highScore))
    .limit(10);
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    throw new Error("Failed to retrieve rankings.");
  }
}
