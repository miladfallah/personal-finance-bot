import {
  getOrCreateUser, getBalance, getMonthlyReport, checkBudgets,
  getGoals, setBudget, createGoal, addToGoal, validateAmount, escapeHtml,
  getRecentTransactions, deleteTransaction
} from "../lib/finance.js";
import {
  formatBalance, formatMonthlyReport, formatBudgetStatus, formatGoals,
  formatAmount, getMainMenuKeyboard, formatTransactionsList, getTransactionsKeyboard
} from "../lib/formatter.js";
import { EXPENSE_CATEGORIES } from "../lib/categories.js";

const userStates = new Map();

export async function handleCallbackQuery(ctx) {
  const data = ctx.callbackQuery.data;
  const chatId = ctx.callbackQuery.message.chat.id;
  await ctx.answerCallbackQuery();
  const user = getOrCreateUser(ctx.from.id, ctx.from.first_name, ctx.from.username);

  if (data === "main_menu") {
    return ctx.editMessageText("📋 <b>Main Menu</b>", { parse_mode: "HTML", reply_markup: getMainMenuKeyboard() }).catch(() => {
      ctx.reply("📋 <b>Main Menu</b>", { parse_mode: "HTML", reply_markup: getMainMenuKeyboard() });
    });
  }
  if (data === "add_expense") {
    return ctx.reply("💸 <b>Add Expense</b>\n\nType: <code>25000 food dinner</code>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "❌ Cancel", callback_data: "main_menu" }]] } });
  }
  if (data === "add_income") {
    return ctx.reply("💰 <b>Add Income</b>\n\nType: <code>income 30000000 salary</code>", { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "❌ Cancel", callback_data: "main_menu" }]] } });
  }
  if (data === "balance") {
    return ctx.reply(formatBalance(await getBalance(user.id)), { parse_mode: "HTML", reply_markup: getMainMenuKeyboard() });
  }
  if (data === "monthly_report") {
    return ctx.reply(formatMonthlyReport(await getMonthlyReport(user.id)), { parse_mode: "HTML", reply_markup: getMainMenuKeyboard() });
  }
  if (data === "budget_menu") {
    return ctx.reply(formatBudgetStatus(await checkBudgets(user.id)), { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "➕ Set Budget", callback_data: "set_budget" }], [{ text: "🔙 Back", callback_data: "main_menu" }]] } });
  }
  if (data === "set_budget") {
    const cats = Object.entries(EXPENSE_CATEGORIES).slice(0, 6);
    const kb = [];
    for (let i = 0; i < cats.length; i += 2) {
      const row = [{ text: `${cats[i][1].emoji} ${cats[i][1].name}`, callback_data: `sel_budget_${cats[i][0]}` }];
      if (cats[i + 1]) row.push({ text: `${cats[i + 1][1].emoji} ${cats[i + 1][1].name}`, callback_data: `sel_budget_${cats[i + 1][0]}` });
      kb.push(row);
    }
    kb.push([{ text: "❌ Cancel", callback_data: "cancel" }]);
    return ctx.reply("📋 Select category:", { reply_markup: { inline_keyboard: kb } });
  }
  if (data.startsWith("sel_budget_")) {
    userStates.set(user.id, { step: "budget_amount", category: data.replace("sel_budget_", "") });
    return ctx.reply(`Enter monthly limit for <b>${escapeHtml(data.replace("sel_budget_", ""))}</b>:`, { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "❌ Cancel", callback_data: "cancel" }]] } });
  }
  if (data === "goals_menu") {
    return ctx.reply(formatGoals(await getGoals(user.id)), { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "➕ Add Goal", callback_data: "add_goal" }], [{ text: "➕ Add to Goal", callback_data: "add_to_goal" }], [{ text: "🔙 Back", callback_data: "main_menu" }]] } });
  }
  if (data === "add_goal") {
    userStates.set(user.id, { step: "goal_title" });
    return ctx.reply("🎯 Enter goal name:", { reply_markup: { inline_keyboard: [[{ text: "❌ Cancel", callback_data: "cancel" }]] } });
  }
  if (data === "add_to_goal") {
    const goals = await getGoals(user.id);
    if (!goals.length) return ctx.reply("No goals yet.", { reply_markup: getMainMenuKeyboard() });
    const kb = goals.map(g => [{ text: `${g.title} (${formatAmount(g.current_amount)}/${formatAmount(g.target_amount)})`, callback_data: `sel_goal_${g.title}` }]);
    kb.push([{ text: "❌ Cancel", callback_data: "cancel" }]);
    return ctx.reply("Select a goal:", { reply_markup: { inline_keyboard: kb } });
  }
  if (data.startsWith("sel_goal_")) {
    userStates.set(user.id, { step: "goal_amount", goalTitle: data.replace("sel_goal_", "") });
    return ctx.reply(`Enter amount to add to <b>${escapeHtml(data.replace("sel_goal_", ""))}</b>:`, { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "❌ Cancel", callback_data: "cancel" }]] } });
  }
  if (data === "cancel") {
    userStates.delete(user.id);
    return ctx.reply("Cancelled.", { reply_markup: getMainMenuKeyboard() });
  }
  if (data === "transactions") {
    const txs = await getRecentTransactions(user.id);
    return ctx.reply(formatTransactionsList(txs), { parse_mode: "HTML", reply_markup: getTransactionsKeyboard(txs) });
  }
  if (data.startsWith("del_tx_")) {
    const txId = parseInt(data.replace("del_tx_", ""));
    const tx = await deleteTransaction(user.id, txId);
    if (tx) {
      const icon = tx.type === "income" ? "📈" : "📉";
      await ctx.reply(`✅ Deleted:\n${icon} <b>${formatAmount(tx.amount)}</b> — ${tx.category}`, { parse_mode: "HTML", reply_markup: getMainMenuKeyboard() });
    } else {
      await ctx.reply("❌ Transaction not found.", { reply_markup: getMainMenuKeyboard() });
    }
    return;
  }
}

export function handleStateInput(ctx) {
  const state = userStates.get(ctx.from.id);
  if (!state) return false;
  const text = ctx.message.text;
  const user = getOrCreateUser(ctx.from.id, ctx.from.first_name, ctx.from.username);

  if (state.step === "budget_amount") {
    const amount = validateAmount(text);
    if (!amount) { ctx.reply("❌ Invalid amount. Try again:"); return true; }
    setBudget(user.id, state.category, amount);
    userStates.delete(ctx.from.id);
    ctx.reply(`✅ Budget set: ${state.category} = ${amount.toLocaleString()}`, { reply_markup: getMainMenuKeyboard() });
    return true;
  }
  if (state.step === "goal_title") {
    userStates.set(user.id, { step: "goal_target", title: text.toLowerCase() });
    ctx.reply("Enter target amount:");
    return true;
  }
  if (state.step === "goal_target") {
    const amount = validateAmount(text);
    if (!amount) { ctx.reply("❌ Invalid amount. Try again:"); return true; }
    createGoal(user.id, state.title, amount);
    userStates.delete(ctx.from.id);
    ctx.reply(`✅ Goal created: ${state.title} = ${amount.toLocaleString()}`, { reply_markup: getMainMenuKeyboard() });
    return true;
  }
  if (state.step === "goal_amount") {
    const amount = validateAmount(text);
    if (!amount) { ctx.reply("❌ Invalid amount. Try again:"); return true; }
    addToGoal(user.id, state.goalTitle, amount).then(g => {
      if (g) ctx.reply(`✅ Added ${amount.toLocaleString()} to ${g.title}\nProgress: ${formatAmount(g.current)} / ${formatAmount(g.target)}`, { reply_markup: getMainMenuKeyboard() });
    });
    userStates.delete(ctx.from.id);
    return true;
  }
  return false;
}