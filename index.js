import "dotenv/config";
import { Bot } from "grammy";
import "./db.js";
import { handleStart, handleBudget, handleGoal } from "./handlers/command.js";
import { handleMessage } from "./handlers/message.js";
import { handleCallbackQuery, handleStateInput } from "./handlers/callback_query.js";
import { handleInlineQuery } from "./handlers/inline_query.js";

const bot = new Bot(process.env.BOT_TOKEN);

bot.command("start", handleStart);
bot.command("budget", handleBudget);
bot.command("goal", handleGoal);
bot.on("callback_query", handleCallbackQuery);
bot.on("inline_query", handleInlineQuery);
bot.on("message:text", (ctx) => {
  if (handleStateInput(ctx)) return;
  handleMessage(ctx);
});

bot.catch((err) => console.error("Bot error:", err));
console.log("Starting bot...");
bot.start({ onStart: () => console.log("Bot is running!") });