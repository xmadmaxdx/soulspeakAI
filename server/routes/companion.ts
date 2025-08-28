import { RequestHandler } from "express";
import { geminiService } from "../services/geminiService";
import {
  findUserByEmail,
  getJournalEntries as getJournalEntriesDB,
  getMoodEntries as getMoodEntriesDB,
} from "../utils/neon";

export const getCompanionAnalytics: RequestHandler = async (req, res) => {
  console.log("Fetching companion analytics");

  try {
    const { userEmail, timeframe } = req.query;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        error: "User email is required",
      });
    }

    const timeframeToDays = {
      week: 7,
      month: 30,
      year: 365,
    };
    const days = timeframeToDays[timeframe as string] || 30;

    const user = await findUserByEmail(userEmail as string);
    if (!user) {
      return res.json({
        success: true,
        analytics: {
          totalConversations: 0,
          totalMessages: 0,
          averageMessagesPerConversation: 0,
          mostActiveDay: "—",
          averageMood: 0,
          moodTrend: "stable",
          sentimentDistribution: { positive: 33, neutral: 34, negative: 33 },
          keyThemes: [],
          tokensUsed: 0,
          dailyActivity: [],
          insights: {
            streakDays: 0,
            mostProductiveTime: "No data",
            engagementLevel: "Just getting started",
            totalActiveDays: 0,
            averageMessagesPerActiveDay: 0,
          },
        },
      });
    }

    const { entries: journalEntries } = await getJournalEntriesDB(
      user.id,
      1,
      100,
    );
    const moodEntries = await getMoodEntriesDB(user.id, days);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentJournalEntries = journalEntries.filter(
      (entry) => new Date(entry.created_at) >= cutoffDate,
    );

    const totalConversations = recentJournalEntries.length;
    const totalMessages = totalConversations * 2;
    const averageMessagesPerConversation = totalConversations > 0 ? 2 : 0;

    const averageMood =
      moodEntries.length > 0
        ? moodEntries.reduce((sum, entry) => sum + entry.mood_level, 0) /
          moodEntries.length
        : 0;

    let moodTrend = "stable";
    if (moodEntries.length >= 4) {
      const midPoint = Math.floor(moodEntries.length / 2);
      const firstHalf = moodEntries.slice(0, midPoint);
      const secondHalf = moodEntries.slice(midPoint);

      const firstAvg =
        firstHalf.reduce((sum, entry) => sum + entry.mood_level, 0) /
        firstHalf.length;
      const secondAvg =
        secondHalf.reduce((sum, entry) => sum + entry.mood_level, 0) /
        secondHalf.length;

      if (secondAvg > firstAvg + 0.5) moodTrend = "improving";
      else if (secondAvg < firstAvg - 0.5) moodTrend = "declining";
    }

    const dailyActivity = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayJournalEntries = recentJournalEntries.filter(
        (entry) => entry.created_at.split("T")[0] === dateStr,
      );
      const dayMoodEntries = moodEntries.filter(
        (entry) => entry.created_at.split("T")[0] === dateStr,
      );

      const avgMood =
        dayMoodEntries.length > 0
          ? dayMoodEntries.reduce((sum, entry) => sum + entry.mood_level, 0) /
            dayMoodEntries.length
          : 0;

      dailyActivity.push({
        date: dateStr,
        messages: dayJournalEntries.length * 2,
        avgMood: Number(avgMood.toFixed(1)),
      });
    }

    const mostActiveDay = dailyActivity.reduce(
      (max, day) => (day.messages > max.messages ? day : max),
      { date: "—", messages: 0 },
    ).date;

    const activeDays = dailyActivity.filter((day) => day.messages > 0);
    const totalActiveDays = activeDays.length;
    const averageMessagesPerActiveDay =
      totalActiveDays > 0 ? Math.round(totalMessages / totalActiveDays) : 0;

    let streakDays = 0;
    for (let i = dailyActivity.length - 1; i >= 0; i--) {
      if (dailyActivity[i].messages > 0) {
        streakDays++;
      } else {
        break;
      }
    }

    let engagementLevel = "Just getting started";
    if (totalConversations >= 20) engagementLevel = "Highly engaged";
    else if (totalConversations >= 10) engagementLevel = "Regularly active";
    else if (totalConversations >= 5) engagementLevel = "Getting into rhythm";

    console.log(
      `Analytics generated: ${totalConversations} conversations, ${totalMessages} messages`,
    );

    res.json({
      success: true,
      analytics: {
        totalConversations,
        totalMessages,
        averageMessagesPerConversation,
        mostActiveDay,
        averageMood: Math.round(averageMood * 10) / 10,
        moodTrend,
        sentimentDistribution: {
          positive: Math.max(20, Math.min(50, Math.round(averageMood * 5))),
          neutral: 40,
          negative: Math.max(
            10,
            Math.min(40, 60 - Math.round(averageMood * 5)),
          ),
        },
        keyThemes: ["Self-reflection", "Emotional wellness", "Personal growth"],
        tokensUsed: totalMessages * 150,
        dailyActivity,
        insights: {
          streakDays,
          mostProductiveTime: totalActiveDays > 0 ? "Evening" : "No data",
          engagementLevel,
          totalActiveDays,
          averageMessagesPerActiveDay,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching companion analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics",
      details: error.message,
    });
  }
};

export const sendChatMessage: RequestHandler = async (req, res) => {
  console.log("💬 Processing chat message");

  try {
    const { message, history } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    console.log("🤖 Generating AI companion response with context...");

    const rawResponse = await geminiService.generateCompanionResponse(
      message,
      history || [],
    );
    const isRealResponse = geminiService.isRealResponse(rawResponse);
    const aiResponse = geminiService.cleanResponse(rawResponse);

    console.log(
      `Chat response generated (${isRealResponse ? "REAL AI" : "FALLBACK"}) with ${history?.length || 0} context messages`,
    );

    res.json({
      success: true,
      response: aiResponse,
      aiResponseType: isRealResponse ? "real" : "fallback",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error processing chat message:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process chat message",
      details: error.message,
    });
  }
};

export const getOrCreateConversation: RequestHandler = (req, res) => {
  res.status(410).json({
    success: false,
    error: "Conversation history feature has been removed",
    message: "Use the direct chat endpoint instead",
  });
};

export const getConversations: RequestHandler = (req, res) => {
  res.status(410).json({
    success: false,
    error: "Conversation history feature has been removed",
    message: "Use the direct chat endpoint instead",
  });
};

export const getConversationMessages: RequestHandler = (req, res) => {
  res.status(410).json({
    success: false,
    error: "Conversation history feature has been removed",
    message: "Use the direct chat endpoint instead",
  });
};
