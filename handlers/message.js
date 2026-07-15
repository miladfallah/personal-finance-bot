import { getOrCreateUser, parseTransaction, insertTransaction, checkBudgets } from "../lib/finance.js";
import { formatTransaction, formatPercentage, getMainMenuKeyboard } from "../lib/formatter.js";
import { getCategoryDisplay } from "../lib/categories.js";

export async function handleMessage(ctx) {
  const text = ctx.message.text;
  if (text.startsWith("/")) return;

  const user = getOrCreateUser(ctx.from.id, ctx.from.first_name, ctx.from.username);
  const parsed = parseTransaction(text);
  if (!parsed) {
    return ctx.reply(
      `💡 <b>نمونه استفاده:</b>\n\n` +
      `💸 ثبت هزینه:\n<code>۲۵۰۰۰ غذا شام</code>\n\n` +
      `💰 ثبت درآمد:\n<code>درآمد ۳۰۰۰۰۰۰۰ حقوق</code>\n\n` +
      `یا از دکمه‌های زیر استفاده کنید 👇`,
      { parse_mode: "HTML", reply_markup: getMainMenuKeyboard() }
    );
  }

  insertTransaction(user.id, { type: parsed.type, amount: parsed.amount, category: parsed.category, description: parsed.description });

  let warning = "";
  if (parsed.type === "expense") {
    const budgets = checkBudgets(user.id);
    const b = budgets.find(x => x.category === parsed.category);
    if (b?.status === "exceeded") warning = `\n\n🔴 <b>هشدار!</b> بودجه ${b.category} تمام شد!`;
    else if (b?.status === "warning") warning = `\n\n🟡 <b>هشدار:</b> ${formatPercentage(b.percentage)} بودجه ${b.category} مصرف شد.`;
  }

  await ctx.reply(formatTransaction({ type: parsed.type, amount: parsed.amount, category: getCategoryDisplay(parsed.category, parsed.type), description: parsed.description }) + warning, {
    parse_mode: "HTML", reply_markup: getMainMenuKeyboard()
  });
}