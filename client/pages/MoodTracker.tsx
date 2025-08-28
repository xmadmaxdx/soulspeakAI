import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import {
  Heart,
  TrendingUp,
  Calendar,
  Plus,
  BarChart3,
  LineChart,
  BookOpen,
  Smile,
  Frown,
  Meh,
  Crown,
  Star,
  Sparkles,
  Award,
  Target,
  Zap,
  Moon,
  Sun,
  Activity,
  Brain,
  Flame,
  Droplets,
  Wind,
  Cloud,
  Rainbow,
  Gauge,
  TrendingDown,
  BarChart,
  PieChart,
  Map,
  Timer,
  CheckCircle,
  AlertCircle,
  Clock,
  Coffee,
  Music,
  Leaf,
  Globe,
  Lightbulb,
} from "lucide-react";
import AppNavigation from "../components/ui/app-navigation";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  LineChart as RechartsLineChart,
  Line,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { apiClient } from "../lib/api";
import { useToast } from "../hooks/use-toast";

interface MoodEntry {
  id: string;
  moodLevel: number;
  notes?: string;
  createdAt: string;
}

interface ChartData {
  date: string;
  mood: number;
  day: string;
  formattedDate: string;
}

interface MoodDistribution {
  range: string;
  count: number;
  percentage: number;
  color: string;
}

export default function MoodTracker() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);  
  const [dataError, setDataError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    average: 0,
    trend: "starting",
    bestDay: "—",
    totalEntries: 0,
    currentStreak: 0,
    longestStreak: 0,
    moodDistribution: [] as MoodDistribution[],
  });
  const [timeRange, setTimeRange] = useState(30);
  const [chartType, setChartType] = useState<"line" | "pie">("line");
  const [selectedDataPoint, setSelectedDataPoint] = useState<ChartData | null>(
    null,
  );
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [animationKey, setAnimationKey] = useState(0);

  const trackerRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const insightsRef = useRef<HTMLDivElement>(null);

  const isMountedRef = useRef(true);
  const currentFetchRef = useRef<AbortController | null>(null);

  const trackerInView = useInView(trackerRef, { once: true, margin: "-100px" });
  const chartsInView = useInView(chartsRef, { once: true, margin: "-100px" });
  const insightsInView = useInView(insightsRef, {
    once: true,
    margin: "-100px",
  });

  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    generateChartData();
    calculateAdvancedStats();
  }, [moodEntries, timeRange]);

  useEffect(() => {
    const fetchTimer = setTimeout(() => {
      if (user?.email) {
        console.log("🔄 MoodTracker: User email available, fetching mood data");
        fetchMoodData();
      } else if (!user && !loading) {
        console.log(
          "⚠️ MoodTracker: No user available, clearing loading state",
        );
        setIsLoadingData(false);
      }
    }, 100); 

    return () => clearTimeout(fetchTimer);
  }, [user, timeRange, loading]);

  useEffect(() => {
    isMountedRef.current = true;
    console.log("📱 MoodTracker component mounted");

    return () => {
      console.log("📱 MoodTracker component unmounting - cleaning up");
      isMountedRef.current = false;
      if (currentFetchRef.current) {
        console.log("🛑 Cancelling pending mood data request on unmount");
        currentFetchRef.current.abort();
        currentFetchRef.current = null;
      }
    };
  }, []); 

  const fetchMoodData = async (retryCount = 0) => {
    if (!user?.email || !isMountedRef.current) {
      console.warn(
        "❌ No user email or component unmounted, cannot fetch mood data",
      );
      return;
    }

    if (currentFetchRef.current) {
      console.log("🛑 Cancelling previous mood data request");
      currentFetchRef.current.abort();
      currentFetchRef.current = null;
    }

    const abortController = new AbortController();
    currentFetchRef.current = abortController;

    if (!isMountedRef.current) {
      console.log(
        "🚫 Component unmounted during fetchMoodData setup, aborting",
      );
      abortController.abort();
      return;
    }

    try {
      if (isMountedRef.current) {
        setIsLoadingData(true);
        setDataError(null);
      }

      console.log(
        `📊 Fetching mood data for ${user.email} (${timeRange} days) - attempt ${retryCount + 1} - Loading: ${isLoadingData}`,
      );

      if (isMountedRef.current) {
        setAnimationKey((prev) => prev + 1);
      }

      const data = await Promise.race([
        apiClient.getMoodData(user.email, timeRange),
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(new Error("Mood data request timeout after 15 seconds")),
            15000,
          ),
        ),
      ]);

      if (
        !isMountedRef.current ||
        currentFetchRef.current !== abortController
      ) {
        console.log(
          "🚫 Ignoring mood data response - component unmounted or request superseded",
        );
        return;
      }

      console.log("✅ Mood data received:", data);

      setMoodEntries(data.entries || []);

      let insightText = data.insights;
      const entriesCount = (data.entries || []).length;
      const averageMood = data.average || 0;
      const trend = data.trend || "starting";

      if (!insightText || insightText.trim().length === 0) {
        console.log(
          "⚠️ No AI insights received from backend, using minimal fallback",
        );
        if (entriesCount === 0) {
          insightText =
            "🌱 Welcome to your mood tracking journey! Start by logging your first mood entry to see AI-powered insights and patterns. Every emotion you track helps you understand yourself better. ✨";
        } else {
          insightText =
            "🤖 Your AI mood insights are being generated. Continue tracking to see personalized patterns and meaningful analysis of your emotional journey! ✨";
        }
      } else {
        console.log(
          "✅ AI insights received from backend:",
          insightText.substring(0, 100) + "...",
        );
      }

      insightText = insightText
        .replace(/\|\|REAL_API_RESPONSE\|\|/g, "")
        .replace(/\|\|FALLBACK_RESPONSE\|\|/g, "")
        .replace(/\|\|RATE_LIMITED\|\|/g, "")
        .replace(/\|\|BACKUP_AI_RESPONSE\|\|/g, "")
        .trim();

      console.log("💡 Insights received:", insightText);
      setInsights(insightText);
      setDataError(null);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("🛑 Mood data request was cancelled");
        return;
      }

      if (
        !isMountedRef.current ||
        currentFetchRef.current !== abortController
      ) {
        console.log(
          "🚫 Ignoring mood data error - component unmounted or request superseded",
        );
        return;
      }

      console.error(
        `❌ Failed to fetch mood data (attempt ${retryCount + 1}):`,
        error,
      );

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        (errorMessage.includes("timeout") ||
          errorMessage.includes("Network error") ||
          errorMessage.includes("Request timeout") ||
          errorMessage.includes("AbortError")) &&
        retryCount < 1 && 
        isMountedRef.current
      ) {
        console.log(
          `🔄 Retrying mood data fetch in ${(retryCount + 1) * 3} seconds...`,
        );
        setTimeout(
          () => {
            if (isMountedRef.current) {
              fetchMoodData(retryCount + 1);
            }
          },
          (retryCount + 1) * 3000,
        ); 
        return;
      }

      if (
        errorMessage.includes("timeout") ||
        errorMessage.includes("Network error")
      ) {
        setDataError("Network connection issue");
        setInsights(
          "🌐 Connection issue detected. Your mood data is safely stored and will sync when connection is restored. Try refreshing or check back in a moment.",
        );
      } else if (errorMessage.includes("not found")) {
        setDataError(null); 
        setInsights(
          "🌱 Welcome to your mood tracking journey! Start by selecting your mood level above to begin building your personal insights and patterns.",
        );
      } else {
        setDataError("Failed to load data");
        setInsights(
          "🔄 Having trouble loading your mood data right now. Your entries are safe - please try refreshing the page or check back in a moment.",
        );
      }

      setMoodEntries([]);
    } finally {
      if (isMountedRef.current) {
        setIsLoadingData(false);
        console.log("✅ MoodTracker: Loading state cleared");
      }

      if (currentFetchRef.current === abortController) {
        currentFetchRef.current = null;
      }
    }
  };

  const generateChartData = () => {
    try {
      console.log("📊 Generating chart data from:", moodEntries);

      const validMoodEntries = Array.isArray(moodEntries) ? moodEntries : [];

      if (validMoodEntries.length === 0) {
        console.log("📉 No mood entries available for chart");
        setChartData([]);
        return;
      }

      if (typeof window === "undefined") {
        console.warn(
          "⚠️ Running in non-browser environment, skipping chart generation",
        );
        return;
      }

      const entriesByDate: Record<string, MoodEntry[]> = {};

      validMoodEntries.forEach((entry, index) => {
        try {
          if (entry && (entry.createdAt || entry.created_at)) {
            const dateString = entry.createdAt || entry.created_at;
            const dateKey = format(new Date(dateString), "yyyy-MM-dd");
            if (!entriesByDate[dateKey]) {
              entriesByDate[dateKey] = [];
            }
            entriesByDate[dateKey].push(entry);
          } else {
            console.warn(`⚠️ Mood entry ${index} missing date:`, entry);
          }
        } catch (error) {
          console.warn(
            `⚠️ Invalid date format in mood entry ${index}:`,
            entry,
            error,
          );
        }
      });

      const days: ChartData[] = [];
      const validTimeRange = Math.max(1, Math.min(timeRange || 30, 365));
      const today = new Date();
      const cutoffDate = subDays(today, validTimeRange - 1);

      Object.entries(entriesByDate).forEach(([dateKey, dayEntries]) => {
        try {
          const date = new Date(dateKey);

          const dateStart = startOfDay(date);
          const cutoffDateStart = startOfDay(cutoffDate);
          if (dateStart >= cutoffDateStart) {
            const avgMood =
              dayEntries.reduce((sum, entry) => {
                const moodLevel = Number(
                  entry.moodLevel || entry.mood_level || 0,
                );
                const validMood = isNaN(moodLevel)
                  ? 0
                  : Math.max(0, Math.min(10, moodLevel));
                return sum + validMood;
              }, 0) / dayEntries.length;

            const dayData = {
              date: dateKey,
              mood: Number(avgMood.toFixed(1)),
              day: format(date, "MMM dd"),
              formattedDate: format(date, "EEEE, MMMM do"),
            };

            days.push(dayData);
          }
        } catch (error) {
          console.warn("Error processing date entry:", dateKey, error);
        }
      });

      days.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      console.log(
        `📊 Generated chart data: ${days.length} days with mood entries from ${validMoodEntries.length} total entries`,
      );
      console.log("🔍 Chart data sample:", days.slice(0, 3));
      setChartData(days);
    } catch (error) {
      console.error("❌ Error generating chart data:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      setChartData([]);
    }
  };

  const calculateAdvancedStats = () => {
    try {
      console.log("📈 Calculating advanced stats from:", moodEntries);

      if (typeof window === "undefined") {
        console.warn(
          "⚠️ Running in non-browser environment, skipping stats calculation",
        );
        return;
      }

      const validEntries = Array.isArray(moodEntries)
        ? moodEntries.filter((entry) => {
            if (!entry) return false;

            const moodLevel = entry.moodLevel || entry.mood_level;
            const hasValidMood =
              typeof moodLevel === "number" &&
              moodLevel >= 1 &&
              moodLevel <= 10;
            const hasValidDate = entry.createdAt || entry.created_at;

            return hasValidMood && hasValidDate;
          })
        : [];

      console.log(
        `🔍 Found ${validEntries.length} valid entries from ${moodEntries.length} total`,
      );

      if (validEntries.length === 0) {
        setStats({
          average: 0,
          trend: "starting",
          bestDay: "—",
          totalEntries: 0,
          currentStreak: 0,
          longestStreak: 0,
          moodDistribution: [],
        });
        return;
      }

      const average =
        validEntries.reduce((sum, entry) => {
          const moodLevel = entry.moodLevel || entry.mood_level;
          return sum + moodLevel;
        }, 0) / validEntries.length;

      const recent = validEntries.slice(-7);
      const previous = validEntries.slice(-14, -7);
      const recentAvg =
        recent.length > 0
          ? recent.reduce((sum, entry) => {
              const moodLevel = entry.moodLevel || entry.mood_level;
              return sum + moodLevel;
            }, 0) / recent.length
          : average;
      const previousAvg =
        previous.length > 0
          ? previous.reduce((sum, entry) => {
              const moodLevel = entry.moodLevel || entry.mood_level;
              return sum + moodLevel;
            }, 0) / previous.length
          : recentAvg;

      let trend = "stable";
      if (recentAvg > previousAvg + 0.5) trend = "improving";
      if (recentAvg < previousAvg - 0.5) trend = "declining";

      const bestEntry = validEntries.reduce((best, entry) => {
        const entryMood = entry.moodLevel || entry.mood_level;
        const bestMood = best.moodLevel || best.mood_level;
        return entryMood > bestMood ? entry : best;
      });

      let bestDay = "—";
      try {
        const dateString = bestEntry.createdAt || bestEntry.created_at;
        bestDay = format(new Date(dateString), "MMM dd, yyyy");
      } catch (error) {
        console.warn("Error formatting best day:", error);
      }

      const sortedEntries = [...validEntries].sort((a, b) => {
        try {
          const aDate = new Date(a.createdAt || a.created_at);
          const bDate = new Date(b.createdAt || b.created_at);
          return aDate.getTime() - bDate.getTime();
        } catch (error) {
          console.warn("Error sorting entries:", error);
          return 0;
        }
      });

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      const today = new Date();
      const yesterday = subDays(today, 1);

      const hasRecentEntry = sortedEntries.some((entry) => {
        try {
          const entryDate = new Date(entry.createdAt);
          return (
            format(entryDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd") ||
            format(entryDate, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")
          );
        } catch (error) {
          console.warn("Error checking recent entry:", error);
          return false;
        }
      });

      if (hasRecentEntry) {
        const validTimeRange = Math.max(1, Math.min(timeRange || 30, 365));
        for (let i = 0; i < validTimeRange; i++) {
          const checkDate = subDays(today, i);
          const hasEntry = sortedEntries.some((entry) => {
            try {
              const dateString = entry.createdAt || entry.created_at;
              return (
                format(new Date(dateString), "yyyy-MM-dd") ===
                format(checkDate, "yyyy-MM-dd")
              );
            } catch (error) {
              return false;
            }
          });

          if (hasEntry) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      const uniqueDaysSet: Record<string, boolean> = {};
      sortedEntries.forEach((entry) => {
        try {
          const dateString = entry.createdAt || entry.created_at;
          const formattedDate = format(new Date(dateString), "yyyy-MM-dd");
          if (formattedDate) {
            uniqueDaysSet[formattedDate] = true;
          }
        } catch (error) {
          console.warn("Error formatting date:", error);
        }
      });

      const uniqueDays = Object.keys(uniqueDaysSet).sort();

      for (let i = 0; i < uniqueDays.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          try {
            const prevDate = new Date(uniqueDays[i - 1]);
            const currDate = new Date(uniqueDays[i]);
            const diffDays = Math.floor(
              (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
            );

            if (diffDays === 1) {
              tempStreak++;
            } else {
              longestStreak = Math.max(longestStreak, tempStreak);
              tempStreak = 1;
            }
          } catch (error) {
            console.warn("Error calculating streak:", error);
            tempStreak = 1;
          }
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      const distribution = [
        { range: "1-2", count: 0, percentage: 0, color: "#ef4444" },
        { range: "3-4", count: 0, percentage: 0, color: "#f97316" },
        { range: "5-6", count: 0, percentage: 0, color: "#eab308" },
        { range: "7-8", count: 0, percentage: 0, color: "#22c55e" },
        { range: "9-10", count: 0, percentage: 0, color: "#10b981" },
      ];

      validEntries.forEach((entry) => {
        const mood = entry.moodLevel || entry.mood_level;
        if (mood <= 2) distribution[0].count++;
        else if (mood <= 4) distribution[1].count++;
        else if (mood <= 6) distribution[2].count++;
        else if (mood <= 8) distribution[3].count++;
        else distribution[4].count++;
      });

      distribution.forEach((item) => {
        item.percentage =
          validEntries.length > 0
            ? Math.round((item.count / validEntries.length) * 100)
            : 0;
      });

      const newStats = {
        average: Number(average.toFixed(1)),
        trend,
        bestDay,
        totalEntries: validEntries.length,
        currentStreak,
        longestStreak,
        moodDistribution: distribution.filter((item) => item.count > 0),
      };

      console.log("🎯 Advanced stats calculated:", newStats);
      setStats(newStats);
    } catch (error) {
      console.error("❌ Error calculating advanced stats:", error);
      if (error instanceof Error) {
        console.error("Stats error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      setStats({
        average: 0,
        trend: "starting",
        bestDay: "—",
        totalEntries: 0,
        currentStreak: 0,
        longestStreak: 0,
        moodDistribution: [],
      });
    }
  };

  const logMood = async () => {
    if (!selectedMood || !user?.email || !isMountedRef.current) return;

    setIsLogging(true);
    try {
      console.log(`📝 Logging mood: ${selectedMood} for ${user.email}`);

      await apiClient.addMoodEntry({
        moodLevel: selectedMood,
        notes: notes.trim() || undefined,
        email: user.email,
        userName: user.user_metadata?.username || user.email.split("@")[0],
      });

      if (!isMountedRef.current) {
        console.log("🚫 Ignoring mood log success - component unmounted");
        return;
      }

      console.log("✅ Mood logged successfully");

      toast({
        title:
          moodEntries.length === 0
            ? "Welcome to Your Mood Journey! 🎉"
            : "Mood Logged! 🎉",
        description:
          moodEntries.length === 0
            ? `Your first mood entry (${selectedMood}/10) has been saved! Your analytics will now start appearing.`
            : `Successfully recorded your mood of ${selectedMood}/10`,
        duration: 4000,
      });

      setSelectedMood(null);
      setNotes("");
      await fetchMoodData();
    } catch (error) {
      if (!isMountedRef.current) {
        console.log("🚫 Ignoring mood log error - component unmounted");
        return;
      }

      console.error("⚠️ Mood logging failed:", error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      const newEntry: MoodEntry = {
        id: `local_${Date.now()}`,
        moodLevel: selectedMood,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      if (
        errorMessage.includes("timeout") ||
        errorMessage.includes("Network error")
      ) {
        toast({
          title: "Network Issue 🌐",
          description:
            "Your mood was saved locally. It will sync when connection is restored.",
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: "Mood Saved Locally 💾",
          description: "Your mood entry was saved locally and will sync later.",
          duration: 4000,
        });
      }

      setMoodEntries((prev) => [...prev, newEntry]);
      setSelectedMood(null);
      setNotes("");
    } finally {
      if (isMountedRef.current) {
        setIsLogging(false);
      }
    }
  };

  const getMoodEmoji = (mood: number) => {
    if (mood <= 2) return "😔";
    if (mood <= 4) return "😐";
    if (mood <= 6) return "🙂";
    if (mood <= 8) return "😊";
    return "🌟";
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 2) return "from-rose-400 to-red-400";
    if (mood <= 4) return "from-orange-400 to-red-400";
    if (mood <= 6) return "from-amber-400 to-orange-400";
    if (mood <= 8) return "from-emerald-400 to-green-400";
    return "from-green-400 to-emerald-500";
  };

  const getMoodGradient = (mood: number) => {
    if (mood <= 2) return "bg-gradient-to-br from-rose-500 to-red-500";
    if (mood <= 4) return "bg-gradient-to-br from-orange-500 to-red-500";
    if (mood <= 6) return "bg-gradient-to-br from-amber-500 to-orange-500";
    if (mood <= 8) return "bg-gradient-to-br from-emerald-500 to-green-500";
    return "bg-gradient-to-br from-green-500 to-emerald-500";
  };

  const getTrendIcon = () => {
    switch (stats.trend) {
      case "improving":
        return (
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
        );
      case "declining":
        return <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />;
      default:
        return <Target className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />;
    }
  };

  const getTrendColor = () => {
    switch (stats.trend) {
      case "improving":
        return "from-emerald-400 to-green-500";
      case "declining":
        return "from-rose-400 to-red-500";
      default:
        return "from-violet-400 to-purple-500";
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div
          className="bg-white/95 backdrop-blur-sm border border-violet-200/50 rounded-xl p-4 shadow-xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <p className="font-semibold text-slate-800">{data.formattedDate}</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-2xl">{getMoodEmoji(data.mood)}</span>
            <span className="font-bold text-violet-600">{data.mood}/10</span>
            <span className="text-sm text-slate-500 ml-2">
              {data.mood <= 3
                ? "Challenging"
                : data.mood <= 6
                  ? "Balanced"
                  : data.mood <= 8
                    ? "Good"
                    : "Excellent"}
            </span>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center overflow-x-hidden">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Activity className="w-12 h-12 text-white" />
          </motion.div>
          <motion.div
            className="space-y-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="h-2 w-40 bg-slate-300 rounded-full mx-auto animate-pulse"></div>
            <div className="h-2 w-32 bg-slate-200 rounded-full mx-auto animate-pulse"></div>
            <div className="h-2 w-36 bg-slate-300 rounded-full mx-auto animate-pulse"></div>
          </motion.div>
          <p className="text-slate-700 font-semibold text-lg">
            Loading your mood sanctuary...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-[8%] w-24 h-24 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-violet-200/20 rounded-full blur-3xl hidden sm:block"
          animate={{
            x: mousePosition.x * 0.01,
            y: mousePosition.y * 0.01,
            scale: [1, 1.2, 1],
          }}
          transition={{
            x: { type: "spring", stiffness: 50, damping: 20 },
            y: { type: "spring", stiffness: 50, damping: 20 },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{ y: backgroundY }}
        />
        <motion.div
          className="absolute top-3/4 right-[8%] w-24 h-24 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-purple-200/20 rounded-full blur-3xl hidden sm:block"
          animate={{
            x: -mousePosition.x * 0.005,
            y: -mousePosition.y * 0.005,
            scale: [1, 0.8, 1],
          }}
          transition={{
            x: { type: "spring", stiffness: 50, damping: 20 },
            y: { type: "spring", stiffness: 50, damping: 20 },
            scale: {
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            },
          }}
          style={{ y: parallaxY }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-pink-200/20 rounded-full blur-3xl hidden sm:block"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.3, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      </div>

      <AppNavigation
        title="Mood Tracker"
        subtitle="Your Mood Sanctuary"
        icon={<Activity className="w-4 h-4 sm:w-6 sm:h-6 text-white" />}
        currentPage="mood"
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 xl:py-20">
        <div className="w-full">
          <motion.div
            className="text-center mb-8 sm:mb-16 lg:mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-white/80 backdrop-blur-lg border border-violet-200/50 rounded-full mb-4 sm:mb-8 shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 mr-2 sm:mr-3 animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-slate-700">
                Emotional Intelligence Center
              </span>
            </motion.div>

            <motion.h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-700 via-purple-700 to-pink-700 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Interactive Mood Analytics
            </motion.h1>

            <motion.div
              className="text-base sm:text-lg lg:text-xl xl:text-2xl text-slate-600 leading-relaxed max-w-4xl mx-auto px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <p className="mb-4">
                Track your emotional journey and discover{" "}
                <motion.span
                  className="text-violet-600 font-bold"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  meaningful patterns
                </motion.span>{" "}
                in your wellbeing.
                <br className="hidden sm:block" />
                <motion.span
                  className="text-purple-600 font-semibold"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  Every mood tells a story worth understanding.
                </motion.span>
              </p>

              {moodEntries.length === 0 && (
                <motion.div
                  className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl max-w-2xl mx-auto"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <div className="flex items-center justify-center space-x-2 text-amber-700">
                    <span className="text-2xl">👇</span>
                    <span className="font-semibold text-sm sm:text-base">
                      Start by selecting your mood level below to see your
                      analytics!
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 xl:gap-12">
            <motion.div
              ref={trackerRef}
              className="xl:col-span-1 space-y-4 sm:space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={trackerInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <Card
                className={`border-0 bg-white/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl group overflow-hidden relative ${moodEntries.length === 0 ? "ring-2 ring-violet-200 ring-offset-2 ring-offset-violet-50" : ""}`}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
                  animate={{
                    background: selectedMood
                      ? "linear-gradient(to bottom right, rgba(139,92,246,0.1), transparent)"
                      : "linear-gradient(to bottom right, rgba(255,255,255,0.2), transparent)",
                  }}
                  transition={{ duration: 0.3 }}
                />

                <CardHeader
                  className={`relative bg-gradient-to-r from-white/50 to-transparent ${moodEntries.length === 0 ? "animate-pulse" : ""}`}
                >
                  <CardTitle className="flex items-center justify-between text-slate-800 text-lg sm:text-xl lg:text-2xl group-hover:text-violet-700 transition-colors duration-300">
                    <div className="flex items-center">
                      <motion.div
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mr-3 sm:mr-4 shadow-xl"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17,
                        }}
                      >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </motion.div>
                      How are you feeling?
                    </div>

                    <div className="flex items-center space-x-2">
                      {isLoadingData && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-4 h-4 border-2 border-violet-300 border-t-violet-600 rounded-full"
                        />
                      )}

                      {dataError && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fetchMoodData()}
                          className="text-xs px-2 py-1 h-auto border-orange-300 text-orange-700 hover:bg-orange-50"
                          disabled={isLoadingData}
                        >
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </CardTitle>

                  {dataError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl"
                    >
                      <div className="flex items-center text-orange-700 text-sm">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                          {dataError}. Your entries are saved locally and will
                          sync when connection is restored.
                        </span>
                      </div>
                    </motion.div>
                  )}
                </CardHeader>

                <CardContent className="space-y-4 sm:space-y-6 lg:space-y-8 relative p-4 sm:p-6 lg:p-8">
                  <div>
                    <Label className="text-sm sm:text-base font-semibold text-slate-700 flex items-center mb-4 sm:mb-6">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-violet-600" />
                      Select your mood level
                    </Label>

                    <div className="grid grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mood) => (
                        <motion.button
                          key={mood}
                          onClick={() => setSelectedMood(mood)}
                          className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl sm:rounded-3xl text-sm sm:text-base font-bold transition-all duration-300 relative overflow-hidden group ${
                            selectedMood === mood
                              ? `bg-gradient-to-br ${getMoodColor(mood)} text-white shadow-2xl scale-110 ring-2 ring-white`
                              : "bg-white/80 text-slate-600 hover:bg-white/95 backdrop-blur-sm border border-violet-200/50 hover:border-violet-300/70"
                          }`}
                          whileHover={{
                            scale: selectedMood === mood ? 1.15 : 1.1,
                          }}
                          whileTap={{ scale: 0.95 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 17,
                          }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            initial={false}
                          />

                          <span className="relative z-10">{mood}</span>

                          {selectedMood === mood && (
                            <motion.div
                              className="absolute inset-0 flex items-center justify-center text-lg"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                              }}
                            >
                              {getMoodEmoji(mood)}
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>

                    <div className="flex justify-between text-xs sm:text-sm text-slate-500 mt-3 sm:mt-4 px-1 sm:px-2">
                      <motion.span
                        className="flex items-center"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Frown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Very Low</span>
                        <span className="sm:hidden">Low</span>
                      </motion.span>
                      <motion.span
                        className="flex items-center"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Smile className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Excellent</span>
                        <span className="sm:hidden">High</span>
                      </motion.span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {selectedMood && (
                      <motion.div
                        className="space-y-4 sm:space-y-6"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        }}
                      >
                        <motion.div
                          className="text-center p-4 sm:p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl sm:rounded-3xl backdrop-blur-sm border border-violet-200/50 relative overflow-hidden"
                          whileHover={{ scale: 1.02 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-violet-400/10 to-purple-400/10"
                            animate={{
                              opacity: [0, 0.3, 0],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />

                          <div className="relative z-10">
                            <motion.div
                              className="text-4xl sm:text-5xl mb-2 sm:mb-3"
                              animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            >
                              {getMoodEmoji(selectedMood)}
                            </motion.div>
                            <div className="text-slate-700 font-bold text-base sm:text-lg">
                              Mood Level: {selectedMood}/10
                            </div>
                            <Badge
                              variant="secondary"
                              className={`mt-3 ${getMoodGradient(selectedMood)} text-white border-0 font-semibold`}
                            >
                              {selectedMood <= 3
                                ? "Needs Care"
                                : selectedMood <= 6
                                  ? "Balanced"
                                  : selectedMood <= 8
                                    ? "Good"
                                    : "Excellent"}
                            </Badge>
                          </div>
                        </motion.div>

                        <div>
                          <Label
                            htmlFor="notes"
                            className="text-slate-700 font-semibold mb-2 sm:mb-3 block flex items-center text-sm sm:text-base"
                          >
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-purple-600" />
                            Notes (optional)
                          </Label>
                          <Textarea
                            id="notes"
                            placeholder="What's contributing to this mood? Any thoughts or feelings you'd like to note..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="border-violet-200/50 focus:ring-violet-500/50 rounded-2xl bg-white/80 backdrop-blur-sm min-h-[100px] sm:min-h-[120px] text-slate-700 text-sm sm:text-base transition-all duration-300 focus:bg-white/90"
                          />
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={logMood}
                            disabled={isLogging}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-2xl sm:rounded-3xl px-6 sm:px-8 py-3 sm:py-4 shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base relative overflow-hidden group"
                          >
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-violet-700 to-purple-700"
                              initial={{ x: "-100%" }}
                              whileHover={{ x: "0%" }}
                              transition={{ duration: 0.3 }}
                            />

                            <span className="relative z-10 flex items-center justify-center">
                              {isLogging ? (
                                <>
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                      duration: 1,
                                      repeat: Infinity,
                                      ease: "linear",
                                    }}
                                  >
                                    <Sparkles className="w-5 h-5 mr-3" />
                                  </motion.div>
                                  Logging mood...
                                </>
                              ) : (
                                <>
                                  <Plus className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                  Log Mood
                                </>
                              )}
                            </span>
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              <motion.div
                className="grid grid-cols-1 gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={trackerInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <Card className="border-0 bg-gradient-to-br from-white/80 to-violet-50/50 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden relative group">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-violet-400/5 to-purple-400/5"
                    animate={{
                      opacity: [0.05, 0.15, 0.05],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  <CardContent className="p-6 text-center relative z-10">
                    <motion.div
                      className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {stats.average > 0 ? `${stats.average}/10` : "—"}
                    </motion.div>
                    <div className="text-sm text-slate-600 font-semibold mb-3">
                      Average Mood
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale:
                              i < Math.min(Math.ceil(stats.average / 2), 5)
                                ? 1
                                : 0.3,
                            opacity:
                              i < Math.min(Math.ceil(stats.average / 2), 5)
                                ? 1
                                : 0.3,
                          }}
                          transition={{ delay: i * 0.1, duration: 0.3 }}
                        >
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-violet-500 fill-current" />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-white/80 to-purple-50/50 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden relative group">
                  <CardContent className="p-6 text-center relative z-10">
                    <motion.div
                      className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${getTrendColor()} rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl`}
                      animate={{
                        scale: [1, 1.05, 1],
                        rotate:
                          stats.trend === "improving"
                            ? [0, 5, 0]
                            : stats.trend === "declining"
                              ? [0, -5, 0]
                              : [0, 2, -2, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {getTrendIcon()}
                    </motion.div>
                    <div className="text-lg sm:text-xl font-bold text-slate-800 capitalize mb-2">
                      {stats.trend}
                    </div>
                    <div className="text-sm text-slate-600 font-semibold">
                      Mood Trend
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-white/80 to-emerald-50/50 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden relative group">
                  <CardContent className="p-6 text-center relative z-10">
                    <motion.div
                      className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-2"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {stats.currentStreak}
                    </motion.div>
                    <div className="text-sm text-slate-600 font-semibold mb-2">
                      Current Streak
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 border-0 font-semibold"
                    >
                      <Flame className="w-3 h-3 mr-1" />
                      {stats.currentStreak >= 7
                        ? "On Fire!"
                        : stats.currentStreak >= 3
                          ? "Great!"
                          : "Keep Going!"}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div
              ref={chartsRef}
              className="xl:col-span-2 space-y-4 sm:space-y-8"
              initial={{ opacity: 0, x: 50 }}
              animate={chartsInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-start sm:items-center bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-violet-200/50 relative">
                <div className="flex flex-wrap gap-2 sm:gap-3 items-center w-full sm:w-auto">
                  <div className="text-sm font-semibold text-slate-600 mr-2 flex items-center whitespace-nowrap">
                    <Calendar className="w-4 h-4 mr-1" />
                    Time Range:
                  </div>
                  {[
                    { days: 7, label: "1 Week", icon: Calendar },
                    { days: 30, label: "1 Month", icon: BarChart3 },
                    { days: 90, label: "3 Months", icon: TrendingUp },
                  ].map(({ days, label, icon: Icon }) => (
                    <motion.div
                      key={days}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      <Button
                        onClick={() => {
                          console.log(`📅 Changing time range to ${days} days`);
                          setTimeRange(days);
                        }}
                        variant={timeRange === days ? "default" : "outline"}
                        size="sm"
                        className={
                          timeRange === days
                            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl sm:rounded-2xl shadow-xl text-sm font-semibold px-4 py-2 border-0 relative overflow-hidden"
                            : "border-violet-300 text-violet-700 hover:bg-violet-100 hover:border-violet-400 rounded-xl sm:rounded-2xl transition-all duration-300 backdrop-blur-sm text-sm font-medium px-4 py-2"
                        }
                        disabled={isLoadingData}
                      >
                        {timeRange === days && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-700 to-violet-700 rounded-xl"
                            initial={{ x: "-100%" }}
                            animate={{ x: "0%" }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{label}</span>
                          <span className="sm:hidden">{days}d</span>
                        </span>
                        {timeRange === days && (
                          <motion.div
                            className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-lg"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          />
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-2 items-center w-full sm:w-auto justify-start sm:justify-end">
                  <div className="text-sm font-semibold text-slate-600 mr-2 flex items-center whitespace-nowrap">
                    <BarChart className="w-4 h-4 mr-1" />
                    View:
                  </div>
                  {[
                    {
                      type: "line" as const,
                      icon: LineChart,
                      label: "Timeline",
                      color: "from-blue-600 to-cyan-600",
                    },
                    {
                      type: "pie" as const,
                      icon: PieChart,
                      label: "Distribution",
                      color: "from-emerald-600 to-teal-600",
                    },
                  ].map((chart) => (
                    <motion.div
                      key={chart.type}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        onClick={() => {
                          console.log(
                            `📊 Changing chart type to ${chart.type}`,
                          );
                          setChartType(chart.type);
                        }}
                        variant={
                          chartType === chart.type ? "default" : "outline"
                        }
                        size="sm"
                        className={
                          chartType === chart.type
                            ? `bg-gradient-to-r ${chart.color} text-white rounded-xl shadow-lg font-semibold px-3 py-2 border-0`
                            : "border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-300 px-3 py-2"
                        }
                        disabled={isLoadingData}
                      >
                        <span className="flex items-center gap-1.5">
                          <chart.icon className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            {chart.label}
                          </span>
                        </span>
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {isLoadingData && (
                  <motion.div
                    className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex items-center space-x-2 text-violet-600">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-violet-300 border-t-violet-600 rounded-full"
                      />
                      <span className="text-sm font-medium">
                        Updating charts...
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-white/60 to-purple-50/50">
                  <CardTitle className="flex items-center text-slate-800 text-lg sm:text-xl">
                    <motion.div
                      className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-3 sm:mr-4 shadow-xl"
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </motion.div>
                    <span className="hidden sm:inline">
                      {chartType === "line"
                        ? "Mood Line Chart"
                        : "Mood Distribution"}
                    </span>
                    <span className="sm:hidden">
                      {chartType === "line" ? "Line" : "Distribution"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <AnimatePresence mode="wait">
                    {(Array.isArray(chartData) &&
                      chartData.length > 0 &&
                      chartData.some(
                        (d) => d && typeof d.mood === "number" && d.mood > 0,
                      )) ||
                    (chartType === "pie" &&
                      Array.isArray(stats.moodDistribution) &&
                      stats.moodDistribution.length > 0) ? (
                      <motion.div
                        key={`${chartType}-${animationKey}`}
                        className="w-full"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                      >
                        {chartType === "line" && (
                          <div className="h-64 sm:h-80 lg:h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsLineChart data={chartData}>
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#e2e8f0"
                                />
                                <XAxis
                                  dataKey="day"
                                  tick={{ fontSize: 12, fill: "#64748b" }}
                                  interval="preserveStartEnd"
                                />
                                <YAxis
                                  domain={[0, 10]}
                                  tick={{ fontSize: 12, fill: "#64748b" }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                  type="monotone"
                                  dataKey="mood"
                                  stroke="#8b5cf6"
                                  strokeWidth={3}
                                  dot={{
                                    fill: "#8b5cf6",
                                    strokeWidth: 2,
                                    r: 4,
                                  }}
                                  activeDot={{
                                    r: 6,
                                    stroke: "#8b5cf6",
                                    strokeWidth: 2,
                                  }}
                                />
                              </RechartsLineChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {chartType === "pie" &&
                          stats.moodDistribution.length > 0 && (
                            <div className="w-full space-y-6 sm:space-y-8">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
                                <div className="w-full order-2 lg:order-1">
                                  <div className="h-64 sm:h-80 lg:h-96 w-full">
                                    <ResponsiveContainer
                                      width="100%"
                                      height="100%"
                                    >
                                      <RechartsPieChart>
                                        <Pie
                                          data={stats.moodDistribution}
                                          cx="50%"
                                          cy="50%"
                                          labelLine={false}
                                          innerRadius={50}
                                          outerRadius={120}
                                          paddingAngle={2}
                                          dataKey="count"
                                          animationBegin={0}
                                          animationDuration={800}
                                        >
                                          {stats.moodDistribution.map(
                                            (entry, index) => (
                                              <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                stroke={"#ffffff"}
                                                strokeWidth={2}
                                              />
                                            ),
                                          )}
                                        </Pie>
                                        <Tooltip
                                          content={({ active, payload }) => {
                                            if (
                                              active &&
                                              payload &&
                                              payload.length
                                            ) {
                                              const data = payload[0].payload;
                                              return (
                                                <motion.div
                                                  className="bg-white/95 backdrop-blur-sm border border-violet-200/50 rounded-xl p-4 shadow-xl"
                                                  initial={{
                                                    scale: 0.8,
                                                    opacity: 0,
                                                  }}
                                                  animate={{
                                                    scale: 1,
                                                    opacity: 1,
                                                  }}
                                                  transition={{
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 25,
                                                  }}
                                                >
                                                  <div className="flex items-center space-x-3">
                                                    <div
                                                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                                      style={{
                                                        backgroundColor:
                                                          data.color,
                                                      }}
                                                    />
                                                    <div>
                                                      <p className="font-semibold text-slate-800">
                                                        Range {data.range}
                                                      </p>
                                                      <p className="text-sm text-slate-600">
                                                        {data.count} entries (
                                                        {data.percentage}%)
                                                      </p>
                                                    </div>
                                                  </div>
                                                </motion.div>
                                              );
                                            }
                                            return null;
                                          }}
                                        />
                                      </RechartsPieChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>

                                <div className="w-full order-1 lg:order-2">
                                  <h4 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-6 flex items-center">
                                    <PieChart className="w-5 h-5 mr-2 text-violet-600" />
                                    Mood Distribution
                                  </h4>
                                  <div className="space-y-3 sm:space-y-4">
                                    {stats.moodDistribution.map(
                                      (entry, index) => (
                                        <motion.div
                                          key={entry.range}
                                          className="flex items-center justify-between p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/50 hover:shadow-md transition-all duration-300"
                                          initial={{ opacity: 0, x: 20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{
                                            delay: index * 0.1,
                                            duration: 0.5,
                                          }}
                                          whileHover={{ scale: 1.02, x: 5 }}
                                        >
                                          <div className="flex items-center space-x-3">
                                            <motion.div
                                              className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                                              style={{
                                                backgroundColor: entry.color,
                                              }}
                                              animate={{ scale: [1, 1.1, 1] }}
                                              transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                delay: index * 0.2,
                                              }}
                                            />
                                            <div>
                                              <span className="font-semibold text-slate-800 text-sm sm:text-base">
                                                Range {entry.range}
                                              </span>
                                              <div className="text-xs text-slate-500">
                                                {entry.range === "1-2"
                                                  ? "Very Low"
                                                  : entry.range === "3-4"
                                                    ? "Low"
                                                    : entry.range === "5-6"
                                                      ? "Moderate"
                                                      : entry.range === "7-8"
                                                        ? "Good"
                                                        : "Excellent"}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className="font-bold text-slate-800 text-sm sm:text-base">
                                              {entry.percentage}%
                                            </div>
                                            <div className="text-xs text-slate-500">
                                              {entry.count} entries
                                            </div>
                                          </div>
                                        </motion.div>
                                      ),
                                    )}
                                  </div>

                                  <motion.div
                                    className="mt-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200/50"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                  >
                                    <div className="text-center">
                                      <div className="text-xl sm:text-2xl font-bold text-violet-700 mb-1">
                                        {stats.totalEntries}
                                      </div>
                                      <div className="text-sm text-violet-600 font-semibold">
                                        Total Mood Entries
                                      </div>
                                    </div>
                                  </motion.div>
                                </div>
                              </div>
                            </div>
                          )}
                      </motion.div>
                    ) : (
                      <motion.div
                        className="h-48 sm:h-64 lg:h-80 flex flex-col items-center justify-center text-slate-600 p-8"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div
                          className="w-24 h-24 bg-gradient-to-br from-violet-200 to-purple-300 rounded-3xl flex items-center justify-center mb-6 shadow-xl"
                          animate={{
                            y: [0, -10, 0],
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <Activity className="w-12 h-12 text-violet-600" />
                        </motion.div>
                        <motion.div
                          className="text-center max-w-md"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.6 }}
                        >
                          <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">
                            Welcome to Your Mood Analytics! 🎯
                          </h3>
                          <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-4 mb-4">
                            <p className="text-slate-700 mb-3 font-medium">
                              👆 <strong>Step 1:</strong> Select your current
                              mood level (1-10) in the left panel
                            </p>
                            <p className="text-slate-700 mb-3 font-medium">
                              ✍️ <strong>Step 2:</strong> Add optional notes
                              about your feelings
                            </p>
                            <p className="text-slate-700 font-medium">
                              📊 <strong>Step 3:</strong> Click "Log Mood" to
                              save and see your data here!
                            </p>
                          </div>
                          <motion.div
                            className="inline-flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl shadow-lg cursor-pointer"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 17,
                            }}
                            onClick={() => {
                              const moodSelector = document.querySelector(
                                'input[type="range"], .grid.grid-cols-5',
                              );
                              if (moodSelector) {
                                moodSelector.scrollIntoView({
                                  behavior: "smooth",
                                  block: "center",
                                });
                                moodSelector.style.transition = "all 0.3s ease";
                                moodSelector.style.transform = "scale(1.02)";
                                moodSelector.style.boxShadow =
                                  "0 0 20px rgba(139, 92, 246, 0.3)";
                                setTimeout(() => {
                                  moodSelector.style.transform = "scale(1)";
                                  moodSelector.style.boxShadow = "none";
                                }, 1000);
                              }
                            }}
                          >
                            <Plus className="w-5 h-5" />
                            <span className="text-sm sm:text-base font-semibold">
                              Log Your First Mood →
                            </span>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-white/60 to-pink-50/50">
                  <CardTitle className="flex items-center text-slate-800 text-xl">
                    <motion.div
                      className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-4 shadow-xl"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Calendar className="w-5 h-5 text-white" />
                    </motion.div>
                    Recent Mood Entries (
                    {timeRange === 7
                      ? "7 days"
                      : timeRange === 30
                        ? "30 days"
                        : "90 days"}
                    )
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {moodEntries.length > 0 ? (
                    <div className="space-y-4 max-h-48 sm:max-h-64 overflow-y-auto">
                      {(() => {
                        const today = new Date();
                        const cutoffDate = subDays(today, timeRange - 1);
                        const filteredEntries = moodEntries.filter((entry) => {
                          try {
                            const entryDate = new Date(
                              entry.createdAt || entry.created_at,
                            );
                            const entryDateStart = startOfDay(entryDate);
                            const cutoffDateStart = startOfDay(cutoffDate);
                            const isInRange = entryDateStart >= cutoffDateStart;
                            console.log(
                              `📅 Entry ${entry.id}: ${entryDateStart.toLocaleDateString()} >= ${cutoffDateStart.toLocaleDateString()}? ${isInRange}`,
                            );
                            return isInRange;
                          } catch (error) {
                            console.warn(
                              "Error filtering entry by date:",
                              entry,
                            );
                            return false;
                          }
                        });

                        console.log(`🔍 Time range: ${timeRange} days`);
                        console.log(`📅 Today: ${today.toLocaleDateString()}`);
                        console.log(
                          `📅 Cutoff date (${timeRange - 1} days ago): ${cutoffDate.toLocaleDateString()}`,
                        );
                        console.log(
                          `🔍 Filtered ${filteredEntries.length} entries from ${moodEntries.length} total for ${timeRange}-day range`,
                        );
                        console.log(
                          "Filtered entries:",
                          filteredEntries.map((e) => ({
                            id: e.id,
                            date: new Date(
                              e.createdAt || e.created_at,
                            ).toLocaleDateString(),
                          })),
                        );

                        return filteredEntries.slice(-5).reverse();
                      })().map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          className="flex items-start space-x-4 p-6 bg-gradient-to-r from-violet-50/50 to-purple-50/50 rounded-2xl backdrop-blur-sm border border-violet-200/50 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                        >
                          <div className="flex-shrink-0">
                            <motion.div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg ${getMoodGradient(entry.moodLevel || entry.mood_level)} group-hover:scale-110 transition-transform duration-300`}
                              whileHover={{ rotate: 5 }}
                            >
                              {entry.moodLevel || entry.mood_level}
                            </motion.div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm text-slate-600 font-semibold">
                                {format(
                                  new Date(entry.createdAt || entry.created_at),
                                  "MMM dd, yyyy 'at' h:mm a",
                                )}
                              </span>
                              <Badge
                                variant="secondary"
                                className="bg-violet-100 text-violet-700 border-0 text-xs"
                              >
                                {getMoodEmoji(
                                  entry.moodLevel || entry.mood_level,
                                )}
                              </Badge>
                            </div>
                            {entry.notes && (
                              <motion.p
                                className="text-sm text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl"
                                initial={{ opacity: 0.8 }}
                                whileHover={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                {entry.notes}
                              </motion.p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      className="text-center py-12"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <motion.div
                        className="w-20 h-20 bg-gradient-to-br from-slate-200 to-violet-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                        animate={{
                          y: [0, -10, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Heart className="w-10 h-10 text-slate-500" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">
                        {moodEntries.length === 0
                          ? "No mood entries yet"
                          : `No entries in the last ${timeRange} days`}
                      </h3>
                      <p className="text-slate-600 max-w-sm mx-auto leading-relaxed">
                        {moodEntries.length === 0
                          ? "Start tracking your emotional journey! Your first mood entry is just a click away."
                          : `Try selecting a longer time range or log a new mood entry to see recent data.`}
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <AnimatePresence>
            {(insights && insights.trim().length > 0) ||
            moodEntries.length >= 0 ? (
              <motion.div
                ref={insightsRef}
                className="mt-12 lg:mt-16"
                initial={{ opacity: 0, y: 50 }}
                animate={insightsInView ? { opacity: 1, y: 0 } : {}}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="border-0 bg-gradient-to-br from-white/80 to-violet-50/50 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden relative">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-violet-400/5 to-purple-400/5"
                    animate={{
                      background: [
                        "linear-gradient(to bottom right, rgba(139, 92, 246, 0.05), rgba(168, 85, 247, 0.05))",
                        "linear-gradient(to bottom right, rgba(168, 85, 247, 0.05), rgba(236, 72, 153, 0.05))",
                        "linear-gradient(to bottom right, rgba(139, 92, 246, 0.05), rgba(168, 85, 247, 0.05))",
                      ],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  <CardHeader className="bg-gradient-to-r from-white/60 to-violet-50/50">
                    <CardTitle className="flex items-center text-slate-800 text-xl">
                      <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-pink-500 to-violet-600 rounded-2xl flex items-center justify-center mr-4 shadow-xl"
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Sparkles className="w-5 h-5 text-white" />
                      </motion.div>
                      Mood Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 relative z-10">
                    <motion.div
                      className="prose prose-lg max-w-none"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                    >
                      <motion.div
                        className="text-slate-700 leading-relaxed text-base font-medium bg-gradient-to-br from-white/60 to-purple-50/30 p-6 rounded-3xl relative overflow-hidden"
                        whileHover={{ scale: 1.01 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-violet-400/5 to-purple-400/5 rounded-3xl"
                          animate={{
                            opacity: [0, 0.1, 0],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                        <span className="relative z-10">
                          {insights && insights.trim().length > 0
                            ? insights
                            : moodEntries.length === 0
                              ? "🌱 Welcome to your mood tracking journey! Every emotion you track helps you understand yourself better. Start by logging your current mood to see personalized insights and patterns. Remember: your feelings are valid, and this journey is uniquely yours. ✨"
                              : "🔄 Your mood insights are being processed. Continue tracking your daily moods to see personalized patterns and meaningful analysis of your emotional journey. Every entry helps build a clearer picture of your wellbeing! ✨"}
                        </span>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <motion.div
            className="mt-16 lg:mt-20 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
          >
            <motion.div
              className="bg-white/70 backdrop-blur-xl border border-violet-200/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 shadow-2xl max-w-5xl mx-auto relative overflow-hidden"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-violet-400/5 to-purple-400/5"
                animate={{
                  background: [
                    "linear-gradient(to bottom right, rgba(139, 92, 246, 0.05), rgba(168, 85, 247, 0.05))",
                    "linear-gradient(to bottom right, rgba(168, 85, 247, 0.05), rgba(236, 72, 153, 0.05))",
                    "linear-gradient(to bottom right, rgba(139, 92, 246, 0.05), rgba(168, 85, 247, 0.05))",
                  ],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <div className="relative z-10">
                <motion.div
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent mb-4 sm:mb-6">
                  Your Emotional Intelligence Journey
                </h3>
                <p className="text-base sm:text-lg lg:text-xl text-slate-700 leading-relaxed max-w-4xl mx-auto">
                  Understanding your emotions is the first step toward emotional
                  mastery. Every mood you track brings you closer to knowing
                  yourself deeply.{" "}
                  <motion.span
                    className="text-violet-600 font-bold"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Your feelings are valid, your journey is unique, and your
                    growth is beautiful.
                  </motion.span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
