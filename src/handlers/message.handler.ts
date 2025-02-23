import { Context } from "telegraf";
import { Message, Update } from "telegraf/typings/core/types/typegram";
import { AIService } from "../services/ai.service";

export class MessageHandler {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Handles text messages
   */
  async handleTextMessage(ctx: Context<Update>) {
    try {
      if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("Sorry, I could not understand your message.");
        return;
      }

      const message = ctx.message;
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

      await ctx.sendChatAction("typing");
      const response = await this.aiService.generateResponse(userId, text);
      await ctx.reply(response);
    } catch (error) {
      console.error("Error handling text message:", error);
      await ctx.reply("Sorry, something went wrong. Please try again.");
    }
  }

  /**
   * Handles photo messages
   */
  async handlePhotoMessage(ctx: Context<Update>) {
    try {
      if (!ctx.message || !("photo" in ctx.message)) {
        await ctx.reply("No photo found in the message.");
        return;
      }

      const message = ctx.message;
      if (!message.from) {
        await ctx.reply("Could not identify user.");
        return;
      }

      if (!message.photo || message.photo.length === 0) {
        await ctx.reply("Something is wrong with this photo!");
        return;
      }

      // Get the highest quality photo
      const photo = message.photo[message.photo.length - 1];

      // Get photo file info
      const fileLink = await ctx.telegram.getFileLink(photo.file_id);
      if (!fileLink) {
        await ctx.reply("No Url found for this photo!");
        return;
      }

      await ctx.sendChatAction("typing");

      const response = await this.aiService.processAndAnalyzeImage({
        imgUrl: fileLink.href,
        prompt: message.caption,
      });
      await ctx.reply(response);
    } catch (error) {
      console.error("Error handling photo message:", error);
      await ctx.reply(
        "Sorry, I encountered an error while processing your photo."
      );
    }
  }
}
