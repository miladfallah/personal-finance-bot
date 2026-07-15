import { table, integer, real, text, sql, index } from 'sdk/db';

export const users = table('users', {
  id:         integer('id').primaryKey({ autoIncrement: true }),
  telegramId: integer('telegram_id').unique().notNull(),
  firstName:  text('first_name').notNull(),
  username:   text('username'),
  currency:   text('currency').notNull().default('UZS'),
  created:    integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (t) => ({
  tgIdx: index('idx_users_tg').on(t.telegramId),
}));

export const transactions = table('transactions', {
  id:              integer('id').primaryKey({ autoIncrement: true }),
  userId:          integer('user_id').notNull(),
  type:            text('type').notNull(),
  amount:          real('amount').notNull(),
  category:        text('category').notNull(),
  description:     text('description'),
  transactionDate: integer('transaction_date', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  created:         integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (t) => ({
  userIdx: index('idx_tx_user').on(t.userId),
  dateIdx: index('idx_tx_date').on(t.transactionDate),
}));

export const budgets = table('budgets', {
  id:           integer('id').primaryKey({ autoIncrement: true }),
  userId:       integer('user_id').notNull(),
  category:     text('category').notNull(),
  monthlyLimit: real('monthly_limit').notNull(),
}, (t) => ({
  userIdx: index('idx_budget_user').on(t.userId),
}));

export const goals = table('goals', {
  id:            integer('id').primaryKey({ autoIncrement: true }),
  userId:        integer('user_id').notNull(),
  title:         text('title').notNull(),
  targetAmount:  real('target_amount').notNull(),
  currentAmount: real('current_amount').notNull().default(0),
  deadline:      integer('deadline', { mode: 'timestamp' }),
  created:       integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (t) => ({
  userIdx: index('idx_goals_user').on(t.userId),
}));