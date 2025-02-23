import OpenAI from "openai";
import { Message } from "telegraf/typings/core/types/typegram";

export class AIService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY must be provided!");
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(userId: number, message: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: process.env.SYSTEM_PROMPT || "",
          },
          {
            role: "user",
            content: message,
          },
        ],
        model: "gpt-4o-mini",
        temperature: 0.9,
        max_tokens: 500,
      });

      const response =
        completion.choices[0]?.message?.content ||
        "Sorry, I could not generate a response.";

      return response;
    } catch (error) {
      console.error("Error generating AI response:", error);
      throw new Error("Failed to generate AI response");
    }
  }
}
