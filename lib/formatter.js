export function formatAmount(amount) {
  if (!amount) return "0";
  const isNeg = amount < 0;
  const abs = Math.abs(amount);
  let f;
  if (abs >= 1e9) f = (abs / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  else if (abs >= 1e6) f = (abs / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  else f = abs.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return isNeg ? `-${f}` : f;
}

export function formatPercentage(v) { return v != null ? `${Math.round(v)}%` : "0%"; }

export function progressBar(pct, len = 10) {
  const f = Math.min(Math.round((pct / 100) * len), len);
  return "█".repeat(f) + "░".repeat(len - f);
}

export function formatTransaction(d) {
  const e = d.type === "income" ? "📈" : "📉";
  let m = `${e} <b>${d.type === "income" ? "Income" : "Expense"} Added!</b>\n\n💰 Amount: <b>${formatAmount(d.amount)}</b>\n📂 Category: <b>${d.category}</b>\n`;
  if (d.description) m += `📝 Description: ${d.description}\n`;
  return m;
}

export function formatBalance(b) {
  return `💰 <b>Current Balance</b>\n\n📈 Income: <b>${formatAmount(b.totalIncome)}</b>\n📉 Expenses: <b>${formatAmount(b.totalExpenses)}</b>\n━━━━━━━━━━━━━━━━\n💎 Balance: <b>${formatAmount(b.balance)}</b>`;
}

export function formatMonthlyReport(r) {
  const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  let m = `📊 <b>Report - ${month}</b>\n\n📈 <b>Income</b>\n`;
  m += r.income.length ? r.income.map(i => `  • ${i.category}: <b>${formatAmount(i.total)}</b>`).join("\n") : "  None";
  m += "\n\n📉 <b>Expenses</b>\n";
  m += r.expenses.length ? r.expenses.map(i => `  • ${i.category}: <b>${formatAmount(i.total)}</b>`).join("\n") : "  None";
  m += `\n━━━━━━━━━━━━━━━━\n💰 Net: <b>${formatAmount(r.totalIncome - r.totalExpenses)}</b>`;
  return m;
}

export function formatBudgetStatus(budgets) {
  if (!budgets.length) return "📋 No budgets set. Use /budget to create one.";
  let m = "📋 <b>Budget Status</b>\n\n";
  for (const b of budgets) {
    const bar = progressBar(b.percentage);
    const icon = b.status === "exceeded" ? "🔴" : b.status === "warning" ? "🟡" : "🟢";
    m += `${icon} <b>${b.category}</b>\n  ${bar} ${formatPercentage(b.percentage)}\n  ${formatAmount(b.spent)} / ${formatAmount(b.limit)}\n\n`;
  }
  return m;
}

export function formatGoals(goals) {
  if (!goals.length) return "🎯 No goals set. Use /goal to create one.";
  let m = "🎯 <b>Savings Goals</b>\n\n";
  for (const g of goals) {
    const pct = (g.current_amount / g.target_amount) * 100;
    m += `🎯 <b>${g.title}</b>\n  ${progressBar(pct)} ${formatPercentage(pct)}\n  ${formatAmount(g.current_amount)} / ${formatAmount(g.target_amount)}\n\n`;
  }
  return m;
}

export function formatTransactionsList(txs) {
  if (!txs.length) return "📜 No transactions yet.";
  let m = "📜 <b>Recent Transactions</b>\n\n";
  for (const t of txs) {
    const icon = t.type === "income" ? "📈" : "📉";
    const date = new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    m += `${icon} <b>${formatAmount(t.amount)}</b> — ${t.category}`;
    if (t.description) m += ` (${t.description})`;
    m += ` · ${date}\n`;
  }
  m += "\nTap a button below to delete:";
  return m;
}

export function getTransactionsKeyboard(txs) {
  const kb = txs.map(t => {
    const icon = t.type === "income" ? "📈" : "📉";
    return [{ text: `${icon} ${formatAmount(t.amount)} ${t.category} — 🗑️`, callback_data: `del_tx_${t.id}` }];
  });
  kb.push([{ text: "🔙 Back", callback_data: "main_menu" }]);
  return { inline_keyboard: kb };
}

export function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "➕ Expense", callback_data: "add_expense" }, { text: "➕ Income", callback_data: "add_income" }],
      [{ text: "📊 Report", callback_data: "monthly_report" }, { text: "💰 Balance", callback_data: "balance" }],
      [{ text: "📋 Budget", callback_data: "budget_menu" }, { text: "🎯 Goals", callback_data: "goals_menu" }],
      [{ text: "📜 Transactions", callback_data: "transactions" }],
    ],
  };
}