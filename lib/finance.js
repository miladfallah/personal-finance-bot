import { db } from "../db.js";
import { findCategory } from "./categories.js";

// ─── Parser ───
export function parseTransaction(text) {
  const normalized = text.trim().toLowerCase();
  let type = "expense";
  if (/^(income|salary|earned|received|درآمد|حقوق|salary)/i.test(normalized)) type = "income";

  const amountMatch = normalized.match(/[\d,]+(?:\.\d+)?/);
  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[0].replace(/,/g, ""));
  if (isNaN(amount) || amount <= 0) return null;

  const remaining = normalized.slice(normalized.indexOf(amountMatch[0]) + amountMatch[0].length).trim();
  const parts = remaining.split(/\s+/).filter(Boolean);

  let category = parts.length >= 1 ? parts[0] : findCategory(text, type).key;
  let description = parts.length >= 2 ? parts.slice(1).join(" ") : "";

  return { amount, category, description, type };
}

export function validateAmount(input) {
  const cleaned = String(input).replace(/[^0-9.,]/g, "").replace(/,/g, "");
  const amount = parseFloat(cleaned);
  if (isNaN(amount) || amount <= 0 || amount > 1000000000000) return null;
  return Math.round(amount * 100) / 100;
}

export function escapeHtml(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ─── Users ───
export function getOrCreateUser(telegramId, firstName, username) {
  let user = db.prepare("SELECT * FROM users WHERE telegram_id=?").get(telegramId);
  if (!user) {
    const r = db.prepare("INSERT INTO users (telegram_id,first_name,username) VALUES (?,?,?)").run(telegramId, firstName, username || null);
    user = db.prepare("SELECT * FROM users WHERE id=?").get(r.lastInsertRowid);
  }
  return user;
}

// ─── Transactions ───
export function insertTransaction(userId, data) {
  db.prepare(`INSERT INTO transactions (user_id, type, amount, category, description, transaction_date) VALUES (?, ?, ?, ?, ?, datetime('now'))`).run(userId, data.type, data.amount, data.category, data.description || "");
}

export function getBalance(userId) {
  const row = db.prepare(`SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END),0) as ti, COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) as te FROM transactions WHERE user_id=?`).get(userId);
  return { totalIncome: row.ti, totalExpenses: row.te, balance: row.ti - row.te };
}

export function getMonthlyReport(userId) {
  const rows = db.prepare(`SELECT type, category, SUM(amount) as total FROM transactions WHERE user_id=? AND strftime('%Y-%m',transaction_date)=strftime('%Y-%m','now') GROUP BY type,category ORDER BY total DESC`).all(userId);
  const report = { income: [], expenses: [], totalIncome: 0, totalExpenses: 0 };
  for (const r of rows) {
    if (r.type === "income") { report.income.push(r); report.totalIncome += r.total; }
    else { report.expenses.push(r); report.totalExpenses += r.total; }
  }
  return report;
}

export function getWeeklyReport(userId) {
  const rows = db.prepare(`SELECT type, category, SUM(amount) as total FROM transactions WHERE user_id=? AND transaction_date >= datetime('now', '-7 days') GROUP BY type,category ORDER BY total DESC`).all(userId);
  const report = { totalIncome: 0, totalExpenses: 0, topExpenses: [] };
  for (const r of rows) {
    if (r.type === "income") report.totalIncome += r.total;
    else { report.totalExpenses += r.total; report.topExpenses.push(r); }
  }
  return report;
}

export function getStats(userId) {
  const total = db.prepare(`SELECT COUNT(*) as cnt FROM transactions WHERE user_id=?`).get(userId);
  const bal = getBalance(userId);
  const days = db.prepare(`SELECT COUNT(DISTINCT date(transaction_date)) as d FROM transactions WHERE user_id=?`).get(userId);
  const topCat = db.prepare(`SELECT category, SUM(amount) as total FROM transactions WHERE user_id=? AND type='expense' GROUP BY category ORDER BY total DESC LIMIT 1`).get(userId);
  return {
    totalCount: total.cnt,
    totalIncome: bal.totalIncome,
    totalExpenses: bal.totalExpenses,
    balance: bal.balance,
    activeDays: days.d,
    avgDailyExpense: days.d > 0 ? bal.totalExpenses / days.d : 0,
    topCategory: topCat ? `${topCat.category} (${topCat.total.toLocaleString("fa-IR")})` : null,
  };
}

export function getRecentTransactions(userId, limit = 10) {
  return db.prepare("SELECT * FROM transactions WHERE user_id=? ORDER BY created_at DESC LIMIT ?").all(userId, limit);
}

export function deleteTransaction(userId, txId) {
  const tx = db.prepare("SELECT * FROM transactions WHERE id=? AND user_id=?").get(txId, userId);
  if (!tx) return null;
  db.prepare("DELETE FROM transactions WHERE id=? AND user_id=?").run(txId, userId);
  return tx;
}

export function deleteAllTransactions(userId) {
  const count = db.prepare("SELECT COUNT(*) as cnt FROM transactions WHERE user_id=?").get(userId);
  db.prepare("DELETE FROM transactions WHERE user_id=?").run(userId);
  return count.cnt;
}

// ─── Budgets ───
export function setBudget(userId, category, limit) {
  const ex = db.prepare("SELECT id FROM budgets WHERE user_id=? AND category=?").get(userId, category);
  if (ex) db.prepare("UPDATE budgets SET monthly_limit=? WHERE id=?").run(limit, ex.id);
  else db.prepare("INSERT INTO budgets (user_id,category,monthly_limit) VALUES (?,?,?)").run(userId, category, limit);
}

export function checkBudgets(userId) {
  const budgets = db.prepare("SELECT * FROM budgets WHERE user_id=?").all(userId);
  return budgets.map(b => {
    const spent = db.prepare(`SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE user_id=? AND category=? AND type='expense' AND strftime('%Y-%m',transaction_date)=strftime('%Y-%m','now')`).get(userId, b.category);
    const pct = b.monthly_limit > 0 ? (spent.total / b.monthly_limit) * 100 : 0;
    return { ...b, limit: b.monthly_limit, spent: spent.total, percentage: pct, status: pct >= 100 ? "exceeded" : pct >= 80 ? "warning" : "ok" };
  });
}

// ─── Goals ───
export function createGoal(userId, title, target) {
  const ex = db.prepare("SELECT id FROM goals WHERE user_id=? AND LOWER(title)=LOWER(?)").get(userId, title);
  if (ex) db.prepare("UPDATE goals SET target_amount=? WHERE id=?").run(target, ex.id);
  else db.prepare("INSERT INTO goals (user_id,title,target_amount) VALUES (?,?,?)").run(userId, title, target);
}

export function addToGoal(userId, title, amount) {
  const g = db.prepare("SELECT * FROM goals WHERE user_id=? AND LOWER(title)=LOWER(?)").get(userId, title);
  if (!g) return null;
  const newAmt = Math.min(g.current_amount + amount, g.target_amount);
  db.prepare("UPDATE goals SET current_amount=? WHERE id=?").run(newAmt, g.id);
  return { id: g.id, title: g.title, target: g.target_amount, current: newAmt };
}

export function getGoals(userId) {
  return db.prepare("SELECT * FROM goals WHERE user_id=? ORDER BY created_at DESC").all(userId);
}

export function deleteGoal(userId, goalId) {
  const g = db.prepare("SELECT * FROM goals WHERE id=? AND user_id=?").get(goalId, userId);
  if (!g) return null;
  db.prepare("DELETE FROM goals WHERE id=? AND user_id=?").run(goalId, userId);
  return g;
}