import OpenAI from "openai";
import BaseAdapter from "./BaseAdapter.js";

class OpenAIAdapter extends BaseAdapter {
  constructor(config) {
    super(config);
    this.apiKey = config.openAIApiKey;
    this.model = config.openAIModel;
    this.apiUrl = config.openAIApiUrl || "https://api.openai.com/v1"; 
  }

  async generateResponse(command) {
    try {
      const openai = new OpenAI({
        apiKey: this.apiKey,
        baseURL: this.apiUrl, 
      });

      this.messages.push({
        role: "user",
        content: command,
      });

      const response = await openai.chat.completions.create({
        messages: this.messages,
        model: this.model,
      });

      let content = response.choices[0].message.content;
      this.messages.push(response.choices[0].message);
      this.logger.info(`SERVER RESPONSE ${content}`);

      return content;
    } catch (error) {
      this.logger.error("Failed to chat: " + error.message);
    }
  }
}

export default OpenAIAdapter;
