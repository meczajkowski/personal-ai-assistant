declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      PORT: string;
      TELEGRAM_BOT_TOKEN: string;
      OPENAI_API_KEY: string;
    }
  }
}
