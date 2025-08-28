export class BackupAIService {
  private apiKey = process.env.BACKUP_AI_KEY;
  private baseURL =
    process.env.BACKUP_AI_BASE_URL || "https://api.aimlapi.com/v1";

  private models = [
    "google/gemma-3n-e4b-it",
    "openai/gpt-oss-20b",
    "openai/gpt-5-mini-2025-08-07",
    "zhipu/glm-4.5",
    "qwen3-235b-a22b-thinking-2507",
  ];

  async generateResponse(
    content: string,
    type: "empathic" | "companion" | "mood",
    history: Array<{ role: string; content: string }> = [],
  ): Promise<string> {
    if (!this.apiKey) {
      console.warn("⚠️ Backup AI key not configured, using fallback response");
      return this.getFallbackResponse(type) + "||FALLBACK_RESPONSE||";
    }

    const prompt = this.createPrompt(content, type);

    for (let i = 0; i < this.models.length; i++) {
      const model = this.models[i];

      try {
        console.log(
          `Trying model: ${model} (${i + 1}/${this.models.length})`,
        );

        const response = await fetch(`${this.baseURL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
            top_p: 0.7,
            frequency_penalty: 1,
            max_tokens: 500,
            top_k: 50,
          }),
        });

        if (!response.ok) {
          console.warn(
            `⚠️ Model ${model} failed with status: ${response.status}`,
          );
          continue;
        }

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content;

        if (!aiResponse) {
          console.warn(`⚠️ Model ${model} returned no content`);
          continue;
        }

        console.log(
          `✅ Backup AI response generated successfully using ${model}`,
        );
        return this.sanitizeResponse(aiResponse) + "||BACKUP_AI_RESPONSE||";
      } catch (error) {
        console.warn(`⚠️ Model ${model} failed:`, error.message);
        continue;
      }
    }

    console.error("All backup AI models failed, using fallback response");
    return this.getFallbackResponse(type) + "||FALLBACK_RESPONSE||";
  }

  private createPrompt(
    content: string,
    type: "empathic" | "companion" | "mood",
  ): string {
    switch (type) {
      case "empathic":
        return `You are a caring, empathetic friend (Namely SoulSpeak AI) responding to someone's personal journal entry. Be supportive and understanding.

Journal entry: "${content}"

Respond with empathy and care in 2-3 sentences. Be genuine and offer gentle encouragement. No medical advice.`;

      case "companion":
        return `You are a compassionate mental health companion AI. You provide emotional support, active listening, and gentle guidance focused ONLY on mental health and emotional wellbeing.

STRICT GUIDELINES:
- Stay focused on mental health, emotions, and psychological wellbeing
- If asked about non-mental health topics, gently redirect: "I'm here to support your emotional wellbeing. How are you feeling about that?"
- Be empathetic, non-judgmental, and supportive
- Use warm, caring language but remain professional
- Encourage healthy coping strategies
- Never provide medical advice or diagnose
- Keep responses concise but meaningful (2-4 sentences)
- Ask thoughtful follow-up questions to deepen emotional exploration

CURRENT MESSAGE: "${content}"

Respond as a caring mental health companion:`;

      case "mood":
        return `You are providing gentle, encouraging insights about someone's emotional wellbeing based on their mood information.

MOOD INFORMATION: ${content}

GUIDELINES:
- Be encouraging and supportive
- Acknowledge patterns with kindness
- Offer gentle perspective and hope
- Keep response under 100 words
- Focus on emotional wellness and self-compassion
- Never provide medical advice

INSIGHT:`;

      default:
        return content;
    }
  }

  private sanitizeResponse(response: string): string {
    const cleaned = response
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#{1,6}\s/g, "")
      .trim();

    if (cleaned.length > 800) {
      const truncated = cleaned.substring(0, 800);
      const lastSentenceEnd = Math.max(
        truncated.lastIndexOf("."),
        truncated.lastIndexOf("!"),
        truncated.lastIndexOf("?"),
      );

      if (lastSentenceEnd > 400) {
        return truncated.substring(0, lastSentenceEnd + 1);
      } else {
        const lastSpace = truncated.lastIndexOf(" ");
        return truncated.substring(0, lastSpace) + "...";
      }
    }

    return cleaned;
  }

  private getFallbackResponse(type: "empathic" | "companion" | "mood"): string {
    switch (type) {
      case "empathic":
        return "I hear you, and your feelings are completely valid. Thank you for trusting me with what's in your heart. You're not alone in this journey. 💜";
      case "companion":
        return "I'm here to listen and support you. Your emotional wellbeing matters, and it's okay to feel whatever you're experiencing right now. How can I help you process these feelings?";
      case "mood":
        return "Thank you for tracking your mood. Being mindful of your emotional patterns shows great self-awareness. Every feeling is valid and part of your journey. 🌟";
      default:
        return "I'm here to support you. Your feelings matter, and you're not alone. 💚";
    }
  }

  isBackupResponse(response: string): boolean {
    return response.includes("||BACKUP_AI_RESPONSE||");
  }

  cleanResponse(response: string): string {
    return response.replace(
      /\|\|(BACKUP_AI_RESPONSE|FALLBACK_RESPONSE)\|\|/g,
      "",
    );
  }
}

export const backupAIService = new BackupAIService();
