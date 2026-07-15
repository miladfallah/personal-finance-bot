// ─── Persian number formatting ───
export function formatAmount(amount) {
  if (!amount) return "۰";
  const isNeg = amount < 0;
  const abs = Math.abs(amount);
  let f;
  if (abs >= 1e9) f = (abs / 1e9).toFixed(1).replace(/\.0$/, "") + " میلیارد";
  else if (abs >= 1e6) f = (abs / 1e6).toFixed(1).replace(/\.0$/, "") + " میلیون";
  else f = abs.toLocaleString("fa-IR", { maximumFractionDigits: 0 });
  return isNeg ? `${f}-` : f;
}

// ─── Persian date ───
function persianDate(ts) {
  if (!ts) return "";
  const d = new Date(ts * 1000);
  return d.toLocaleDateString("fa-IR", { month: "short", day: "numeric" });
}

export function formatPercentage(v) { return v != null ? `${Math.round(v)}٪` : "۰٪"; }

export function progressBar(pct, len = 12) {
  const filled = Math.min(Math.round((pct / 100) * len), len);
  return "▰".repeat(filled) + "▱".repeat(len - filled);
}

export function formatTransaction(d) {
  const icon = d.type === "income" ? "📈" : "📉";
  const typeLabel = d.type === "income" ? "درآمد" : "هزینه";
  let m = `${icon} <b>${typeLabel} ثبت شد!</b>\n`;
  m += `┌─────────────────┐\n`;
  m += `│ 💰 مبلغ: <b>${formatAmount(d.amount)} تومان</b>\n`;
  m += `│ 📂 دسته: <b>${d.category}</b>\n`;
  if (d.description) m += `│ 📝 توضیح: ${d.description}\n`;
  m += `└─────────────────┘`;
  return m;
}

export function formatBalance(b) {
  let m = `╔═══════════════════════╗\n`;
  m += `║   💰 <b>وضعیت مالی</b>\n`;
  m += `╠═══════════════════════╣\n`;
  m += `║ 📈 درآمد: <b>${formatAmount(b.totalIncome)}</b>\n`;
  m += `║ 📉 هزینه: <b>${formatAmount(b.totalExpenses)}</b>\n`;
  m += `╠═══════════════════════╣\n`;
  m += `║ 💎 مانده: <b>${formatAmount(b.balance)}</b>\n`;
  m += `╚═══════════════════════╝`;
  return m;
}

export function formatMonthlyReport(r) {
  const month = new Date().toLocaleDateString("fa-IR", { month: "long", year: "numeric" });
  let m = `📊 <b>گزارش ${month}</b>\n\n`;

  m += `📈 <b>درآمدها</b>\n`;
  if (r.income.length) {
    for (const i of r.income) m += `  ├ ${i.category}: <b>${formatAmount(i.total)}</b>\n`;
  } else m += `  └ هیچ درآمدی ثبت نشده\n`;

  m += `\n📉 <b>هزینه‌ها</b>\n`;
  if (r.expenses.length) {
    for (const i of r.expenses) m += `  ├ ${i.category}: <b>${formatAmount(i.total)}</b>\n`;
  } else m += `  └ هیچ هزینه‌ای ثبت نشده\n`;

  m += `\n━━━━━━━━━━━━━━━━━━━\n`;
  m += `💰 <b>خالص: ${formatAmount(r.totalIncome - r.totalExpenses)}</b>`;
  return m;
}

export function formatBudgetStatus(budgets) {
  if (!budgets.length) return "📋 بودجه‌ای تنظیم نشده.\nاز /budget استفاده کنید.";
  let m = `╔═══════════════════════╗\n`;
  m += `║   📋 <b>وضعیت بودجه</b>\n`;
  m += `╚═══════════════════════╝\n\n`;

  for (const b of budgets) {
    const bar = progressBar(b.percentage);
    const icon = b.status === "exceeded" ? "🔴" : b.status === "warning" ? "🟡" : "🟢";
    m += `${icon} <b>${b.category}</b>\n`;
    m += `  ${bar} ${formatPercentage(b.percentage)}\n`;
    m += `  ${formatAmount(b.spent)} / ${formatAmount(b.limit)}\n\n`;
  }
  return m;
}

export function formatGoals(goals) {
  if (!goals.length) return "🎯 هدفی تنظیم نشده.\nاز /goal استفاده کنید.";
  let m = `╔═══════════════════════╗\n`;
  m += `║   🎯 <b>اهداف پس‌انداز</b>\n`;
  m += `╚═══════════════════════╝\n\n`;

  for (const g of goals) {
    const pct = (g.current_amount / g.target_amount) * 100;
    const bar = progressBar(pct);
    m += `🎯 <b>${g.title}</b>\n`;
    m += `  ${bar} ${formatPercentage(pct)}\n`;
    m += `  ${formatAmount(g.current_amount)} / ${formatAmount(g.target_amount)}\n\n`;
  }
  return m;
}

export function formatTransactionsList(txs) {
  if (!txs.length) return "📜 تراکنشی ثبت نشده.";
  let m = `╔═══════════════════════╗\n`;
  m += `║   📜 <b>تراکنش‌های اخیر</b>\n`;
  m += `╚═══════════════════════╝\n\n`;

  for (const t of txs) {
    const icon = t.type === "income" ? "📈" : "📉";
    const date = persianDate(t.created_at);
    m += `${icon} <b>${formatAmount(t.amount)}</b> — ${t.category}`;
    if (t.description) m += ` (${t.description})`;
    m += ` · ${date}\n`;
  }
  m += `\n⬇️ روی دکمه زیر بزنید تا حذف کنید:`;
  return m;
}

export function formatWeeklyReport(r) {
  let m = `📊 <b>گزارش هفتگی</b>\n\n`;
  m += `📈 <b>درآمد:</b> ${formatAmount(r.totalIncome)}\n`;
  m += `📉 <b>هزینه:</b> ${formatAmount(r.totalExpenses)}\n`;
  m += `━━━━━━━━━━━━━━━━━━━\n`;
  m += `💰 <b>خالص: ${formatAmount(r.totalIncome - r.totalExpenses)}</b>`;

  if (r.topExpenses.length) {
    m += `\n\n🏷️ <b>بیشترین هزینه‌ها:</b>\n`;
    for (const e of r.topExpenses.slice(0, 5)) {
      m += `  • ${e.category}: ${formatAmount(e.total)}\n`;
    }
  }
  return m;
}

export function formatStats(r) {
  let m = `╔═══════════════════════╗\n`;
  m += `║   📈 <b>آمار کلی</b>\n`;
  m += `╚═══════════════════════╝\n\n`;
  m += `📊 کل تراکنش‌ها: <b>${r.totalCount}</b>\n`;
  m += `📈 کل درآمد: <b>${formatAmount(r.totalIncome)}</b>\n`;
  m += `📉 کل هزینه: <b>${formatAmount(r.totalExpenses)}</b>\n`;
  m += `💰 مانده کل: <b>${formatAmount(r.balance)}</b>\n`;
  m += `📅 روز فعال: <b>${r.activeDays}</b>\n`;

  if (r.avgDailyExpense > 0) {
    m += `📈 میانگین هزینه روزانه: <b>${formatAmount(r.avgDailyExpense)}</b>\n`;
  }
  if (r.topCategory) {
    m += `🏆 بیشترین هزینه: <b>${r.topCategory}</b>\n`;
  }
  return m;
}

export function getTransactionsKeyboard(txs) {
  const kb = txs.map(t => {
    const icon = t.type === "income" ? "📈" : "📉";
    return [{ text: `${icon} ${formatAmount(t.amount)} ${t.category} — 🗑️`, callback_data: `del_tx_${t.id}` }];
  });
  kb.push([{ text: "🔙 بازگشت", callback_data: "main_menu" }]);
  return { inline_keyboard: kb };
}

export function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "➕ ثبت هزینه", callback_data: "add_expense" },
        { text: "➕ ثبت درآمد", callback_data: "add_income" }
      ],
      [
        { text: "📊 گزارش ماهانه", callback_data: "monthly_report" },
        { text: "💰 موجودی", callback_data: "balance" }
      ],
      [
        { text: "📋 بودجه", callback_data: "budget_menu" },
        { text: "🎯 اهداف", callback_data: "goals_menu" }
      ],
      [
        { text: "📜 تراکنش‌ها", callback_data: "transactions" },
        { text: "📈 آمار کلی", callback_data: "stats" }
      ],
      [
        { text: "📅 گزارش هفتگی", callback_data: "weekly_report" }
      ],
    ],
  };
}