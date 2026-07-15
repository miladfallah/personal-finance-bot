import "dotenv/config";
import { Bot } from "grammy";
import "./db.js";
import { handleStart, handleBudget, handleGoal } from "./handlers/command.js";
import { handleMessage } from "./handlers/message.js";
import { handleCallbackQuery, handleStateInput } from "./handlers/callback_query.js";
import { handleInlineQuery } from "./handlers/inline_query.js";
import { getMainMenuKeyboard } from "./lib/formatter.js";

const bot = new Bot(process.env.BOT_TOKEN);

// ─── Commands ───
bot.command("start", handleStart);
bot.command("help", async (ctx) => {
  await ctx.reply(
    `📖 <b>راهنمای ربات</b>\n\n` +
    `💬 <b>ثبت تراکنش:</b>\n` +
    `  <code>۲۵۰۰۰ غذا شام</code> — ثبت هزینه\n` +
    `  <code>درآمد ۳۰۰۰۰۰۰۰ حقوق</code> — ثبت درآمد\n\n` +
    `📌 <b>دستورات:</b>\n` +
    `  /start — منوی اصلی\n` +
    `  /budget — مدیریت بودجه\n` +
    `  /budget غذا ۵۰۰۰۰۰۰ — تنظیم بودجه\n` +
    `  /goal — مدیریت اهداف\n` +
    `  /goal ماشین ۵۰۰۰۰۰۰۰۰ — ایجاد هدف\n` +
    `  /help — این راهنما\n\n` +
    `🏷️ <b>دسته‌بندی‌ها:</b>\n` +
    `  غذا 🍽️ · حمل‌ونقل 🚕 · خرید 🛍️ · قبوض 📄\n` +
    `  بهداشت 🏥 · آموزش 📚 · سفر ✈️ · هدیه 🎁\n\n` +
    `💡 نکته: فقط کافیه مبلغ و دسته رو بنویسید!`,
    { parse_mode: "HTML", reply_markup: getMainMenuKeyboard() }
  );
});
bot.command("budget", handleBudget);
bot.command("goal", handleGoal);

// ─── Handlers ───
bot.on("callback_query", handleCallbackQuery);
bot.on("inline_query", handleInlineQuery);
bot.on("message:text", (ctx) => {
  if (handleStateInput(ctx)) return;
  handleMessage(ctx);
});

// ─── Error Handler ───
bot.catch((err) => console.error("Bot error:", err));

console.log("Starting bot...");
bot.start({ onStart: () => console.log("Bot is running!") });