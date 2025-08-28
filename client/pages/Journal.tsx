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
  Send,
  Sparkles,
  Moon,
  BookOpen,
  Save,
  Share2,
  Copy,
  Star,
  Zap,
  Feather,
  Smile,
  Meh,
  Frown,
  Crown,
  Sun,
  Eye,
  PenTool,
  Clock,
  Lightbulb,
  Palette,
  Target,
  Coffee,
  Leaf,
  Cloud,
  Wind,
  Flame,
  Droplets,
  Music,
  Gem,
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
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  JournalEntryRequest,
  JournalEntryResponse,
  ApiError,
} from "@shared/api";

export default function Journal() {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const [entry, setEntry] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mood, setMood] = useState<number | undefined>(undefined);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [writingFocus, setWritingFocus] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const journalRef = useRef<HTMLDivElement>(null);
  const aiResponseRef = useRef<HTMLDivElement>(null);

  const journalInView = useInView(journalRef, { once: true, margin: "-100px" });
  const aiInView = useInView(aiResponseRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    const words = entry
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    setWordCount(words.length);
    setCharCount(entry.length);
    setReadingTime(Math.ceil(words.length / 200));
  }, [entry]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (entry.length > 50) {
      const timer = setTimeout(() => {
        console.log("Draft auto-saved");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [entry]);

  const handleLogout = async () => {
    try {
      console.log("🔄 Initiating logout from Journal page...");
      const { error } = await signOut();

      if (error) {
        console.error("❌ Logout failed:", error.message);
      } else {
        console.log("✅ Logout successful from Journal page");
      }

      navigate("/");
    } catch (error) {
      console.error("❌ Logout error:", error);
      navigate("/");
    }
  };

  const handleSubmit = async () => {
    if (!entry.trim()) return;

    setIsGenerating(true);
    setError(null);
    setIsAnimating(true);

    try {
      const requestData: JournalEntryRequest = {
        content: entry,
        mood,
        email: user?.email || "demo@soulspeak.com",
        userName:
          user?.user_metadata?.name || user?.email?.split("@")[0] || "User",
      };

      const response = await fetch("/api/journal/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create journal entry");
      }

      const responseData = await response.json();

      setTimeout(() => {
        setAiResponse(responseData.entry.aiResponse);
        setEntry("");
        setMood(undefined);
        setCurrentPrompt(null);
      }, 2000);
    } catch (err) {
      console.error("Error submitting journal entry:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );

      const fallbackResponses = [
        `Dear beautiful soul, I can sense the depth of what you're sharing, and I want you to know that your feelings are completely valid and important. Thank you for trusting this space with your innermost thoughts. You're incredibly brave for taking this step toward healing, and you're not walking this path alone. Every word you've written here matters, and so do you. 💜✨`,

        `I'm holding space for you and everything you're experiencing right now. Your willingness to express your truth, even when it's difficult, shows such remarkable courage and self-compassion. This moment of reflection is a gift you're giving yourself, and I'm honored to witness your journey. Remember, healing isn't linear, and you're exactly where you need to be. 🌙💫`,

        `Your heart speaks so eloquently through these words, and I can feel the strength it took to share them. Thank you for allowing yourself to be vulnerable in this sacred space. You're creating something beautiful here - a testament to your resilience and your commitment to growth. Keep nurturing this relationship with yourself; you deserve all the love and understanding you're seeking. ✨🌸`,
      ];

      const randomResponse =
        fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

      setTimeout(() => {
        setAiResponse(randomResponse);
        setEntry("");
        setMood(undefined);
      }, 1500);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const fetchAllEntries = async () => {
    setIsLoadingEntries(true);
    try {
      const response = await fetch(
        `/api/journal/entries?email=${encodeURIComponent(user?.email || "demo@soulspeak.com")}&limit=50`,
      );
      if (response.ok) {
        const data = await response.json();
        setAllEntries(data.entries || []);
        setShowAllEntries(true);
      } else {
        console.error("Failed to fetch entries:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const handleSaveReflection = () => {
    if (!aiResponse) return;

    const blob = new Blob(
      [
        `✨ SoulSpeak Reflection ✨\n\n` +
          `Date: ${new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}\n\n` +
          `Your Entry:\n${entry}\n\n` +
          `Mood Level: ${mood ? `${mood}/10` : "Not specified"}\n\n` +
          `AI Reflection:\n${aiResponse}\n\n` +
          `💜 Keep nurturing your healing journey with SoulSpeak`,
      ],
      { type: "text/plain" },
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `soulspeak-reflection-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleCopyReflection = () => {
    if (!aiResponse) return;
    navigator.clipboard.writeText(aiResponse);
  };

  const handleShareAnonymously = () => {
    if (!aiResponse) return;

    const shareText = `🌙 Anonymous SoulSpeak Reflection 🌙\n\n"${aiResponse}"\n\n✨ Discover your own healing journey at SoulSpeak ✨`;
    navigator.clipboard.writeText(shareText);
  };

  const getMoodIcon = (moodValue: number) => {
    if (moodValue <= 2) return <Frown className="w-3 h-3" />;
    if (moodValue <= 6) return <Meh className="w-3 h-3" />;
    return <Smile className="w-3 h-3" />;
  };

  const getMoodColor = (moodValue: number) => {
    if (moodValue <= 2) return "from-rose-400 to-red-400";
    if (moodValue <= 6) return "from-amber-400 to-orange-400";
    return "from-emerald-400 to-green-400";
  };

  const getMoodEmoji = (moodValue: number) => {
    if (moodValue <= 2) return "😔";
    if (moodValue <= 4) return "😐";
    if (moodValue <= 6) return "🙂";
    if (moodValue <= 8) return "����";
    return "🌟";
  };

  const writingPrompts = [
    {
      text: "I'm feeling overwhelmed because...",
      icon: <Cloud className="w-5 h-5" />,
      gradient: "from-slate-100 to-gray-100",
      category: "Overwhelm",
    },
    {
      text: "Today I'm grateful for...",
      icon: <Heart className="w-5 h-5" />,
      gradient: "from-rose-100 to-pink-100",
      category: "Gratitude",
    },
    {
      text: "I've been thinking about...",
      icon: <Lightbulb className="w-5 h-5" />,
      gradient: "from-amber-100 to-yellow-100",
      category: "Reflection",
    },
    {
      text: "Something that made me smile was...",
      icon: <Sun className="w-5 h-5" />,
      gradient: "from-orange-100 to-yellow-100",
      category: "Joy",
    },
    {
      text: "I'm worried about...",
      icon: <Wind className="w-5 h-5" />,
      gradient: "from-blue-100 to-cyan-100",
      category: "Anxiety",
    },
    {
      text: "I want to let go of...",
      icon: <Leaf className="w-5 h-5" />,
      gradient: "from-green-100 to-emerald-100",
      category: "Release",
    },
  ];

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
            <BookOpen className="w-12 h-12 text-white" />
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
            Loading your sacred space...
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
        title="Journal"
        subtitle="Your Healing Sanctuary"
        icon={<BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-white" />}
        currentPage="journal"
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-20 overflow-x-hidden">
        <div className="w-full">
          <motion.div
            className="text-center mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-lg border border-violet-200/50 rounded-full mb-8 shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Crown className="w-5 h-5 text-violet-600 mr-3 animate-pulse" />
              <span className="text-sm font-semibold text-slate-700">
                Your Personal Sanctuary
              </span>
            </motion.div>

            <motion.h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-700 via-purple-700 to-pink-700 bg-clip-text text-transparent mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Your Sacred Writing Space
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl lg:text-2xl text-slate-600 leading-relaxed max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Pour out your deepest feelings and receive{" "}
              <motion.span
                className="text-violet-600 font-bold"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                soul-touching reflections.
              </motion.span>
              <br className="hidden sm:block" />
              <motion.span
                className="text-purple-600 font-semibold"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                This is your safe haven for authentic self-expression.
              </motion.span>
            </motion.p>
          </motion.div>

          <AnimatePresence>
            {showSaveSuccess && (
              <motion.div
                className="fixed top-24 right-4 z-50"
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Alert className="bg-emerald-50 border-emerald-200 shadow-xl backdrop-blur-sm rounded-2xl">
                  <Save className="h-5 w-5 text-emerald-600" />
                  <AlertDescription className="text-emerald-800 font-semibold">
                    Reflection saved successfully! 💚
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid xl:grid-cols-2 gap-6 lg:gap-12">
            <motion.div
              ref={journalRef}
              initial={{ opacity: 0, x: -50 }}
              animate={journalInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl group overflow-hidden relative h-full">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"
                  animate={{
                    background: writingFocus
                      ? "linear-gradient(to bottom right, rgba(255,255,255,0.3), rgba(139,92,246,0.05))"
                      : "linear-gradient(to bottom right, rgba(255,255,255,0.2), transparent)",
                  }}
                  transition={{ duration: 0.3 }}
                />

                <CardHeader className="relative bg-gradient-to-r from-white/50 to-transparent">
                  <CardTitle className="flex items-center text-slate-800 text-xl sm:text-2xl group-hover:text-violet-700 transition-colors duration-300">
                    <motion.div
                      className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-xl"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      <PenTool className="w-5 h-5 text-white" />
                    </motion.div>
                    What's flowing through your heart?
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 relative p-6 lg:p-8">
                  <motion.div
                    className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-violet-50/50 to-purple-50/50 rounded-2xl border border-violet-200/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <motion.div
                        className="flex items-center space-x-2 text-violet-600"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Feather className="w-4 h-4" />
                        <span className="font-medium">{wordCount} words</span>
                      </motion.div>
                      <motion.div
                        className="flex items-center space-x-2 text-purple-600"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Target className="w-4 h-4" />
                        <span className="font-medium">
                          {charCount} characters
                        </span>
                      </motion.div>
                      <motion.div
                        className="flex items-center space-x-2 text-indigo-600"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">
                          {readingTime} min read
                        </span>
                      </motion.div>
                    </div>

                    {entry.length > 50 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-700 border-0 font-medium"
                        >
                          <Gem className="w-3 h-3 mr-1" />
                          Auto-saved
                        </Badge>
                      </motion.div>
                    )}
                  </motion.div>

                  <div className="space-y-6">
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-violet-400/10 to-purple-400/10 rounded-3xl opacity-0"
                        animate={{
                          opacity: writingFocus ? [0, 0.3, 0] : 0,
                        }}
                        transition={{
                          duration: 3,
                          repeat: writingFocus ? Infinity : 0,
                          ease: "easeInOut",
                        }}
                      />

                      <Textarea
                        ref={textareaRef}
                        placeholder={
                          currentPrompt ||
                          "Let your thoughts flow like water... Share your fears, hopes, dreams, struggles, victories. This sacred space holds everything with love and without judgment. Your authentic voice matters here."
                        }
                        value={entry}
                        onChange={(e) => setEntry(e.target.value)}
                        onFocus={() => setWritingFocus(true)}
                        onBlur={() => setWritingFocus(false)}
                        className="min-h-[280px] sm:min-h-[320px] border-0 bg-white/70 backdrop-blur-sm resize-none text-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-violet-500/50 rounded-3xl shadow-inner text-base leading-relaxed transition-all duration-300 focus:bg-white/90 p-6 relative z-10"
                      />

                      <motion.div
                        className="absolute bottom-4 right-4 flex items-center space-x-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: entry.length > 0 ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {writingFocus && (
                          <motion.div
                            className="text-xs text-violet-600 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-xl shadow-sm border border-violet-200/50"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          >
                            Writing mode active
                          </motion.div>
                        )}
                      </motion.div>
                    </div>

                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    >
                      <label className="text-base font-semibold text-slate-700 flex items-center">
                        <Heart className="w-5 h-5 mr-3 text-violet-600" />
                        How does your heart feel right now?
                      </label>

                      <div className="grid grid-cols-5 sm:grid-cols-11 gap-2 sm:gap-3">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((moodValue) => (
                          <motion.button
                            key={moodValue}
                            type="button"
                            onClick={() =>
                              setMood(
                                mood === moodValue ? undefined : moodValue,
                              )
                            }
                            className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-3xl text-sm font-bold transition-all duration-300 relative overflow-hidden group ${
                              mood === moodValue
                                ? `bg-gradient-to-br ${getMoodColor(moodValue)} text-white shadow-2xl scale-110 ring-2 ring-white`
                                : "bg-white/80 text-slate-600 hover:bg-white/95 backdrop-blur-sm border border-violet-200/50 hover:border-violet-300/70"
                            }`}
                            whileHover={{
                              scale: mood === moodValue ? 1.15 : 1.1,
                            }}
                            whileTap={{ scale: 0.95 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 17,
                            }}
                          >
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              initial={false}
                            />

                            <span className="relative z-10">{moodValue}</span>

                            {mood === moodValue && (
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
                                {getMoodEmoji(moodValue)}
                              </motion.div>
                            )}
                          </motion.button>
                        ))}
                      </div>

                      <div className="flex justify-between text-xs sm:text-sm text-slate-500 px-2">
                        <motion.span
                          className="flex items-center"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Frown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">Lowest Point</span>
                          <span className="sm:hidden">Low</span>
                        </motion.span>
                        <motion.span
                          className="flex items-center"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Smile className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">Highest Joy</span>
                          <span className="sm:hidden">High</span>
                        </motion.span>
                      </div>
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Alert className="border-rose-200 bg-rose-50/80 backdrop-blur-sm rounded-2xl">
                          <AlertDescription className="text-rose-800 font-semibold">
                            {error}
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="text-sm text-slate-600 flex flex-wrap items-center gap-4">
                        <motion.span
                          className="flex items-center bg-violet-50 px-3 py-1 rounded-xl"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Zap className="w-4 h-4 mr-2 text-violet-600" />
                          {entry.length} characters
                        </motion.span>
                        <motion.span
                          className="flex items-center bg-purple-50 px-3 py-1 rounded-xl"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Star className="w-4 h-4 mr-2 text-purple-600" />
                          Encrypted & private
                        </motion.span>
                        {mood !== undefined && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          >
                            <Badge
                              variant="secondary"
                              className="bg-gradient-to-r from-pink-100 to-violet-100 border-0 text-slate-700"
                            >
                              <Heart className="w-3 h-3 mr-1" />
                              Mood: {mood}/10
                            </Badge>
                          </motion.div>
                        )}
                      </div>

                      <motion.div
                        className="flex justify-end"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={handleSubmit}
                          disabled={!entry.trim() || isGenerating}
                          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-3xl px-8 py-4 shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-violet-700 to-purple-700"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "0%" }}
                            transition={{ duration: 0.3 }}
                          />

                          <span className="relative z-10 flex items-center">
                            {isGenerating ? (
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
                                Crafting your reflection...
                              </>
                            ) : (
                              <>
                                <Send className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
                                Share with AI
                              </>
                            )}
                          </span>
                        </Button>
                      </motion.div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-violet-200/50">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={fetchAllEntries}
                          disabled={isLoadingEntries}
                          variant="outline"
                          className="w-full border-purple-300 text-purple-700 hover:bg-purple-100 rounded-2xl px-6 py-3 shadow-sm hover:shadow-lg transition-all duration-300"
                        >
                          {isLoadingEntries ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              >
                                <Sparkles className="w-4 h-4 mr-2" />
                              </motion.div>
                              Loading entries...
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-4 h-4 mr-2" />
                              View All Entries
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              ref={aiResponseRef}
              initial={{ opacity: 0, x: 50 }}
              animate={aiInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card
                className={`border-0 bg-gradient-to-br from-white/80 to-purple-50/50 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden relative h-full ${isAnimating ? "animate-pulse" : ""}`}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-100/10 to-violet-100/10 pointer-events-none"
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

                <CardHeader className="relative bg-gradient-to-r from-white/60 to-purple-50/50">
                  <CardTitle className="flex items-center text-slate-800 text-xl sm:text-2xl">
                    <motion.div
                      className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mr-4 shadow-xl"
                      animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, -2, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </motion.div>
                    AI Soul Companion
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative min-h-[500px] flex flex-col p-6 lg:p-8">
                  <AnimatePresence mode="wait">
                    {isGenerating ? (
                      <motion.div
                        key="generating"
                        className="flex-1 flex flex-col items-center justify-center py-20 text-center"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div
                          className="w-24 h-24 bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl"
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 180, 360],
                          }}
                          transition={{
                            scale: {
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            },
                            rotate: {
                              duration: 3,
                              repeat: Infinity,
                              ease: "linear",
                            },
                          }}
                        >
                          <Heart className="w-12 h-12 text-white" />
                        </motion.div>

                        <motion.div
                          className="space-y-4 mb-6"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.6 }}
                        >
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="h-3 bg-slate-300 rounded-full mx-auto"
                              style={{ width: `${40 + i * 8}%` }}
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut",
                              }}
                            />
                          ))}
                        </motion.div>

                        <motion.p
                          className="text-slate-700 mb-3 font-semibold text-lg"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          Feeling your words deeply...
                        </motion.p>
                        <p className="text-slate-500">
                          Crafting a heartfelt response with love and wisdom
                        </p>
                      </motion.div>
                    ) : aiResponse ? (
                      <motion.div
                        key="response"
                        className="flex-1 space-y-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.6 }}
                      >
                        <motion.div
                          className="prose prose-lg max-w-none"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.6 }}
                        >
                          <motion.div
                            className="text-slate-700 leading-relaxed whitespace-pre-line text-base font-medium bg-gradient-to-br from-white/60 to-purple-50/30 p-6 rounded-3xl relative overflow-hidden"
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
                            <span className="relative z-10">{aiResponse}</span>
                          </motion.div>
                        </motion.div>

                        <motion.div
                          className="flex flex-col space-y-6 pt-6 border-t border-violet-200/50"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.6 }}
                        >
                          <div className="flex items-center justify-between">
                            <motion.div
                              className="text-sm text-slate-600 flex items-center bg-purple-50 px-3 py-2 rounded-xl"
                              whileHover={{ scale: 1.05 }}
                            >
                              <Heart className="w-4 h-4 mr-2 text-purple-600" />
                              Generated with empathy and care
                            </motion.div>
                            <Badge
                              variant="outline"
                              className="bg-white/80 border-violet-300 text-violet-700 shadow-sm hover:shadow-lg transition-shadow duration-300"
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Reflection
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <motion.div
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 17,
                              }}
                            >
                              <Button
                                onClick={handleSaveReflection}
                                variant="outline"
                                size="sm"
                                className="border-violet-300 text-violet-700 hover:bg-violet-100 rounded-2xl backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 w-full"
                              >
                                <Save className="w-4 h-4 mr-2" />
                                Save
                              </Button>
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 17,
                              }}
                            >
                              <Button
                                onClick={handleCopyReflection}
                                variant="outline"
                                size="sm"
                                className="border-purple-300 text-purple-700 hover:bg-purple-100 rounded-2xl backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 w-full"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy
                              </Button>
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 17,
                              }}
                            >
                              <Button
                                onClick={handleShareAnonymously}
                                variant="outline"
                                size="sm"
                                className="border-pink-300 text-pink-700 hover:bg-pink-100 rounded-2xl backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 w-full"
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        className="flex-1 flex flex-col items-center justify-center py-20 text-center"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <motion.div
                          className="w-24 h-24 bg-gradient-to-br from-slate-200 to-violet-200 rounded-3xl flex items-center justify-center mb-8 shadow-xl"
                          animate={{
                            y: [0, -10, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <Heart className="w-12 h-12 text-slate-500" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-4">
                          Ready to listen to your heart
                        </h3>
                        <p className="text-slate-600 mb-3 max-w-sm leading-relaxed">
                          Share your authentic thoughts to receive a caring,
                          personalized reflection
                        </p>
                        <p className="text-sm text-slate-500">
                          Your AI companion is waiting with infinite patience
                          and love
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <AnimatePresence>
            {showAllEntries && (
              <motion.div
                className="mt-12 lg:mt-16"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden relative">
                  <CardHeader className="relative bg-gradient-to-r from-white/50 to-transparent">
                    <CardTitle className="flex items-center justify-between text-slate-800 text-xl sm:text-2xl">
                      <div className="flex items-center">
                        <motion.div
                          className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mr-4 shadow-xl"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <BookOpen className="w-5 h-5 text-white" />
                        </motion.div>
                        All Your Journal Entries
                      </div>
                      <div className="flex items-center space-x-2">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={() => {
                              setShowAllEntries(false);
                              window.location.href = "/my-entries";
                            }}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            onClick={() => setShowAllEntries(false)}
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-slate-700"
                          >
                            ✕
                          </Button>
                        </motion.div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 lg:p-8">
                    {allEntries.length === 0 ? (
                      <motion.div
                        className="text-center py-12"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <motion.div
                          className="w-16 h-16 bg-gradient-to-br from-slate-200 to-violet-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                          animate={{
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <BookOpen className="w-8 h-8 text-slate-500" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                          No entries yet
                        </h3>
                        <p className="text-slate-600">
                          Start your healing journey by writing your first
                          journal entry above.
                        </p>
                      </motion.div>
                    ) : (
                      <div className="space-y-4 max-h-64 sm:max-h-80 overflow-y-auto">
                        {allEntries.map((entry, index) => (
                          <motion.div
                            key={entry.id || index}
                            className="bg-gradient-to-br from-white/60 to-purple-50/30 p-6 rounded-2xl border border-violet-200/50 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ scale: 1.01, x: 5 }}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <motion.div
                                  className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center"
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                >
                                  <Heart className="w-4 h-4 text-white" />
                                </motion.div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-700">
                                    {new Date(
                                      entry.createdAt,
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                  {entry.mood !== undefined && (
                                    <Badge
                                      variant="secondary"
                                      className="mt-1 bg-gradient-to-r from-pink-100 to-violet-100 border-0 text-slate-700"
                                    >
                                      <Heart className="w-3 h-3 mr-1" />
                                      Mood: {entry.mood}/10
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            {entry.aiResponse && (
                              <motion.div
                                className="prose prose-sm max-w-none"
                                initial={{ opacity: 0.8 }}
                                whileHover={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                  {entry.aiResponse.length > 200
                                    ? entry.aiResponse.substring(0, 200) + "..."
                                    : entry.aiResponse}
                                </p>
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="mt-16 lg:mt-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <motion.h3
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                Gentle Nudges for Your Heart
              </motion.h3>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Sometimes we need a gentle invitation to explore our inner
                landscape.
                <br className="hidden sm:block" />
                Choose a prompt that resonates with your soul today.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
              {writingPrompts.map((prompt, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setCurrentPrompt(prompt.text);
                    setEntry(prompt.text);
                    textareaRef.current?.focus();
                  }}
                  className={`w-full h-auto p-6 lg:p-8 text-left border border-violet-200/50 bg-gradient-to-br ${prompt.gradient} backdrop-blur-sm hover:bg-violet-50 hover:border-violet-300 hover:shadow-xl transition-all duration-300 rounded-3xl group overflow-hidden relative`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                  whileHover={{
                    scale: 1.02,
                    y: -5,
                    boxShadow: "0 20px 40px rgba(139, 92, 246, 0.15)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                  />

                  <div className="space-y-4 w-full relative z-10">
                    <div className="flex items-start space-x-4 w-full">
                      <motion.div
                        className="w-12 h-12 flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-violet-600 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17,
                        }}
                      >
                        {prompt.icon}
                      </motion.div>
                      <div className="flex-1 min-w-0 w-full">
                        <div className="text-sm font-semibold text-violet-600 mb-2 break-words">
                          {prompt.category}
                        </div>
                        <div className="text-base lg:text-lg font-bold text-slate-800 leading-relaxed break-words">
                          "{prompt.text}"
                        </div>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="mt-16 lg:mt-20 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            <motion.div
              className="bg-white/70 backdrop-blur-xl border border-violet-200/50 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 shadow-2xl max-w-5xl mx-auto relative overflow-hidden"
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
                  className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
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
                  <Sun className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent mb-6">
                  Your Journey of Self-Discovery
                </h3>
                <p className="text-lg lg:text-xl text-slate-700 leading-relaxed max-w-4xl mx-auto">
                  Every word you write here is a step toward deeper
                  self-understanding. Your vulnerability is your strength, your
                  authenticity is your superpower, and your willingness to
                  explore your inner world is truly beautiful.{" "}
                  <motion.span
                    className="text-violet-600 font-bold"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Keep shining, beautiful soul.
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
