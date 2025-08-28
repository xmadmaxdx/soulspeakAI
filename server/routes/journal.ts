import { RequestHandler } from "express";
import { geminiService } from "../services/geminiService";
import {
  createUser,
  findUserByEmail,
  createJournalEntry as createJournalEntryDB,
  getJournalEntries as getJournalEntriesDB,
  getJournalEntry as getJournalEntryDB,
  createMoodEntry as createMoodEntryDB,
  getMoodEntries as getMoodEntriesDB,
} from "../utils/neon";

async function getOrCreateUser(email: string, username: string = "User") {
  if (!email) {
    throw new Error("Email is required");
  }

  let user = await findUserByEmail(email);

  if (!user) {
    console.log(`👤 Creating new user: ${email}`);
    user = await createUser(email, username);
    if (!user) {
      throw new Error("Failed to create user");
    }
  }

  return user;
}

export const createJournalEntry: RequestHandler = async (req, res) => {
  try {
    const { content, mood, email, userName, tags } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Content is required",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const user = await getOrCreateUser(email, userName || "User");

    const { generateAIResponse } = req.body;

    let aiResponse = "Your thoughts have been safely recorded. 📝";
    let isRealResponse = false;
    let isBackupResponse = false;

    if (generateAIResponse === true) {
      try {
        const rawAiResponse =
          await geminiService.generateEmpathicResponse(content);
        isRealResponse = geminiService.isRealResponse(rawAiResponse);
        isBackupResponse = geminiService.isBackupResponse(rawAiResponse);
        aiResponse = geminiService.cleanResponse(rawAiResponse);
      } catch (error) {
        console.warn(
          "⚠️ AI response generation failed, using fallback:",
          error.message,
        );
        aiResponse =
          "Thank you for sharing your thoughts. Your journal entry has been saved securely. ����";
        isRealResponse = false;
        isBackupResponse = false;
      }
    } else {
    }

    const entry = await createJournalEntryDB(
      user.id,
      content,
      aiResponse,
      mood,
      tags || [],
    );

    if (!entry) {
      throw new Error("Failed to save journal entry");
    }

    const responseType = isBackupResponse
      ? "backup"
      : isRealResponse
        ? "real"
        : "fallback";

    res.json({
      success: true,
      entry: {
        id: entry.id,
        content: entry.content,
        aiResponse: entry.ai_response,
        mood: entry.mood,
        tags: entry.tags || [],
        createdAt: entry.created_at,
      },
      aiResponseType: responseType,
    });
  } catch (error) {
    console.error("Error creating journal entry:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create journal entry",
      details: error.message,
    });
  }
};

export const getJournalEntries: RequestHandler = async (req, res) => {
  try {
    const { email } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const user = await findUserByEmail(email as string);
    if (!user) {
      return res.json({
        success: true,
        entries: [],
        total: 0,
        page,
        totalPages: 0,
      });
    }

    const { entries, total } = await getJournalEntriesDB(user.id, page, limit);

    const totalPages = Math.ceil(total / limit);


    res.json({
      success: true,
      entries: entries.map((entry) => ({
        id: entry.id,
        content: entry.content,
        aiResponse: entry.ai_response,
        mood: entry.mood,
        tags: entry.tags || [],
        createdAt: entry.created_at,
      })),
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch journal entries",
      details: error.message,
    });
  }
};

export const getJournalEntry: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const user = await findUserByEmail(email as string);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const entry = await getJournalEntryDB(id, user.id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        error: "Journal entry not found",
      });
    }


    res.json({
      success: true,
      entry: {
        id: entry.id,
        content: entry.content,
        aiResponse: entry.ai_response,
        mood: entry.mood,
        tags: entry.tags || [],
        createdAt: entry.created_at,
      },
    });
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch journal entry",
      details: error.message,
    });
  }
};

export const getMoodDataFast: RequestHandler = async (req, res) => {
  try {
    const { email } = req.query;
    const days = parseInt(req.query.days as string) || 30;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const user = await getOrCreateUser(email as string);
    const entries = await getMoodEntriesDB(user.id, days);

    const average =
      entries.length > 0
        ? entries.reduce((sum, entry) => sum + entry.mood_level, 0) /
          entries.length
        : 0;

    let trend = "stable";
    if (entries.length >= 4) {
      const midPoint = Math.floor(entries.length / 2);
      const firstHalf = entries.slice(0, midPoint);
      const secondHalf = entries.slice(midPoint);

      const firstAvg =
        firstHalf.reduce((sum, entry) => sum + entry.mood_level, 0) /
        firstHalf.length;
      const secondAvg =
        secondHalf.reduce((sum, entry) => sum + entry.mood_level, 0) /
        secondHalf.length;

      if (secondAvg > firstAvg + 0.5) trend = "improving";
      else if (secondAvg < firstAvg - 0.5) trend = "declining";
    }

    const insights =
      entries.length > 0
        ? `Your mood over the last ${days} days shows an average of ${average.toFixed(1)}/10 with ${trend === "improving" ? "an" : "a"} ${trend} trend. Keep tracking to build meaningful patterns! ✨`
        : "Start tracking your mood to see insights and patterns!";


    res.json({
      success: true,
      entries: entries.map((entry) => ({
        id: entry.id,
        moodLevel: entry.mood_level,
        notes: entry.notes,
        createdAt: entry.created_at,
      })),
      average: Math.round(average * 10) / 10,
      trend,
      totalEntries: entries.length,
      insights,
    });
  } catch (error) {
    console.error("Error fetching mood data (fast):", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch mood data",
      details: error.message,
    });
  }
};

export const getMoodData: RequestHandler = async (req, res) => {
  try {
    const { email } = req.query;
    const days = parseInt(req.query.days as string) || 30;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const user = await getOrCreateUser(email as string);
    const entries = await getMoodEntriesDB(user.id, days);

    const average =
      entries.length > 0
        ? entries.reduce((sum, entry) => sum + entry.mood_level, 0) /
          entries.length
        : 0;

    let trend = "stable";
    if (entries.length >= 4) {
      const midPoint = Math.floor(entries.length / 2);
      const firstHalf = entries.slice(0, midPoint);
      const secondHalf = entries.slice(midPoint);

      const firstAvg =
        firstHalf.reduce((sum, entry) => sum + entry.mood_level, 0) /
        firstHalf.length;
      const secondAvg =
        secondHalf.reduce((sum, entry) => sum + entry.mood_level, 0) /
        secondHalf.length;

      if (secondAvg > firstAvg + 0.5) trend = "improving";
      else if (secondAvg < firstAvg - 0.5) trend = "declining";
    }

    let insights = "";

    try {
      if (entries.length > 0) {
        const recentMoods = entries.slice(-7).map((e) => e.mood_level);
        const moodData = {
          level: average,
          recent: recentMoods,
          timeRange: days,
        };

        const rawInsights = await geminiService.generateMoodInsight(moodData);
        insights = geminiService.cleanResponse(rawInsights);

        const isRealInsight = geminiService.isRealResponse(rawInsights);
        const isBackupInsight = geminiService.isBackupResponse(rawInsights);

      } else {
        insights =
          "Welcome to your mood tracking journey! Start by logging your first mood entry to see personalized AI insights and patterns. Every emotion you track helps you understand yourself better. ✨";
      }
    } catch (error) {
      console.warn(
        "⚠️ AI insight generation failed, using fallback:",
        error.message,
      );
      insights =
        entries.length > 0
          ? `Your mood over the last ${days} days shows an average of ${average.toFixed(1)}/10 with a ${trend} trend. Keep tracking to build meaningful patterns with AI insights! ✨`
          : "Start tracking your mood to see AI-powered insights and patterns!";
    }


    res.json({
      success: true,
      entries: entries.map((entry) => ({
        id: entry.id,
        moodLevel: entry.mood_level,
        notes: entry.notes,
        createdAt: entry.created_at,
      })),
      average: Math.round(average * 10) / 10,
      trend,
      totalEntries: entries.length,
      insights,
    });
  } catch (error) {
    console.error("Error fetching mood data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch mood data",
      details: error.message,
    });
  }
};

export const addMoodEntry: RequestHandler = async (req, res) => {
  console.log("Adding mood entry");

  try {
    const { email, moodLevel, notes, userName } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    if (moodLevel === undefined || moodLevel < 1 || moodLevel > 10) {
      return res.status(400).json({
        success: false,
        error: "Mood level must be between 1 and 10",
      });
    }

    const user = await getOrCreateUser(email, userName || "User");

    const entry = await createMoodEntryDB(user.id, moodLevel, notes);

    if (!entry) {
      throw new Error("Failed to save mood entry");
    }

    const { generateInsights } = req.body; 

    let insight = "Mood logged successfully! 🌟";
    let insightType = "none";

    if (generateInsights === true) {
      try {
        console.log("🤖 Generating mood insight (user requested)...");
        const recentEntries = await getMoodEntriesDB(user.id, 7);
        const recentLevels = recentEntries.map((e) => e.mood_level);

        const moodData = {
          level: moodLevel,
          recent: recentLevels,
          notes,
        };

        const rawInsight = await geminiService.generateMoodInsight(moodData);
        const isRealInsight = geminiService.isRealResponse(rawInsight);
        const isBackupInsight = geminiService.isBackupResponse(rawInsight);
        insight = geminiService.cleanResponse(rawInsight);

        insightType = isBackupInsight
          ? "backup"
          : isRealInsight
            ? "real"
            : "fallback";
        console.log(
          `Mood entry created: ${entry.id} (${insightType.toUpperCase()} AI)`,
        );
      } catch (error) {
        console.warn(
          "⚠️ AI insight generation failed, using fallback:",
          error.message,
        );
        insight =
          "Your mood has been recorded. Keep tracking to build meaningful patterns! ✨";
        insightType = "fallback";
      }
    } else {
      console.log(
        `💾 Mood entry created: ${entry.id} (no AI insights - quota preserved)`,
      );
    }

    res.json({
      success: true,
      entry: {
        id: entry.id,
        moodLevel: entry.mood_level,
        notes: entry.notes,
        createdAt: entry.created_at,
      },
      insight,
      aiResponseType: insightType,
    });
  } catch (error) {
    console.error("Error adding mood entry:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add mood entry",
      details: error.message,
    });
  }
};
