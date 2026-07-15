import { getOrCreateUser, getBalance } from "../lib/finance.js";
import { formatAmount } from "../lib/formatter.js";

export async function handleInlineQuery(ctx) {
  const user = getOrCreateUser(ctx.from.id, ctx.from.first_name, ctx.from.username);
  const balance = await getBalance(user.id);

  const results = [
    {
      type: "article", id: "balance",
      title: `💰 Balance: ${formatAmount(balance.balance)}`,
      description: `Income: ${formatAmount(balance.totalIncome)} | Expenses: ${formatAmount(balance.totalExpenses)}`,
      input_message_content: { message_text: `💰 <b>Balance</b>\n\nBalance: <b>${formatAmount(balance.balance)}</b>\nIncome: ${formatAmount(balance.totalIncome)}\nExpenses: ${formatAmount(balance.totalExpenses)}`, parse_mode: "HTML" }
    },
    {
      type: "article", id: "expense_hint",
      title: "💸 Quick Expense",
      description: "Type: amount category description",
      input_message_content: { message_text: "To add expense: <code>25000 food dinner</code>", parse_mode: "HTML" }
    }
  ];

  await ctx.answerInlineQuery(results.slice(0, 10));
}