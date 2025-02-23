import OpenAI from "openai";
import { Message } from "telegraf/typings/core/types/typegram";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export class AIService {
  private readonly AI_MODELS = {
    CHAT: "gpt-4o-mini",
    VISION: "gpt-4o-mini",
  } as const;

  private readonly SUPPORTED_EXTENSIONS = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
  ] as const;

  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY must be provided!");
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private validateImageExtension(filePath: string): void {
    const extension = filePath.toLowerCase().match(/\.[^.]+$/)?.[0];

    if (!extension) {
      throw new Error("Could not determine image format");
    }

    if (
      !this.SUPPORTED_EXTENSIONS.includes(
        extension as (typeof this.SUPPORTED_EXTENSIONS)[number]
      )
    ) {
      const supportedFormats = this.SUPPORTED_EXTENSIONS.map((ext) =>
        ext.slice(1).toUpperCase()
      ).join(", ");
      throw new Error(
        `Unsupported image format. Image must be one of: ${supportedFormats}`
      );
    }

    console.log("Image extension is valid");
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
        model: this.AI_MODELS.CHAT,
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

  async processAndAnalyzeImage({
    imgUrl,
    prompt,
  }: {
    imgUrl: string;
    prompt?: string;
  }): Promise<string> {
    // Validate image extension
    this.validateImageExtension(imgUrl);

    try {
      const response = await this.openai.chat.completions.create({
        model: this.AI_MODELS.VISION,
        messages: [
          {
            role: "system",
            content: process.env.SYSTEM_PROMPT || "",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt || "What's in this image? Describe it.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imgUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      });

      return (
        response.choices[0]?.message?.content ||
        "Sorry, I could not analyze the image."
      );
    } catch (error) {
      console.error("Error analyzing image:", error);
      throw new Error("Failed to analyze image");
    }
  }
}
