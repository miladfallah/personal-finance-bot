import {
  getOrCreateUser, getBalance, getMonthlyReport, checkBudgets,
  getGoals, setBudget, createGoal, addToGoal, validateAmount, escapeHtml,
  getRecentTransactions, deleteTransaction, deleteAllTransactions,
  getWeeklyReport, getStats
} from "../lib/finance.js";
import {
  formatBalance, formatMonthlyReport, formatBudgetStatus, formatGoals,
  formatAmount, getMainMenuKeyboard, formatTransactionsList, getTransactionsKeyboard,
  formatWeeklyReport, formatStats
} from "../lib/formatter.js";
import { EXPENSE_CATEGORIES } from "../lib/categories.js";

const userStates = new Map();

export async function handleCallbackQuery(ctx) {
  const data = ctx.callbackQuery.data;
  const chatId = ctx.callbackQuery.message.chat.id;
  await ctx.answerCallbackQuery();
  const user = getOrCreateUser(ctx.from.id, ctx.from.first_name, ctx.from.username);

  // ─── Main Menu ───
  if (data === "main_menu") {
    return ctx.editMessageText("📋 <b>منوی اصلی</b>", { parse_mode: "HTML", reply_markup: getMainMenuKeyboard() }).catch(() => {
      ctx.reply("📋 <b>منوی اصلی</b>", { parse_mode: "HTML", reply_markup: getMainMenuKeyboard() });
    });
  }

  // ─── Add Expense ───
  if (data === "add_expense") {
    return ctx.reply("💸 <b>ثبت هزینه</b>\n\nمثال: <code>۲۵۰۰۰ غذا شام</code>", {
      parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "❌ انصراف", callback_data: "main_menu" }]] }
    });
  }

  // ─── Add Income ───
  if (data === "add_income") {
    return ctx.reply("💰 <b>ثبت درآمد</b>\n\nمثال: <code>درآمد ۳۰۰۰۰۰۰۰ حقوق</code>", {
      parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "❌ انصراف", callback_data: "main_menu" }]] }
    });
  }

  // ─── Balance ───
  if (data === "balance") {
    return ctx.reply(formatBalance(await getBalance(user.id)), { parse_mode: "HTML", reply_markup: getMainMenuKeyboard() });
  }

  // ─── Monthly Report ───
  if (data === "monthly_report") {
    return ctx.reply(formatMonthlyReport(await getMonthlyReport(user.id)), { parse_mode: "HTML", reply_markup: getMainMenuKeyboard() });
  }

  // ─── Weekly Report ───
  if (data === "weekly_report") {
    return ctx.reply(formatWeeklyReport(await getWeeklyReport(user.id)), { parse_mode: "HTML", reply_markup: getMainMenuKeyboard() });
  }

  // ─── Stats ───
  if (data === "stats") {
    return ctx.reply(formatStats(await getStats(user.id)), { parse_mode: "HTML", reply_markup: getMainMenuKeyboard() });
  }

  // ─── Budget Menu ───
  if (data === "budget_menu") {
    return ctx.reply(formatBudgetStatus(await checkBudgets(user.id)), {
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "➕ تنظیم بودجه", callback_data: "set_budget" }], [{ text: "🔙 بازگشت", callback_data: "main_menu" }]] }
    });
  }

  // ─── Set Budget ───
  if (data === "set_budget") {
    const cats = Object.entries(EXPENSE_CATEGORIES).slice(0, 6);
    const kb = [];
    for (let i = 0; i < cats.length; i += 2) {
      const row = [{ text: `${cats[i][1].emoji} ${cats[i][1].name}`, callback_data: `sel_budget_${cats[i][0]}` }];
      if (cats[i + 1]) row.push({ text: `${cats[i + 1][1].emoji} ${cats[i + 1][1].name}`, callback_data: `sel_budget_${cats[i + 1][0]}` });
      kb.push(row);
    }
    kb.push([{ text: "❌ انصراف", callback_data: "cancel" }]);
    return ctx.reply("📋 دسته را انتخاب کنید:", { reply_markup: { inline_keyboard: kb } });
  }

  if (data.startsWith("sel_budget_")) {
    const cat = data.replace("sel_budget_", "");
    userStates.set(user.id, { step: "budget_amount", category: cat });
    return ctx.reply(`سقف ماهانه <b>${escapeHtml(cat)}</b> را وارد کنید:`, {
      parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "❌ انصراف", callback_data: "cancel" }]] }
    });
  }

  // ─── Goals Menu ───
  if (data === "goals_menu") {
    const goals = await getGoals(user.id);
    return ctx.reply(formatGoals(goals), {
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [
        [{ text: "➕ افزودن هدف", callback_data: "add_goal" }],
        [{ text: "➕ واریز به هدف", callback_data: "add_to_goal" }],
        [{ text: "🔙 بازگشت", callback_data: "main_menu" }]
      ] }
    });
  }

  if (data === "add_goal") {
    userStates.set(user.id, { step: "goal_title" });
    return ctx.reply("🎯 نام هدف را وارد کنید:", { reply_markup: { inline_keyboard: [[{ text: "❌ انصراف", callback_data: "cancel" }]] } });
  }

  if (data === "add_to_goal") {
    const goals = await getGoals(user.id);
    if (!goals.length) return ctx.reply("هنوز هدفی ندارید.", { reply_markup: getMainMenuKeyboard() });
    const kb = goals.map(g => [{ text: `${g.title} (${formatAmount(g.current_amount)}/${formatAmount(g.target_amount)})`, callback_data: `sel_goal_${g.title}` }]);
    kb.push([{ text: "❌ انصراف", callback_data: "cancel" }]);
    return ctx.reply("یک هدف انتخاب کنید:", { reply_markup: { inline_keyboard: kb } });
  }

  if (data.startsWith("sel_goal_")) {
    const title = data.replace("sel_goal_", "");
    userStates.set(user.id, { step: "goal_amount", goalTitle: title });
    return ctx.reply(`مبلغ واریز به <b>${escapeHtml(title)}</b>:`, {
      parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "❌ انصراف", callback_data: "cancel" }]] }
    });
  }

  // ─── Transactions ───
  if (data === "transactions") {
    const txs = await getRecentTransactions(user.id);
    return ctx.reply(formatTransactionsList(txs), { parse_mode: "HTML", reply_markup: getTransactionsKeyboard(txs) });
  }

  if (data.startsWith("del_tx_")) {
    const txId = parseInt(data.replace("del_tx_", ""));
    const tx = await deleteTransaction(user.id, txId);
    if (tx) {
      const icon = tx.type === "income" ? "📈" : "📉";
      const label = tx.type === "income" ? "درآمد" : "هزینه";
      return ctx.reply(`✅ حذف شد:\n${icon} <b>${label} ${formatAmount(tx.amount)}</b> — ${tx.category}`, { parse_mode: "HTML", reply_markup: getMainMenuKeyboard() });
    }
    return ctx.reply("❌ تراکنش یافت نشد.", { reply_markup: getMainMenuKeyboard() });
  }

  // ─── Cancel ───
  if (data === "cancel") {
    userStates.delete(user.id);
    return ctx.reply("❌ لغو شد.", { reply_markup: getMainMenuKeyboard() });
  }
}

// ─── State Input Handler ───
export function handleStateInput(ctx) {
  const state = userStates.get(ctx.from.id);
  if (!state) return false;
  const text = ctx.message.text;
  const user = getOrCreateUser(ctx.from.id, ctx.from.first_name, ctx.from.username);

  if (state.step === "budget_amount") {
    const amount = validateAmount(text);
    if (!amount) { ctx.reply("❌ مبلغ نامعتبر. دوباره وارد کنید:"); return true; }
    setBudget(user.id, state.category, amount);
    userStates.delete(ctx.from.id);
    ctx.reply(`✅ بودجه تنظیم شد: ${state.category} = ${amount.toLocaleString("fa-IR")} تومان`, { reply_markup: getMainMenuKeyboard() });
    return true;
  }

  if (state.step === "goal_title") {
    userStates.set(user.id, { step: "goal_target", title: text.toLowerCase() });
    ctx.reply("مبلغ هدف را وارد کنید:");
    return true;
  }

  if (state.step === "goal_target") {
    const amount = validateAmount(text);
    if (!amount) { ctx.reply("❌ مبلغ نامعتبر. دوباره وارد کنید:"); return true; }
    createGoal(user.id, state.title, amount);
    userStates.delete(ctx.from.id);
    ctx.reply(`✅ هدف ایجاد شد: ${state.title} = ${amount.toLocaleString("fa-IR")} تومان`, { reply_markup: getMainMenuKeyboard() });
    return true;
  }

  if (state.step === "goal_amount") {
    const amount = validateAmount(text);
    if (!amount) { ctx.reply("❌ مبلغ نامعتبر. دوباره وارد کنید:"); return true; }
    const g = addToGoal(user.id, state.goalTitle, amount);
    userStates.delete(ctx.from.id);
    if (g) ctx.reply(`✅ ${amount.toLocaleString("fa-IR")} تومان به ${g.title} واریز شد\nپیشرفت: ${formatAmount(g.current)} / ${formatAmount(g.target)}`, { reply_markup: getMainMenuKeyboard() });
    return true;
  }

  return false;
}