import { getOrCreateUser, getBalance } from "../lib/finance.js";
import { formatAmount } from "../lib/formatter.js";

export async function handleInlineQuery(ctx) {
  const user = getOrCreateUser(ctx.from.id, ctx.from.first_name, ctx.from.username);
  const balance = await getBalance(user.id);

  const results = [
    {
      type: "article",
      id: "balance",
      title: `💰 موجودی: ${formatAmount(balance.balance)} تومان`,
      description: `درآمد: ${formatAmount(balance.totalIncome)} | هزینه: ${formatAmount(balance.totalExpenses)}`,
      input_message_content: {
        message_text: `💰 <b>موجودی فعلی</b>\n\n📈 درآمد: <b>${formatAmount(balance.totalIncome)}</b>\n📉 هزینه: <b>${formatAmount(balance.totalExpenses)}</b>\n💎 مانده: <b>${formatAmount(balance.balance)}</b>`,
        parse_mode: "HTML"
      }
    },
    {
      type: "article",
      id: "expense_hint",
      title: "💸 ثبت سریع هزینه",
      description: "فرمت: مبلغ دسته توضیح",
      input_message_content: {
        message_text: "برای ثبت هزینه بنویسید:\n<code>۲۵۰۰۰ غذا شام</code>",
        parse_mode: "HTML"
      }
    },
    {
      type: "article",
      id: "income_hint",
      title: "💰 ثبت سریع درآمد",
      description: "فرمت: درآمد مبلغ دسته",
      input_message_content: {
        message_text: "برای ثبت درآمد بنویسید:\n<code>درآمد ۳۰۰۰۰۰۰۰ حقوق</code>",
        parse_mode: "HTML"
      }
    }
  ];

  await ctx.answerInlineQuery(results.slice(0, 10));
}