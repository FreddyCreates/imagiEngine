import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const weapons = pgTable('weapons', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  damage: integer('damage').notNull(),
  ammo: integer('ammo').notNull(),
});

export const userWeapons = pgTable('user_weapons', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  weaponId: integer('weapon_id')
    .references(() => weapons.id)
    .notNull(),
  equipped: integer('equipped').default(0), // 0 or 1
});

export const usersRelations = relations(users, ({ many }) => ({
  userWeapons: many(userWeapons),
}));

export const weaponsRelations = relations(weapons, ({ many }) => ({
  userWeapons: many(userWeapons),
}));
