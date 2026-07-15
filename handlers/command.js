import { getOrCreateUser, setBudget, createGoal, checkBudgets, getGoals, validateAmount, escapeHtml } from "../lib/finance.js";
import { getMainMenuKeyboard, formatBudgetStatus, formatGoals } from "../lib/formatter.js";

export async function handleStart(ctx) {
  const user = getOrCreateUser(ctx.from.id, ctx.from.first_name, ctx.from.username);
  const name = ctx.from.first_name || "کاربر";

  const msg = `╔═══════════════════════════╗
║  💰 <b>دستیار مالی شخصی</b>
╚═══════════════════════════╝

سلام <b>${escapeHtml(name)}</b>! 👋

من کمکتون می‌کنم درآمد و هزینه‌هاتون رو پیگیری کنید.

<b>🎯 شروع سریع:</b>
  • <code>۲۵۰۰۰ غذا شام</code>
  • <code>درآمد ۳۰۰۰۰۰۰۰ حقوق</code>

<b>📌 دستورات:</b>
  /budget — مدیریت بودجه
  /goal — مدیریت اهداف

از دکمه‌های زیر استفاده کنید 👇`;

  await ctx.reply(msg, { parse_mode: "HTML", reply_markup: getMainMenuKeyboard() });
}

export async function handleBudget(ctx) {
  const user = getOrCreateUser(ctx.from.id, ctx.from.first_name, ctx.from.username);
  const parts = ctx.message.text.split(/\s+/).slice(1);

  if (parts.length === 0) {
    const budgets = checkBudgets(user.id);
    return ctx.reply(formatBudgetStatus(budgets), {
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "➕ تنظیم بودجه", callback_data: "set_budget" }], [{ text: "🔙 بازگشت", callback_data: "main_menu" }]] }
    });
  }
  if (parts.length < 2) return ctx.reply(" نحوه استفاده: <code>/budget غذا ۵۰۰۰۰۰۰</code>", { parse_mode: "HTML" });

  const amount = validateAmount(parts[1]);
  if (!amount) return ctx.reply("❌ مبلغ نامعتبر است.", { parse_mode: "HTML" });

  setBudget(user.id, parts[0].toLowerCase(), amount);
  await ctx.reply(`✅ <b>بودجه تنظیم شد!</b>\n\n📂 ${escapeHtml(parts[0])}\n💰 سقف: <b>${amount.toLocaleString("fa-IR")} تومان</b>`, {
    parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 بازگشت", callback_data: "main_menu" }]] }
  });
}

export async function handleGoal(ctx) {
  const user = getOrCreateUser(ctx.from.id, ctx.from.first_name, ctx.from.username);
  const parts = ctx.message.text.split(/\s+/).slice(1);

  if (parts.length === 0) {
    const goals = getGoals(user.id);
    return ctx.reply(formatGoals(goals), {
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "➕ افزودن هدف", callback_data: "add_goal" }], [{ text: "🔙 بازگشت", callback_data: "main_menu" }]] }
    });
  }
  if (parts.length < 2) return ctx.reply("نحوه استفاده: <code>/goal ماشین ۵۰۰۰۰۰۰۰۰</code>", { parse_mode: "HTML" });

  const amount = validateAmount(parts[1]);
  if (!amount) return ctx.reply("❌ مبلغ نامعتبر است.", { parse_mode: "HTML" });

  createGoal(user.id, parts[0].toLowerCase(), amount);
  await ctx.reply(`✅ <b>هدف ایجاد شد!</b>\n\n🎯 ${escapeHtml(parts[0])}\n💰 هدف: <b>${amount.toLocaleString("fa-IR")} تومان</b>`, {
    parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 بازگشت", callback_data: "main_menu" }]] }
  });
}