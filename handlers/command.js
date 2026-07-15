import { getOrCreateUser, setBudget, createGoal, checkBudgets, getGoals, validateAmount, escapeHtml } from "../lib/finance.js";
import { getMainMenuKeyboard, formatBudgetStatus, formatGoals } from "../lib/formatter.js";

export async function handleStart(ctx) {
  const user = getOrCreateUser(ctx.from.id, ctx.from.first_name, ctx.from.username);
  await ctx.reply(
    `Welcome to <b>Personal Finance Assistant</b> 💰\n\nI'll help you track income and expenses.\n\n<b>Quick Start:</b>\n• Type: <code>25000 food dinner</code>\n• Type: <code>income 30000000 salary</code>\n\nYour currency: <b>${user.currency}</b>`,
    { parse_mode: "HTML", reply_markup: getMainMenuKeyboard() }
  );
}

export async function handleBudget(ctx) {
  const user = getOrCreateUser(ctx.from.id, ctx.from.first_name, ctx.from.username);
  const parts = ctx.message.text.split(/\s+/).slice(1);

  if (parts.length === 0) {
    const budgets = checkBudgets(user.id);
    return ctx.reply(formatBudgetStatus(budgets), {
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "➕ Set Budget", callback_data: "set_budget" }], [{ text: "🔙 Back", callback_data: "main_menu" }]] }
    });
  }
  if (parts.length < 2) return ctx.reply("Usage: <code>/budget food 5000000</code>", { parse_mode: "HTML" });

  const amount = validateAmount(parts[1]);
  if (!amount) return ctx.reply("❌ Invalid amount.", { parse_mode: "HTML" });

  setBudget(user.id, parts[0].toLowerCase(), amount);
  await ctx.reply(`✅ <b>Budget Set!</b>\n\n📂 ${escapeHtml(parts[0])}\n💰 Limit: <b>${amount.toLocaleString()}</b>`, {
    parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "main_menu" }]] }
  });
}

export async function handleGoal(ctx) {
  const user = getOrCreateUser(ctx.from.id, ctx.from.first_name, ctx.from.username);
  const parts = ctx.message.text.split(/\s+/).slice(1);

  if (parts.length === 0) {
    const goals = getGoals(user.id);
    return ctx.reply(formatGoals(goals), {
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "➕ Add Goal", callback_data: "add_goal" }], [{ text: "🔙 Back", callback_data: "main_menu" }]] }
    });
  }
  if (parts.length < 2) return ctx.reply("Usage: <code>/goal car 500000000</code>", { parse_mode: "HTML" });

  const amount = validateAmount(parts[1]);
  if (!amount) return ctx.reply("❌ Invalid amount.", { parse_mode: "HTML" });

  createGoal(user.id, parts[0].toLowerCase(), amount);
  await ctx.reply(`✅ <b>Goal Created!</b>\n\n🎯 ${escapeHtml(parts[0])}\n💰 Target: <b>${amount.toLocaleString()}</b>`, {
    parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "main_menu" }]] }
  });
}