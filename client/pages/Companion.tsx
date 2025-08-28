import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
}
import {
  Brain,
  Send,
  Sparkles,
  Heart,
  MessageCircle,
  Lightbulb,
  Moon,
  Sun,
  Zap,
  Star,
  Globe,
  Shield,
  Target,
  Activity,
  Mic,
  Smile,
  Coffee,
  Music,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import AppNavigation from "../components/ui/app-navigation";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
  mood?: "supportive" | "encouraging" | "thoughtful" | "empathetic";
}

export default function Companion() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [aiMood, setAiMood] = useState<"calm" | "active" | "thoughtful">(
    "calm",
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true";

      if (!isInputFocused && !isLoading) {
        const isPrintableKey =
          e.key.length === 1 || e.key === "Backspace" || e.key === "Delete";
        const isModifierPressed = e.ctrlKey || e.metaKey || e.altKey;

        if (isPrintableKey && !isModifierPressed) {
          e.preventDefault();
          textareaRef.current?.focus();

          if (e.key.length === 1) {
            setInputMessage((prev) => prev + e.key);
          } else if (e.key === "Backspace") {
            setInputMessage((prev) => prev.slice(0, -1));
          }
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: inputMessage.trim(),
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(true);
    setAiMood("active");

    setTimeout(() => setAiMood("thoughtful"), 1000);

    try {
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      const response = await fetch("/api/companion/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: conversationHistory,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        const responseContent = data.response.toLowerCase();
        let mood: Message["mood"] = "supportive";
        if (
          responseContent.includes("growth") ||
          responseContent.includes("progress")
        ) {
          mood = "encouraging";
        } else if (
          responseContent.includes("understand") ||
          responseContent.includes("feel")
        ) {
          mood = "empathetic";
        } else if (
          responseContent.includes("think") ||
          responseContent.includes("consider")
        ) {
          mood = "thoughtful";
        }

        setTimeout(() => {
          const aiMessage: Message = {
            id: `ai_${Date.now()}`,
            content: data.response,
            sender: "ai",
            timestamp: new Date().toISOString(),
            mood,
          };
          setMessages((prev) => [...prev, aiMessage]);
          setIsTyping(false);
          setAiMood("calm");
        }, 1500);
      } else {
        throw new Error("Failed to get AI response");
      }
    } catch (error) {
      console.log("Chat error:", error);
      setTimeout(() => {
        const errorMessage: Message = {
          id: `ai_error_${Date.now()}`,
          content:
            "I'm having trouble responding right now. Please try again in a moment. Your wellbeing is important to me.",
          sender: "ai",
          timestamp: new Date().toISOString(),
          mood: "empathetic",
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsTyping(false);
        setAiMood("calm");
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMoodColor = (mood?: Message["mood"]) => {
    switch (mood) {
      case "encouraging":
        return "from-emerald-400 to-green-500";
      case "empathetic":
        return "from-purple-400 to-violet-500";
      case "thoughtful":
        return "from-blue-400 to-indigo-500";
      default:
        return "from-violet-400 to-purple-500";
    }
  };

  const getMoodIcon = (mood?: Message["mood"]) => {
    switch (mood) {
      case "encouraging":
        return <Star className="w-4 h-4" />;
      case "empathetic":
        return <Heart className="w-4 h-4" />;
      case "thoughtful":
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const quickSuggestions = [
    {
      text: "I'm feeling overwhelmed with work lately...",
      category: "Work Stress",
      icon: <Target className="w-4 h-4" />,
      gradient: "from-rose-100 to-pink-100",
    },
    {
      text: "I've been feeling anxious about the future...",
      category: "Anxiety",
      icon: <Shield className="w-4 h-4" />,
      gradient: "from-blue-100 to-cyan-100",
    },
    {
      text: "I want to talk about my relationships...",
      category: "Relationships",
      icon: <Heart className="w-4 h-4" />,
      gradient: "from-purple-100 to-violet-100",
    },
    {
      text: "I'm struggling with self-doubt...",
      category: "Self-Doubt",
      icon: <Lightbulb className="w-4 h-4" />,
      gradient: "from-amber-100 to-yellow-100",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
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
            <Brain className="w-12 h-12 text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <p className="text-slate-700 font-semibold text-lg">
              Loading your companion...
            </p>
            <div className="flex justify-center space-x-1 mt-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-violet-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col overflow-hidden relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-[8%] w-24 h-24 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-violet-200/20 rounded-full blur-3xl hidden sm:block"
          {...(!isMobile && {
            animate: {
              scale: [1, 1.2, 1],
            },
            transition: {
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            },
          })}
        />
        <motion.div
          className="absolute top-3/4 right-[8%] w-24 h-24 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-purple-200/20 rounded-full blur-3xl hidden sm:block"
          {...(!isMobile && {
            animate: {
              scale: [1, 0.8, 1],
            },
            transition: {
              scale: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              },
            },
          })}
        />
      </div>

      <AppNavigation
        title="AI Companion"
        subtitle="Your Mental Health Support"
        icon={<Brain className="w-4 h-4 sm:w-6 sm:h-6 text-white" />}
        currentPage="companion"
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <motion.div
          className="bg-white/80 backdrop-blur-xl border-b border-violet-200/50 px-4 py-3 shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                className={`w-8 h-8 bg-gradient-to-br ${getMoodColor()} rounded-xl flex items-center justify-center shadow-lg`}
                {...(!isMobile && {
                  animate: {
                    scale: aiMood === "active" ? [1, 1.2, 1] : [1, 1.05, 1],
                    rotate:
                      aiMood === "thoughtful" ? [0, 5, -5, 0] : [0, 2, -2, 0],
                  },
                  transition: {
                    duration: aiMood === "active" ? 0.5 : 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                })}
              >
                <Brain className="w-4 h-4 text-white" />
              </motion.div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-slate-800">
                    AI Companion
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-xs bg-gradient-to-r ${getMoodColor()} text-white border-0`}
                  >
                    {isTyping ? "Thinking..." : aiMood}
                  </Badge>
                </div>
                <div className="text-xs text-slate-600">
                  Always here to listen and support you
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <motion.div
                className="flex items-center space-x-1"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-xs text-slate-600 font-medium">
                  Online
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <ScrollArea
          ref={chatContainerRef}
          className="flex-1 p-2 sm:p-4 relative"
        >
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
            {messages.length === 0 ? (
              <motion.div
                className="flex flex-col items-center justify-center min-h-[30vh] sm:min-h-[35vh] text-center px-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div
                  className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 shadow-2xl relative overflow-hidden"
                  animate={{
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 20px 40px rgba(139, 92, 246, 0.3)",
                      "0 25px 50px rgba(139, 92, 246, 0.4)",
                      "0 20px 40px rgba(139, 92, 246, 0.3)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <Brain className="w-10 h-10 sm:w-14 sm:h-14 text-white relative z-10" />
                </motion.div>

                <motion.h3
                  className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent mb-3 sm:mb-4 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  How are you feeling today?
                </motion.h3>

                <motion.p
                  className="text-slate-600 text-sm sm:text-lg mb-6 sm:mb-8 max-w-2xl leading-relaxed px-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  I'm your personal mental health companion. Share your
                  thoughts, feelings, or what's on your mind. I'm here to listen
                  and support you through your journey with empathy and
                  understanding.
                </motion.p>

                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl w-full px-2"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  {quickSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setInputMessage(suggestion.text)}
                      className={`p-3 sm:p-4 bg-gradient-to-br ${suggestion.gradient} backdrop-blur-sm border border-violet-200/50 rounded-xl sm:rounded-2xl hover:shadow-lg active:scale-95 transition-all duration-300 text-left group relative overflow-hidden`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                      whileHover={{
                        scale: 1.02,
                        y: -2,
                        boxShadow: "0 10px 25px rgba(139, 92, 246, 0.15)",
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={false}
                      />
                      <div className="relative z-10">
                        <div className="flex items-center mb-2">
                          <motion.div
                            className="w-6 h-6 bg-white/80 rounded-lg flex items-center justify-center mr-2 text-violet-600"
                            whileHover={{ rotate: 5, scale: 1.1 }}
                          >
                            {suggestion.icon}
                          </motion.div>
                          <div className="font-medium text-slate-800 text-sm sm:text-base">
                            {suggestion.category}
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                          {suggestion.text}
                        </div>
                      </div>

                      <motion.div
                        className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={false}
                      />
                    </motion.button>
                  ))}
                </motion.div>

                <motion.div
                  className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-4 text-xs sm:text-sm text-slate-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.6 }}
                >
                  {[
                    {
                      icon: <Shield className="w-3 h-3" />,
                      text: "100% Private",
                    },
                    {
                      icon: <Heart className="w-3 h-3" />,
                      text: "No Judgment",
                    },
                    {
                      icon: <Zap className="w-3 h-3" />,
                      text: "Instant Support",
                    },
                  ].map((tip, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-1 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full"
                      whileHover={{ scale: 1.05, y: -1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      {tip.icon}
                      <span>{tip.text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} px-1`}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      ease: "easeOut",
                    }}
                    layout
                  >
                    <motion.div
                      className={`max-w-[85%] sm:max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl p-3 sm:p-4 rounded-2xl sm:rounded-3xl relative overflow-hidden ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                          : "bg-white/80 backdrop-blur-sm border border-violet-200/50 text-slate-800 shadow-lg"
                      }`}
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          message.sender === "user"
                            ? "0 10px 25px rgba(139, 92, 246, 0.3)"
                            : "0 10px 25px rgba(0, 0, 0, 0.1)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      {message.sender === "ai" && (
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${getMoodColor(message.mood)} opacity-5 rounded-2xl sm:rounded-3xl`}
                          animate={{
                            opacity: [0.05, 0.1, 0.05],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      )}

                      <div className="relative z-10">
                        {message.sender === "ai" && (
                          <motion.div
                            className="flex items-center mb-2 opacity-70"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 0.7, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                          >
                            <motion.div
                              className={`w-5 h-5 bg-gradient-to-br ${getMoodColor(message.mood)} rounded-lg flex items-center justify-center mr-2 text-white`}
                              animate={{ rotate: [0, 5, -5, 0] }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            >
                              {getMoodIcon(message.mood)}
                            </motion.div>
                            <span className="text-xs font-medium">
                              AI Companion
                            </span>
                            {message.mood && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs bg-white/20 text-slate-600 border-0"
                              >
                                {message.mood}
                              </Badge>
                            )}
                          </motion.div>
                        )}

                        <motion.p
                          className="text-sm sm:text-base leading-relaxed break-words"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.6 }}
                        >
                          {message.content}
                        </motion.p>

                        <motion.div
                          className="flex items-center justify-between mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4, duration: 0.4 }}
                        >
                          <span
                            className={`text-xs ${
                              message.sender === "user"
                                ? "text-white/70"
                                : "text-slate-500"
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </span>

                          {message.sender === "user" && (
                            <motion.div
                              className="w-2 h-2 bg-white/50 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            <AnimatePresence>
              {isTyping && (
                <motion.div
                  className="flex justify-start px-1"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="bg-white/80 backdrop-blur-sm border border-violet-200/50 p-4 rounded-2xl sm:rounded-3xl shadow-lg relative overflow-hidden"
                    animate={{
                      boxShadow: [
                        "0 4px 15px rgba(139, 92, 246, 0.1)",
                        "0 8px 25px rgba(139, 92, 246, 0.2)",
                        "0 4px 15px rgba(139, 92, 246, 0.1)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-violet-400/10 to-purple-400/10"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    <div className="flex items-center space-x-3 relative z-10">
                      <motion.div
                        className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center"
                        animate={{ rotate: [0, 360] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Sparkles className="w-3 h-3 text-white" />
                      </motion.div>

                      <div className="flex items-center space-x-1">
                        <span className="text-slate-600 text-sm font-medium">
                          AI is thinking
                        </span>
                        <div className="flex space-x-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 h-1.5 bg-violet-400 rounded-full"
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <motion.div
          className="p-2 sm:p-4 bg-white/80 backdrop-blur-xl border-t border-violet-200/50 safe-area-inset-bottom relative overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-violet-400/5 to-transparent"
            animate={{
              opacity: inputMessage.length > 0 ? [0.05, 0.1, 0.05] : 0.05,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="max-w-4xl mx-auto relative z-10">
            <motion.div
              className="flex items-center justify-center space-x-2 mb-3 overflow-x-auto pb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {[
                {
                  icon: Coffee,
                  text: "Daily Check-in",
                  action: () => setInputMessage("How has your day been going?"),
                },
                {
                  icon: Heart,
                  text: "Feeling Support",
                  action: () =>
                    setInputMessage(
                      "I need some emotional support right now...",
                    ),
                },
                {
                  icon: Star,
                  text: "Gratitude",
                  action: () =>
                    setInputMessage(
                      "I want to share something I'm grateful for...",
                    ),
                },
                {
                  icon: Music,
                  text: "Mood Boost",
                  action: () =>
                    setInputMessage("Can you help lift my spirits?"),
                },
              ].map((action, index) => (
                <motion.button
                  key={index}
                  onClick={action.action}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full text-xs text-slate-600 hover:text-violet-600 hover:bg-violet-100/60 transition-all duration-300 whitespace-nowrap"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                >
                  <action.icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{action.text}</span>
                </motion.button>
              ))}
            </motion.div>

            <div className="flex items-end space-x-2 sm:space-x-4">
              <div className="flex-1 relative">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-purple-400/20 rounded-xl sm:rounded-2xl opacity-0"
                  animate={{
                    opacity: inputMessage.length > 0 ? [0, 0.1, 0] : 0,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <Textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your thoughts and feelings... I'm here to listen with empathy and understanding."
                  className="min-h-[60px] sm:min-h-[60px] max-h-32 border-violet-200/50 focus:ring-violet-500/50 rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-sm resize-none text-sm sm:text-base relative z-10 transition-all duration-300 focus:bg-white/90 focus:border-violet-300/60"
                  disabled={isLoading}
                />

                <AnimatePresence>
                  {inputMessage.length > 0 && (
                    <motion.div
                      className="absolute bottom-2 right-2 text-xs text-slate-400 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {inputMessage.length}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-xl hover:shadow-2xl min-w-[48px] min-h-[48px] flex items-center justify-center relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-violet-700 to-purple-700"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.3 }}
                  />

                  <motion.div
                    className="relative z-10"
                    animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                    transition={{
                      duration: 1,
                      repeat: isLoading ? Infinity : 0,
                      ease: "linear",
                    }}
                  >
                    {isLoading ? (
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Send className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                    )}
                  </motion.div>
                </Button>
              </motion.div>
            </div>

            <motion.div
              className="flex items-center justify-center mt-2 text-xs text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <kbd className="px-2 py-1 bg-white/60 rounded mr-2">Enter</kbd> to
              send,
              <kbd className="px-2 py-1 bg-white/60 rounded mx-2">
                Shift + Enter
              </kbd>{" "}
              for new line
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
