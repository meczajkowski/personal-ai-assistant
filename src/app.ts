import "dotenv/config";
import express, { Request, Response } from "express";
import { Telegraf, Context } from "telegraf";

const app = express();

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN must be provided!");
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Bot commands
bot.command("start", async (ctx: Context) => {
  await ctx.reply("Welcome to your Telegram bot! 🤖");
});

bot.command("help", async (ctx: Context) => {
  await ctx.reply(
    "Available commands:\n/start - Start the bot\n/help - Show this help message"
  );
});

// Error handling
bot.catch(async (err: unknown, ctx: Context) => {
  console.error("Bot error:", err);
  await ctx.reply("Oops! Something went wrong.");
});

// Launch bot
bot
  .launch()
  .then(() => {
    console.log("Bot is running!");
  })
  .catch((err: Error) => {
    console.error("Failed to start bot:", err);
  });

// Express routes
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
