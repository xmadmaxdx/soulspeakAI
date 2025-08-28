import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter(Boolean);

if (apiKeys.length === 0) {
  console.error(
    "❌ No Gemini API keys found in environment variables. AI features will use fallback responses.",
  );
} else {
  console.log(`✅ Loaded ${apiKeys.length} Gemini API keys for rotation`);
}

export class GeminiService {
  private currentKeyIndex = 0;
  private genAI =
    apiKeys.length > 0 ? new GoogleGenerativeAI(apiKeys[0]) : null;
  private model = this.genAI
    ? this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    : null;
  private keyRotationCooldown: Map<number, number> = new Map(); 

  private rotateApiKey(): boolean {
    const startIndex = this.currentKeyIndex;
    do {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % apiKeys.length;

      const cooldownUntil =
        this.keyRotationCooldown.get(this.currentKeyIndex) || 0;
      if (Date.now() > cooldownUntil) {
        console.log(`🔄 Rotating to API key #${this.currentKeyIndex + 1}`);
        this.genAI = new GoogleGenerativeAI(apiKeys[this.currentKeyIndex]);
        this.model = this.genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
        });
        return true;
      }
    } while (this.currentKeyIndex !== startIndex);

    console.log("⚠️ All API keys are in cooldown");
    return false;
  }

  private markKeyExceeded(): void {
    const cooldownTime = Date.now() + 15 * 60 * 1000;
    this.keyRotationCooldown.set(this.currentKeyIndex, cooldownTime);
    console.log(
      `🚫 API key #${this.currentKeyIndex + 1} marked as quota exceeded until ${new Date(cooldownTime).toLocaleTimeString()}`,
    );
  }

  getApiKeyStatus(): {
    currentKey: number;
    keyStatuses: Array<{
      index: number;
      isAvailable: boolean;
      cooldownUntil?: string;
    }>;
  } {
    const now = Date.now();
    const keyStatuses = apiKeys.map((_, index) => {
      const cooldownUntil = this.keyRotationCooldown.get(index);
      return {
        index: index + 1,
        isAvailable: !cooldownUntil || now > cooldownUntil,
        cooldownUntil: cooldownUntil
          ? new Date(cooldownUntil).toLocaleTimeString()
          : undefined,
      };
    });

    return {
      currentKey: this.currentKeyIndex + 1,
      keyStatuses,
    };
  }

  async generateEmpathicResponse(content: string): Promise<string> {
    return this.generateResponse(content, "empathic");
  }

  async generateCompanionResponse(
    message: string,
    history: Array<{ role: string; content: string }> = [],
  ): Promise<string> {
    return this.generateResponse(message, "companion", history);
  }

  private async generateResponse(
    content: string,
    type: "empathic" | "companion",
    history: Array<{ role: string; content: string }> = [],
  ): Promise<string> {
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      console.warn(
        `⚠️ ${rateLimitCheck.reason} - using backup service instead`,
      );
      try {
        const { backupAIService } = await import("./backupAIService");
        return (
          (await backupAIService.generateResponse(content, type, history)) +
          "||RATE_LIMITED||"
        );
      } catch (error) {
        console.error("❌ Backup AI service failed:", error);
        return this.getContextualFallbackResponse(content) + "||RATE_LIMITED||";
      }
    }

    if (apiKeys.length === 0 || !this.model) {
      console.warn("⚠️ No Gemini API keys available, using backup service...");
      try {
        const { backupAIService } = await import("./backupAIService");
        return await backupAIService.generateResponse(content, type, history);
      } catch (error) {
        console.error("❌ Backup AI service also failed:", error);
        return (
          this.getContextualFallbackResponse(content) + "||FALLBACK_RESPONSE||"
        );
      }
    }

    const isCompanion = type === "companion";

    const prompt = isCompanion
      ? this.createCompanionPrompt(content, history)
      : this.createEmpathicPrompt(content);
    let maxRetries = apiKeys.length;

    while (maxRetries > 0) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        recordAPICall();
        return this.sanitizeResponse(text) + "||REAL_API_RESPONSE||";
      } catch (error) {
        console.error(`❌ Gemini API FAILED for ${type}:`, error);

        const errorStatus =
          (error as any)?.status || (error as any)?.response?.status;
        if (errorStatus === 429) {
          this.markKeyExceeded();
          if (this.rotateApiKey()) {
            maxRetries--;
            continue;
          } else {
            try {
              const { backupAIService } = await import("./backupAIService");
              return await backupAIService.generateResponse(
                content,
                type,
                history,
              );
            } catch (error) {
              console.error("❌ Backup AI service also failed:", error);
              return (
                this.getContextualFallbackResponse(content) +
                "||FALLBACK_RESPONSE||"
              );
            }
          }
        }

        console.warn(`⚠️ Gemini API error (non-quota): ${error.message}`);
        return (
          this.getContextualFallbackResponse(content) + "||FALLBACK_RESPONSE||"
        );
      }
    }

    try {
      const { backupAIService } = await import("./backupAIService");
      return await backupAIService.generateResponse(content, type);
    } catch (error) {
      console.error(`❌ Backup AI service also failed for ${type}:`, error);
      return (
        this.getContextualFallbackResponse(content) + "||FALLBACK_RESPONSE||"
      );
    }
  }

  private getContextualFallbackResponse(journalEntry: string): string {
    const entry = journalEntry.toLowerCase();

    if (
      entry.includes("overwhelm") ||
      entry.includes("stress") ||
      entry.includes("anxio")
    ) {
      return "I can feel the weight you're carrying in these words. When everything feels overwhelming, it's okay to take things one breath at a time. Your feelings are completely valid, and you're showing such strength by reaching out. Remember, you don't have to carry everything alone. 🌙";
    }

    if (
      entry.includes("sad") ||
      entry.includes("depress") ||
      entry.includes("down")
    ) {
      return "I hear the sadness in your words, and I want you to know that it's okay to feel this way. These difficult emotions are part of your human experience, and they don't define your worth. You have the courage to share your pain, which shows incredible strength. Healing takes time, and you're not alone in this journey. 💙";
    }

    if (
      entry.includes("grateful") ||
      entry.includes("happy") ||
      entry.includes("good") ||
      entry.includes("thank")
    ) {
      return "There's something beautiful about the gratitude and positivity I sense in your words. These moments of joy and appreciation are precious gifts that you're choosing to notice and share. Your ability to find light, even in small things, is a testament to your resilience and wisdom. ✨";
    }

    if (
      entry.includes("angry") ||
      entry.includes("frustrat") ||
      entry.includes("mad")
    ) {
      return "I can feel the intensity of your emotions, and anger is such a valid response to the challenges you're facing. These strong feelings often carry important messages about what matters to you. It's okay to feel this way, and expressing it here shows wisdom in finding healthy outlets. 🔥";
    }

    if (
      entry.includes("confused") ||
      entry.includes("uncertain") ||
      entry.includes("don't know")
    ) {
      return "Uncertainty can feel so unsettling, and I hear that confusion in your words. Not knowing what comes next is one of the most human experiences we all share. Your willingness to sit with uncertainty and explore your feelings shows incredible emotional maturity. Trust that clarity will come in its own time. 🌱";
    }

    return "Thank you for sharing something so personal with me. I can feel the sincerity in your words, and your willingness to be vulnerable here shows remarkable courage. Whatever you're experiencing right now is valid and important. You're taking meaningful steps in your healing journey simply by expressing yourself. 💜";
  }

  async generateMoodInsight(moodData: {
    level: number;
    recent: number[];
    notes?: string;
    timeRange?: number;
  }): Promise<string> {
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      console.warn(
        `⚠️ ${rateLimitCheck.reason} - using backup service for mood insights`,
      );
      try {
        const { backupAIService } = await import("./backupAIService");
        const moodInfo = `Level: ${moodData.level}/10, Recent: [${moodData.recent.join(", ")}]${moodData.notes ? `, Notes: "${moodData.notes}"` : ""}`;
        return (
          (await backupAIService.generateResponse(moodInfo, "mood")) +
          "||RATE_LIMITED||"
        );
      } catch (error) {
        console.error("❌ Backup AI service failed for mood insights:", error);
        return (
          this.getMoodFallbackResponse(moodData.level) + "||RATE_LIMITED||"
        );
      }
    }

    if (apiKeys.length === 0 || !this.model) {
      console.warn(
        "⚠️ No Gemini API keys available for mood insight, using backup service...",
      );
      try {
        const { backupAIService } = await import("./backupAIService");
        const moodInfo = `Level: ${moodData.level}/10, Recent: [${moodData.recent.join(", ")}]${moodData.notes ? `, Notes: "${moodData.notes}"` : ""}`;
        return await backupAIService.generateResponse(moodInfo, "mood");
      } catch (error) {
        console.error(
          "❌ Backup AI service also failed for mood insight:",
          error,
        );
        return (
          this.getMoodFallbackResponse(moodData.level) + "||FALLBACK_RESPONSE||"
        );
      }
    }


    const prompt = this.createMoodInsightPrompt(moodData);
    let maxRetries = apiKeys.length;

    while (maxRetries > 0) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        recordAPICall();
        return this.sanitizeResponse(text) + "||REAL_API_RESPONSE||";
      } catch (error) {
        console.error("❌ Gemini AI mood insight error:", error);

        const errorStatus =
          (error as any)?.status || (error as any)?.response?.status;
        if (errorStatus === 429) {
          this.markKeyExceeded();
          if (this.rotateApiKey()) {
            maxRetries--;
            continue;
          } else {
            try {
              const { backupAIService } = await import("./backupAIService");
              const moodInfo = `Level: ${moodData.level}/10, Recent: [${moodData.recent.join(", ")}]${moodData.notes ? `, Notes: "${moodData.notes}"` : ""}`;
              return await backupAIService.generateResponse(moodInfo, "mood");
            } catch (error) {
              console.error(
                "❌ Backup AI service also failed for mood insight:",
                error,
              );
              return (
                this.getMoodFallbackResponse(moodData.level) +
                "||FALLBACK_RESPONSE||"
              );
            }
          }
        }

        return this.getMoodFallbackResponse(moodData.level);
      }
    }
    try {
      const { backupAIService } = await import("./backupAIService");
      const moodInfo = `Level: ${moodData.level}/10, Recent: [${moodData.recent.join(", ")}]${moodData.notes ? `, Notes: "${moodData.notes}"` : ""}`;
      return await backupAIService.generateResponse(moodInfo, "mood");
    } catch (error) {
      console.error(
        "❌ Backup AI service also failed for mood insight:",
        error,
      );
      return (
        this.getMoodFallbackResponse(moodData.level) + "||FALLBACK_RESPONSE||"
      );
    }
  }

  private createEmpathicPrompt(journalEntry: string): string {
    return `You are a caring, empathetic friend responding to someone's personal journal entry. Be supportive and understanding.

Journal entry: "${journalEntry}"

Respond with empathy and care in 2-3 sentences. Be genuine and offer gentle encouragement. No medical advice.`;
  }

  private createCompanionPrompt(
    message: string,
    history: Array<{ role: string; content: string }> = [],
  ): string {
    let conversationContext = "";

    if (history.length > 0) {
      conversationContext = "\n\nCONVERSATION HISTORY:\n";
      history.forEach((msg, index) => {
        const speaker = msg.role === "user" ? "User" : "You (AI)";
        conversationContext += `${speaker}: "${msg.content}"\n`;
      });
      conversationContext +=
        "\nPlease consider this conversation history to provide contextual, continuous support.\n";
    }

    return `You are a compassionate mental health companion AI (Namely SoulSpeak AI). You provide emotional support, active listening, and gentle guidance focused ONLY on mental health and emotional wellbeing.

STRICT GUIDELINES:
- Stay focused on mental health, emotions, and psychological wellbeing
- If asked about non-mental health topics, gently redirect: "I'm here to support your emotional wellbeing. How are you feeling about that?"
- Be empathetic, non-judgmental, and supportive
- Use warm, caring language but remain professional
- Encourage healthy coping strategies
- Never provide medical advice or diagnose
- Keep responses concise but meaningful (2-4 sentences)
- Ask thoughtful follow-up questions to deepen emotional exploration
- Reference previous conversation when relevant to show continuity and understanding${conversationContext}

CURRENT MESSAGE: "${message}"

Respond as a caring mental health companion:`;
  }

  private createMoodInsightPrompt(moodData: {
    level: number;
    recent: number[];
    notes?: string;
    timeRange?: number;
  }): string {
    const average =
      moodData.recent.length > 0
        ? (
            moodData.recent.reduce((a, b) => a + b, 0) / moodData.recent.length
          ).toFixed(1)
        : moodData.level;

    const timeRangeText = moodData.timeRange
      ? `over the last ${moodData.timeRange} days`
      : "recently";

    return `You are providing gentle, encouraging insights about someone's emotional wellbeing based on their mood tracking data.

MOOD DATA:
- Current/Average mood: ${moodData.level}/10
- Time period: ${timeRangeText}
- Recent average: ${average}/10
- Mood history: [${moodData.recent.join(", ")}]
${moodData.notes ? `- Notes: "${moodData.notes}"` : ""}

GUIDELINES:
- Be encouraging and supportive
- Acknowledge patterns with kindness
- Offer gentle perspective and hope
- Keep response under 100 words
- Focus on emotional wellness and self-compassion
- Reference the time period appropriately
- Never provide medical advice

INSIGHT:`;
  }

  private sanitizeResponse(response: string): string {
    const sanitized = response
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#{1,6}\s/g, "")
      .trim();

    if (sanitized.length > 1000) {
      const truncated = sanitized.substring(0, 997);
      const lastSentenceEnd = Math.max(
        truncated.lastIndexOf("."),
        truncated.lastIndexOf("!"),
        truncated.lastIndexOf("?"),
      );

      if (lastSentenceEnd > 500) {
        return truncated.substring(0, lastSentenceEnd + 1);
      } else {
        const lastSpace = truncated.lastIndexOf(" ");
        return truncated.substring(0, lastSpace) + "...";
      }
    }

    return sanitized;
  }

  isRealResponse(response: string): boolean {
    return (
      response.includes("||REAL_API_RESPONSE||") ||
      response.includes("||BACKUP_AI_RESPONSE||")
    );
  }

  isBackupResponse(response: string): boolean {
    return response.includes("||BACKUP_AI_RESPONSE||");
  }

  cleanResponse(response: string): string {
    return response.replace(
      /\|\|(REAL_API_RESPONSE|BACKUP_AI_RESPONSE|FALLBACK_RESPONSE)\|\|/g,
      "",
    );
  }

  private getFallbackResponse(): string {
    const responses = [
      "I hear you, and your feelings are completely valid. Thank you for trusting me with what's in your heart. You're not alone in this journey, and taking time to reflect shows incredible courage. 💜",

      "Your emotions deserve to be acknowledged and honored. Whatever you're feeling right now is part of your unique path to healing. I'm here with you in this moment. ��",

      "Thank you for sharing something so personal. Your willingness to express your truth is a beautiful act of self-care. Remember, you are worthy of love and understanding. ✨",

      "I can feel the depth of your experience in these words. Your courage to be vulnerable is remarkable. Every step toward understanding yourself is meaningful. 💚",

      "Your feelings matter, and so do you. In sharing your truth, you're honoring your emotional experience. Take a gentle breath - you're exactly where you need to be. 🌸",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getMoodFallbackResponse(moodLevel: number): string {
    if (moodLevel <= 3) {
      return "I see you're going through a difficult time. These challenging moments are part of the human experience. Your feelings are valid. Small steps toward self-care can make a difference. 💙";
    } else if (moodLevel <= 6) {
      return "You're navigating through some mixed emotions, and that's perfectly okay. Every day has its ups and downs. Being mindful of your wellbeing shows strength. 🌟";
    } else {
      return "It's beautiful to see you experiencing some positive moments. These brighter feelings are just as important to acknowledge. Celebrate these moments of light. ✨";
    }
  }
}

export const geminiService = new GeminiService();

let healthCheckCache: {
  result: {
    available: boolean;
    workingKeys: number;
    quotaExceeded: number;
    error?: string;
  };
  timestamp: number;
} | null = null;

const API_CALL_TRACKER = {
  calls: [] as number[],
  maxCallsPerHour: 50,
  maxCallsPer5Min: 10,
};

function checkRateLimit(): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const fiveMinAgo = now - 5 * 60 * 1000;

  API_CALL_TRACKER.calls = API_CALL_TRACKER.calls.filter(
    (time) => time > oneHourAgo,
  );

  const recentCalls = API_CALL_TRACKER.calls.filter(
    (time) => time > fiveMinAgo,
  );
  if (recentCalls.length >= API_CALL_TRACKER.maxCallsPer5Min) {
    return {
      allowed: false,
      reason: `Rate limit: ${recentCalls.length}/${API_CALL_TRACKER.maxCallsPer5Min} calls in 5 minutes`,
    };
  }

  if (API_CALL_TRACKER.calls.length >= API_CALL_TRACKER.maxCallsPerHour) {
    return {
      allowed: false,
      reason: `Rate limit: ${API_CALL_TRACKER.calls.length}/${API_CALL_TRACKER.maxCallsPerHour} calls in 1 hour`,
    };
  }

  return { allowed: true };
}

function recordAPICall(): void {
  API_CALL_TRACKER.calls.push(Date.now());
}

const HEALTH_CHECK_CACHE_DURATION = 10 * 60 * 1000; 

export async function testGeminiConnection(): Promise<{
  available: boolean;
  workingKeys: number;
  quotaExceeded: number;
  error?: string;
}> {
  if (
    healthCheckCache &&
    Date.now() - healthCheckCache.timestamp < HEALTH_CHECK_CACHE_DURATION
  ) {
    console.log(
      `📋 Using cached health check result (${Math.round((Date.now() - healthCheckCache.timestamp) / 1000)}s old)`,
    );
    return healthCheckCache.result;
  }

  if (apiKeys.length === 0) {
    const result = {
      available: false,
      workingKeys: 0,
      quotaExceeded: 0,
      error: "No API keys configured",
    };

    healthCheckCache = {
      result,
      timestamp: Date.now(),
    };

    return result;
  }

  let workingKeys = 0;
  let quotaExceeded = 0;
  let lastError = "";

  console.log(`🔍 Testing ${apiKeys.length} API keys (fresh check)...`);

  for (let i = 0; i < apiKeys.length; i++) {
    try {
      const genAI = new GoogleGenerativeAI(apiKeys[i]);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const testPromise = (async () => {
        const result = await model.generateContent("Test");
        const response = await result.response;
        await response.text();
      })();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Health check timeout")), 10000),
      );

      await Promise.race([testPromise, timeoutPromise]);

      workingKeys++;
      console.log(`✅ API key #${i + 1} working`);
    } catch (error: any) {
      console.log(`⚠️ API key #${i + 1} failed:`, error.message || error);
      lastError = error.message || String(error);

      if (
        error.status === 429 ||
        lastError.includes("quota") ||
        lastError.includes("429")
      ) {
        quotaExceeded++;
        console.log(`⚠️ API key #${i + 1} quota exceeded`);
      }
    }
  }

  console.log(
    `🔍 Health check complete: ${workingKeys} working, ${quotaExceeded} quota exceeded, ${apiKeys.length - workingKeys - quotaExceeded} failed`,
  );

  const result = {
    available: workingKeys > 0 || quotaExceeded > 0,
    workingKeys,
    quotaExceeded,
    error: workingKeys === 0 && quotaExceeded === 0 ? lastError : undefined,
  };

  healthCheckCache = {
    result,
    timestamp: Date.now(),
  };

  return result;
}

export function clearHealthCheckCache(): void {
  healthCheckCache = null;
  console.log("🗑️ Health check cache cleared");
}

export function getCachedHealthStatus(): {
  available: boolean;
  workingKeys: number;
  quotaExceeded: number;
  error?: string;
  isCached: boolean;
  cacheAge?: number;
} | null {
  if (!healthCheckCache) {
    return null;
  }

  const cacheAge = Date.now() - healthCheckCache.timestamp;

  return {
    ...healthCheckCache.result,
    isCached: true,
    cacheAge: Math.round(cacheAge / 1000), 
  };
}
