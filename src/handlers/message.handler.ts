import { Context } from "telegraf";
import { Message } from "telegraf/typings/core/types/typegram";
import { AIService } from "../services/ai.service";

export class MessageHandler {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  async handleMessage(ctx: Context) {
    const message = ctx.message as Message.TextMessage;

    if (!message.from) {
      await ctx.reply("Could not identify user.");
      return;
    }

    const userId = message.from.id;
    const text = message.text;

    if (!text) {
      await ctx.reply("Please send me a text message!");
      return;
    }

    try {
      // Show typing indicator
      await ctx.sendChatAction("typing");

      const response = await this.aiService.generateResponse(userId, text);
      await ctx.reply(response);
    } catch (error) {
      console.error("Error handling message:", error);
      await ctx.reply(
        "Sorry, I encountered an error while processing your message."
      );
    }
  }
}
