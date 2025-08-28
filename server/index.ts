import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  createJournalEntry,
  getJournalEntries,
  getJournalEntry,
  getMoodData,
  getMoodDataFast,
  addMoodEntry,
} from "./routes/journal";
import {
  getOrCreateConversation,
  getConversations,
  getConversationMessages,
  sendChatMessage,
  getCompanionAnalytics,
} from "./routes/companion";
import { getUserProfile, updateUserProfile } from "./routes/user";
import { initializeNeonDatabase } from "./utils/neon";

let usingNeonDatabase = false;

export function createServer() {
  const app = express();

  initializeNeonDatabase().then((success) => {
    usingNeonDatabase = success;
    if (success) {
      console.log("🚀 SoulSpeak API running with Neon PostgreSQL database");
    } else {
      console.error(
        "❌ Failed to initialize Neon database - API may not function properly",
      );
    }
  });

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  app.get("/api/ping", (_req, res) => {
    res.json({
      message: "SoulSpeak API is running smoothly",
      timestamp: new Date().toISOString(),
      status: "healthy",
      database: usingNeonDatabase ? "neon_postgresql" : "disconnected",
    });
  });

  app.get("/api/health", async (_req, res) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    const uptimePercentage = Math.min((uptime / (24 * 60 * 60)) * 100, 99.9);

    let aiStatus = "offline";
    let availableKeys = 0;
    let quotaExceeded = 0;
    let totalKeys = 0;
    let aiServiceHealth = "unknown";
    let cacheInfo = null;

    totalKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4,
    ].filter(Boolean).length;

    try {
      const { testGeminiConnection, getCachedHealthStatus } = await import(
        "./services/geminiService"
      );

      const cachedStatus = getCachedHealthStatus();

      let testResult;
      if (cachedStatus && cachedStatus.cacheAge < 600) {
        testResult = cachedStatus;
        cacheInfo = {
          is_cached: true,
          cache_age_seconds: cachedStatus.cacheAge,
          cache_status: "hit",
        };
        console.log(
          `📋 Health endpoint using cached AI status (${cachedStatus.cacheAge}s old)`,
        );
      } else {
        testResult = await testGeminiConnection();
        cacheInfo = {
          is_cached: false,
          cache_age_seconds: 0,
          cache_status: "miss",
        };
        console.log("🔄 Health endpoint running fresh AI status check");
      }

      availableKeys = testResult.workingKeys || 0;
      quotaExceeded = testResult.quotaExceeded || 0;

      if (testResult.available) {
        if (availableKeys > 0) {
          aiStatus = "online";
          aiServiceHealth = "operational";
        } else if (quotaExceeded > 0) {
          aiStatus = "warning";
          aiServiceHealth = "quota_limited";
        } else {
          aiStatus = "offline";
          aiServiceHealth = "degraded";
        }
      } else {
        aiStatus = "offline";
        aiServiceHealth = "offline";
      }
    } catch (error) {
      console.error("❌ AI service test failed:", error);
      aiStatus = "offline";
      aiServiceHealth = "error";
      cacheInfo = {
        is_cached: false,
        cache_age_seconds: 0,
        cache_status: "error",
      };
    }

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime),
        percentage: Math.round(uptimePercentage * 10) / 10, 
        formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
      },
      database: {
        status: usingNeonDatabase ? "online" : "offline",
        type: usingNeonDatabase ? "neon_postgresql" : "disconnected",
        connection_pool: usingNeonDatabase ? "active" : "inactive",
      },
      ai: {
        status: aiStatus,
        keys: totalKeys,
        available_keys: availableKeys,
        quota_exceeded: quotaExceeded,
        service_health: aiServiceHealth,
        last_checked: new Date().toISOString(),
        cache_info: cacheInfo,
      },
      auth: {
        status:
          process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY
            ? "online"
            : "offline",
        supabase_configured: !!(
          process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY
        ),
        provider: "supabase",
      },
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
        usage_percentage: Math.round(
          (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
        ),
      },
      environment: process.env.NODE_ENV || "development",
      server_info: {
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    });
  });

  app.get("/api/auth/status", (_req, res) => {
    const supabaseConfigured = !!(
      process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY
    );

    res.json({
      status: supabaseConfigured ? "online" : "offline",
      provider: "supabase",
      configured: supabaseConfigured,
      endpoints: {
        url: process.env.VITE_SUPABASE_URL ? "configured" : "missing",
        anon_key: process.env.VITE_SUPABASE_ANON_KEY ? "configured" : "missing",
      },
      timestamp: new Date().toISOString(),
    });
  });

  app.post("/api/journal/entries", createJournalEntry);
  app.get("/api/journal/entries", getJournalEntries);
  app.get("/api/journal/entries/:id", getJournalEntry);

  app.get("/api/mood/data", getMoodData);
  app.get("/api/mood/data/fast", getMoodDataFast);
  app.post("/api/mood/entries", addMoodEntry);
  app.get("/api/mood/entries", getMoodData);
  app.post("/api/mood", addMoodEntry);

  app.get("/api/companion/analytics", getCompanionAnalytics);
  app.post("/api/companion/conversations", getOrCreateConversation);
  app.get("/api/companion/conversations", getConversations);
  app.get(
    "/api/companion/conversations/:conversationId/messages",
    getConversationMessages,
  );
  app.post("/api/companion/chat", sendChatMessage);

  app.get("/api/user/profile", getUserProfile);
  app.put("/api/user/profile", updateUserProfile);

  app.post("/api/test/journal/entries", (req, res) => {
    const { content, mood, email, userName } = req.body;

    setTimeout(() => {
      res.json({
        success: true,
        message: "TEST MODE: Journal entry simulated (not saved)",
        data: {
          id: `test_${Date.now()}`,
          content,
          mood: mood || 5,
          email,
          userName,
          created_at: new Date().toISOString(),
          ai_response:
            "This is a test AI response. In real mode, this would be generated by AI and the entry would be saved to the database.",
          test_mode: true,
        },
      });
    }, 500);
  });

  app.get("/api/test/journal/entries", (req, res) => {
    const { email } = req.query;

    setTimeout(() => {
      res.json({
        success: true,
        message: "TEST MODE: No real journal entries returned",
        data: {
          entries: [
            {
              id: "test_example_1",
              content: "This is a test journal entry (not real data)",
              mood: 7,
              created_at: new Date(Date.now() - 86400000).toISOString(),
              ai_response: "Test AI response for demonstration",
              test_mode: true,
            },
          ],
          test_mode: true,
        },
      });
    }, 300);
  });

  app.post("/api/test/mood/entries", (req, res) => {
    const { moodLevel, notes, email, userName } = req.body;

    setTimeout(() => {
      res.json({
        success: true,
        message: "TEST MODE: Mood entry simulated (not saved)",
        data: {
          id: `test_mood_${Date.now()}`,
          mood_level: moodLevel,
          notes,
          email,
          userName,
          created_at: new Date().toISOString(),
          test_mode: true,
        },
      });
    }, 400);
  });

  app.get("/api/test/mood/data", (req, res) => {
    const { email } = req.query;

    setTimeout(() => {
      res.json({
        success: true,
        message: "TEST MODE: No real mood data returned",
        data: {
          recent_moods: [
            {
              mood_level: 7,
              created_at: new Date().toISOString(),
              notes: "Test mood entry",
            },
          ],
          average: 6.5,
          trend: "stable",
          test_mode: true,
        },
      });
    }, 350);
  });

  app.post("/api/test/companion/chat", (req, res) => {
    const { message } = req.body;

    setTimeout(() => {
      res.json({
        success: true,
        message: "TEST MODE: AI chat simulated (not processed by real AI)",
        data: {
          response:
            "This is a test AI companion response. In real mode, this would be processed by the actual AI service.",
          conversation_id: `test_conv_${Date.now()}`,
          test_mode: true,
        },
      });
    }, 800);
  });

  app.get("/api/test/user/profile", (req, res) => {
    const { email } = req.query;

    res.json({
      success: true,
      message: "TEST MODE: User profile simulated",
      data: {
        email,
        username: "Test User",
        created_at: new Date().toISOString(),
        total_entries: 0,
        avg_mood: 7,
        test_mode: true,
      },
    });
  });

  app.get("/api/test/verify", (_req, res) => {
    const timestamp = new Date().toISOString();
    const uptime = process.uptime();

    res.json({
      success: true,
      message: "API test endpoint is working correctly",
      timestamp,
      test_data: {
        random_number: Math.floor(Math.random() * 1000),
        environment: process.env.NODE_ENV || "development",
        server_time: timestamp,
        uptime_seconds: Math.floor(uptime),
        node_version: process.version,
        platform: process.platform,
      },
      service_status: {
        database: usingNeonDatabase ? "connected" : "disconnected",
        auth: !!(
          process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY
        )
          ? "configured"
          : "not_configured",
        ai_keys_configured: [
          process.env.GEMINI_API_KEY,
          process.env.GEMINI_API_KEY_2,
          process.env.GEMINI_API_KEY_3,
          process.env.GEMINI_API_KEY_4,
        ].filter(Boolean).length,
      },
      endpoints_available: [
        "/api/health",
        "/api/ping",
        "/api/auth/status",
        "/api/test/verify",
        "/api/test/journal/entries",
        "/api/test/mood/entries",
        "/api/test/companion/chat",
        "/api/test/user/profile",
        "/api/journal/entries (REAL - saves data)",
        "/api/mood/entries (REAL - saves data)",
        "/api/companion/chat (REAL - uses AI quota)",
        "/api/user/profile (REAL - accesses database)",
      ],
    });
  });

  app.delete("/api/test/cleanup", async (req, res) => {
    try {
      console.log("🧹 Starting test data cleanup...");

      const { cleanupTestJournalEntries, cleanupTestMoodEntries } =
        await import("./utils/neon");

      const journalCleaned = await cleanupTestJournalEntries();
      const moodCleaned = await cleanupTestMoodEntries();

      console.log(
        `Cleanup completed: ${journalCleaned} journal entries, ${moodCleaned} mood entries removed`,
      );

      res.json({
        success: true,
        message: "Test data cleanup completed",
        data: {
          journal_entries_removed: journalCleaned,
          mood_entries_removed: moodCleaned,
          total_removed: journalCleaned + moodCleaned,
        },
      });
    } catch (error) {
      console.error("❌ Cleanup failed:", error);
      res.status(500).json({
        success: false,
        error: "Failed to cleanup test data",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return app;
}
