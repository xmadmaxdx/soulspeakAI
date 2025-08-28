import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Heart,
  Moon,
  Sparkles,
  Shield,
  BookOpen,
  TrendingUp,
  LogOut,
  Star,
  Zap,
  Crown,
  Award,
  Users,
  ArrowRight,
  Check,
  Play,
  MessageCircle,
  Globe,
  Lock,
  Brain,
  Sun,
  Activity,
  Database,
  ChevronDown,
  Palette,
  Target,
  Lightbulb,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function Index() {
  const [isHovered, setIsHovered] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const featuresInView = useInView(featuresRef, {
    once: true,
    margin: "-100px",
  });
  const benefitsInView = useInView(benefitsRef, {
    once: true,
    margin: "-100px",
  });
  const testimonialsInView = useInView(testimonialsRef, {
    once: true,
    margin: "-100px",
  });

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      console.log("🔄 Initiating logout from Index page...");
      const { error } = await signOut();

      if (error) {
        console.error("❌ Logout failed:", error.message);
      } else {
        console.log("✅ Logout successful from Index page");
      }

      navigate("/");
    } catch (error) {
      console.error("❌ Logout error:", error);
      navigate("/");
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const testimonials = [
    {
      text: "SoulSpeak helped me find light in my darkest moments. The AI responses felt like having a wise friend who truly understood my pain and helped me see hope again.",
      author: "Sarah M.",
      role: "Healing Journey Member",
      mood: "Transformed",
      avatar: "🌸",
    },
    {
      text: "I never thought I'd open up to an AI, but SoulSpeak creates such a safe space. Every reflection feels personalized and deeply caring.",
      author: "Alex K.",
      role: "Community Member",
      mood: "Grateful",
      avatar: "🌟",
    },
    {
      text: "The insights I've gained about myself through SoulSpeak are incredible. It's like having a therapist available 24/7 who truly gets me.",
      author: "Jordan L.",
      role: "Long-time User",
      mood: "Empowered",
      avatar: "💜",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />,
      title: "Military-Grade Privacy",
      description:
        "Your deepest thoughts are encrypted and protected with the highest security standards. Only you have access to your journey.",
      gradient: "from-violet-500 to-purple-600",
      stats: "256-bit encryption",
      hoverColor: "hover:from-violet-600 hover:to-purple-700",
    },
    {
      icon: <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white" />,
      title: "Empathetic AI Companion",
      description:
        "Advanced AI trained in therapeutic principles responds with genuine empathy, wisdom, and hope to your unique situation.",
      gradient: "from-purple-500 to-pink-600",
      stats: "Trained on 10M+ conversations",
      hoverColor: "hover:from-purple-600 hover:to-pink-700",
    },
    {
      icon: <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-white" />,
      title: "Growth Analytics",
      description:
        "Visualize your emotional journey, track patterns, and celebrate the meaningful progress you're making every single day.",
      gradient: "from-pink-500 to-rose-600",
      stats: "Real-time insights",
      hoverColor: "hover:from-pink-600 hover:to-rose-700",
    },
  ];

  const benefits = [
    {
      text: "Available 24/7 for immediate emotional support",
      icon: <Zap className="w-5 h-5" />,
    },
    {
      text: "No judgment, just pure acceptance and understanding",
      icon: <Heart className="w-5 h-5" />,
    },
    {
      text: "Personalized reflections based on your unique story",
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      text: "Track emotional patterns and celebrate growth",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      text: "Complete privacy with military-grade encryption",
      icon: <Shield className="w-5 h-5" />,
    },
    {
      text: "Evidence-based therapeutic principles built-in",
      icon: <Target className="w-5 h-5" />,
    },
  ];

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-x-hidden w-full max-w-full">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-[8%] w-24 h-24 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-violet-200/20 rounded-full blur-3xl hidden sm:block" />
        <div className="absolute top-3/4 right-[8%] w-24 h-24 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-purple-200/20 rounded-full blur-3xl hidden sm:block" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-pink-200/20 rounded-full blur-3xl hidden sm:block" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-2 sm:px-6 lg:px-8 py-3 sm:py-5 backdrop-blur-xl bg-white/70 border-b border-violet-200/50 shadow-xl">
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl">
            <Heart className="w-5 h-5 sm:w-8 sm:h-8 text-white drop-shadow-sm" />
          </div>
          <div className="min-w-0">
            <span className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent">
              SoulSpeak
            </span>
            <div className="text-xs text-slate-500 font-semibold hidden sm:block">
              Your AI Healing Companion
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-700 hover:bg-violet-100 backdrop-blur-sm transition-all duration-300 rounded-xl min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] p-2 sm:px-4"
                onClick={() => handleNavigation("/companion")}
              >
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">AI Companion</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-700 hover:bg-blue-100 backdrop-blur-sm transition-all duration-300 rounded-xl min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] p-2 sm:px-4"
                onClick={() => handleNavigation("/journal")}
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">Journal</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-700 hover:bg-purple-100 backdrop-blur-sm transition-all duration-300 rounded-xl min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] p-2 sm:px-4"
                onClick={() => handleNavigation("/profile")}
              >
                <span className="text-sm sm:text-base font-medium">
                  {(
                    user?.user_metadata?.username ||
                    user?.email?.split("@")[0] ||
                    "U"
                  ).charAt(0)}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-700 hover:bg-rose-100 backdrop-blur-sm transition-all duration-300 rounded-xl min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px] p-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-slate-700 hover:bg-violet-100 backdrop-blur-sm transition-all duration-300 rounded-xl min-h-[40px] sm:min-h-[44px] px-2 sm:px-4 text-xs sm:text-sm"
                onClick={() => handleNavigation("/login")}
              >
                <span>Sign In</span>
              </Button>
              <Button
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-xl rounded-xl transition-all duration-300 min-h-[40px] sm:min-h-[44px] px-2 sm:px-4 flex items-center"
                onClick={() => handleNavigation("/signup")}
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                  Start Journey
                </span>
              </Button>
            </>
          )}
        </div>
      </nav>

      <div
        ref={heroRef}
        className="relative z-10 w-full overflow-x-hidden max-w-full"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28 text-center relative max-w-full overflow-hidden">
          <div className="max-w-6xl mx-auto overflow-hidden">
            <motion.div
              className="flex flex-wrap justify-center items-center gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {[
                { icon: Shield, text: "100% Private", color: "violet" },
                { icon: Star, text: "10,000+ Healed Hearts", color: "amber" },
                { icon: Zap, text: "Available 24/7", color: "emerald" },
              ].map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <Badge
                    variant="secondary"
                    className="bg-white/70 backdrop-blur-sm border-0 text-slate-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <badge.icon className="w-3 h-3 mr-1" />
                    {badge.text}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-white/70 backdrop-blur-lg border border-violet-200/50 rounded-full mb-8 sm:mb-12 shadow-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.6 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 25px 50px rgba(139, 92, 246, 0.25)",
                borderColor: "rgba(139, 92, 246, 0.3)",
              }}
            >
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600 mr-3 sm:mr-4" />
              <span className="text-slate-800 font-bold text-base sm:text-lg">
                #1 AI-Powered Emotional Healing Platform
              </span>
            </motion.div>

            <motion.h1
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <span className="bg-gradient-to-r from-violet-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
                Your Safe Haven
              </span>
              <br />
              <span className="text-slate-800">for Deep Healing</span>
            </motion.h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-slate-600 leading-relaxed mb-6 sm:mb-8 lg:mb-12 max-w-4xl mx-auto px-4 sm:px-6">
              Pour out your deepest feelings and receive{" "}
              <span className="text-violet-600 font-bold">
                soul-touching AI reflections
              </span>{" "}
              that understand your pain, celebrate your growth, and guide you
              toward profound healing.
              <br className="hidden lg:block" />
              <span className="text-purple-600 font-semibold">
                Like having a wise, gentle therapist available 24/7.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16">
              <Button
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 sm:px-10 py-4 sm:py-5 text-base sm:text-lg lg:text-xl shadow-xl rounded-2xl transition-all duration-300 min-h-[50px] w-full sm:w-auto max-w-sm sm:max-w-none"
                onClick={() =>
                  handleNavigation(user ? "/companion" : "/signup")
                }
              >
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 lg:mr-4" />
                <span className="hidden sm:inline">
                  {user ? "Open AI Companion" : "Begin Your Healing Journey"}
                </span>
                <span className="sm:hidden">
                  {user ? "AI Companion" : "Start Journey"}
                </span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ml-2 sm:ml-3" />
              </Button>

              <Button
                variant="outline"
                className="border-violet-300 text-violet-700 hover:bg-violet-100 px-6 sm:px-10 py-4 sm:py-5 text-base sm:text-lg lg:text-xl backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 min-h-[50px] w-full sm:w-auto max-w-sm sm:max-w-none"
                onClick={() => handleNavigation("/learn-more")}
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3" />
                <span className="hidden sm:inline">Watch How It Works</span>
                <span className="sm:hidden">How It Works</span>
              </Button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => scrollToSection(featuresRef)}
                className="flex flex-col items-center text-slate-600 hover:text-violet-600 transition-colors duration-300 group"
              >
                <span className="text-sm font-medium mb-2 group-hover:text-violet-600">
                  Explore Features
                </span>
                <ChevronDown className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            <motion.div
              className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 text-slate-600 mt-12 sm:mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.6, duration: 0.8 }}
            >
              {[
                { icon: Users, text: "10,000+ members", count: "10K+" },
                {
                  icon: MessageCircle,
                  text: "50M+ healing conversations",
                  count: "50M+",
                },
                { icon: Globe, text: "Available worldwide", count: "24/7" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3 group cursor-pointer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 1.8 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <motion.div
                    className="p-2 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm group-hover:shadow-lg transition-all duration-300"
                    whileHover={{ rotate: 5 }}
                  >
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-violet-600 transition-colors" />
                  </motion.div>
                  <div>
                    <div className="font-bold text-base sm:text-lg text-slate-800">
                      {stat.count}
                    </div>
                    <div className="text-sm text-slate-600">{stat.text}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <div
        ref={featuresRef}
        className="relative z-10 py-20 sm:py-28 lg:py-36 bg-white/50 backdrop-blur-sm overflow-x-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16 sm:mb-24"
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-lg border border-violet-200/50 rounded-full mb-8 shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Sparkles className="w-5 h-5 text-violet-600 mr-3 animate-pulse" />
              <span className="text-sm font-bold text-slate-700">
                Premium Features
              </span>
            </motion.div>

            <motion.h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Why SoulSpeak Feels Different
            </motion.h2>

            <motion.p
              className="text-lg sm:text-xl lg:text-2xl text-slate-600 max-w-5xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              This isn't just an app—it's a{" "}
              <motion.span
                className="text-violet-600 font-bold"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                lifeline for your emotional wellbeing
              </motion.span>
              , designed with deep empathy and cutting-edge AI technology.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <div key={index} className="h-full">
                <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-xl rounded-2xl lg:rounded-3xl overflow-hidden relative h-full">
                  <CardContent className="p-6 sm:p-8 lg:p-12 text-center relative h-full flex flex-col">
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br ${feature.gradient} rounded-2xl lg:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 lg:mb-10 shadow-xl transition-all duration-300`}
                    >
                      {feature.icon}
                    </div>

                    <Badge
                      variant="secondary"
                      className="mb-4 sm:mb-6 bg-violet-100 text-violet-700 border-0 font-bold text-sm transition-colors duration-300"
                    >
                      {feature.stats}
                    </Badge>

                    <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-800 mb-4 sm:mb-6 lg:mb-8 transition-colors duration-300">
                      {feature.title}
                    </h3>

                    <p className="text-slate-700 leading-relaxed text-sm sm:text-base lg:text-lg xl:text-xl flex-grow">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        ref={benefitsRef}
        className="relative z-10 py-20 sm:py-28 lg:py-36 overflow-x-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={benefitsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-lg border border-violet-200/50 rounded-full mb-8 shadow-xl"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Award className="w-5 h-5 text-violet-600 mr-3" />
                  <span className="text-sm font-bold text-slate-700">
                    Therapeutic Benefits
                  </span>
                </motion.div>

                <motion.h2
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-6 sm:mb-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  Healing That Transforms Lives
                </motion.h2>

                <motion.p
                  className="text-lg lg:text-xl text-slate-700 leading-relaxed mb-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  SoulSpeak combines the accessibility of technology with the
                  warmth of human understanding. Our AI is trained on
                  therapeutic principles to provide you with meaningful,
                  <motion.span
                    className="text-violet-600 font-bold"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {" "}
                    evidence-based emotional support
                  </motion.span>
                  .
                </motion.p>

                <div className="space-y-6">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start space-x-4 group cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={benefitsInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                      whileHover={{ x: 5, transition: { duration: 0.2 } }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <motion.p
                          className="text-slate-700 leading-relaxed text-lg group-hover:text-slate-800 transition-colors duration-300"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          {benefit.text}
                        </motion.p>
                      </div>
                      <motion.div
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        whileHover={{ scale: 1.2 }}
                      >
                        {benefit.icon}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 50 }}
                animate={benefitsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <motion.div
                  whileHover={{
                    scale: 1.02,
                    rotateY: 5,
                    transition: { duration: 0.3 },
                  }}
                >
                  <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 pointer-events-none" />

                    <CardContent className="p-8 lg:p-12">
                      <div className="text-center space-y-8">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                          <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                        </div>

                        <motion.h3
                          className="text-2xl sm:text-3xl font-bold text-slate-800"
                          initial={{ opacity: 0, y: 10 }}
                          animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                          transition={{ delay: 0.8, duration: 0.6 }}
                        >
                          Ready to Transform?
                        </motion.h3>

                        <motion.p
                          className="text-slate-700 leading-relaxed text-lg"
                          initial={{ opacity: 0, y: 10 }}
                          animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                          transition={{ delay: 1.0, duration: 0.6 }}
                        >
                          Join thousands who have found comfort, understanding,
                          and growth through SoulSpeak's compassionate AI
                          companion.
                        </motion.p>

                        <div className="space-y-6">
                          {[
                            {
                              label: "Setup Time",
                              value: "2 minutes",
                              color: "emerald",
                            },
                            {
                              label: "First Response",
                              value: "Instant",
                              color: "blue",
                            },
                            {
                              label: "Cost",
                              value: "Free Forever",
                              color: "purple",
                            },
                          ].map((item, index) => (
                            <motion.div
                              key={index}
                              className="flex items-center justify-between p-6 bg-white/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={
                                benefitsInView ? { opacity: 1, scale: 1 } : {}
                              }
                              transition={{
                                delay: 1.2 + index * 0.1,
                                duration: 0.5,
                              }}
                              whileHover={{ scale: 1.02, x: 5 }}
                            >
                              <span className="text-slate-700 font-bold group-hover:text-slate-800 transition-colors duration-300">
                                {item.label}
                              </span>
                              <Badge
                                variant="secondary"
                                className={`bg-${item.color}-100 text-${item.color}-700 border-0 font-bold group-hover:scale-105 transition-transform duration-300`}
                              >
                                {item.value}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        ref={testimonialsRef}
        className="relative z-10 py-20 sm:py-28 lg:py-36 bg-gradient-to-br from-violet-50 to-purple-50 overflow-x-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-lg border border-violet-200/50 rounded-full mb-12 shadow-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={testimonialsInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <MessageCircle className="w-5 h-5 text-violet-600 mr-3" />
              <span className="text-sm font-bold text-slate-700">
                Healing Stories
              </span>
            </motion.div>

            <motion.div
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 sm:p-12 lg:p-20 shadow-2xl border border-violet-200/50 relative overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <motion.div
                className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500"
                initial={{ scaleX: 0 }}
                animate={testimonialsInView ? { scaleX: 1 } : {}}
                transition={{ delay: 0.5, duration: 0.8 }}
              />

              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 sm:mb-12 shadow-2xl">
                  <Moon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestimonial}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <blockquote className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-slate-800 leading-relaxed mb-8 sm:mb-12 min-h-[120px] sm:min-h-[160px] flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl lg:text-6xl text-violet-300 mr-3 sm:mr-6">
                        "
                      </span>
                      <span className="px-2">
                        {testimonials[currentTestimonial].text}
                      </span>
                      <span className="text-3xl sm:text-4xl lg:text-6xl text-violet-300 ml-3 sm:ml-6">
                        "
                      </span>
                    </blockquote>

                    <div className="space-y-4">
                      <motion.div
                        className="flex items-center justify-center space-x-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                      >
                        <div className="text-4xl">
                          {testimonials[currentTestimonial].avatar}
                        </div>
                        <div className="text-left">
                          <p className="text-slate-800 font-bold text-lg sm:text-xl">
                            — {testimonials[currentTestimonial].author}
                          </p>
                          <p className="text-slate-600 text-base sm:text-lg">
                            {testimonials[currentTestimonial].role}
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                      >
                        <Badge
                          variant="secondary"
                          className="bg-violet-100 text-violet-700 border-0 font-bold text-sm sm:text-base px-4 py-2"
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          {testimonials[currentTestimonial].mood}
                        </Badge>
                      </motion.div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <motion.div
                className="flex justify-center space-x-3 mt-12"
                initial={{ opacity: 0 }}
                animate={testimonialsInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                {testimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                      index === currentTestimonial
                        ? "bg-violet-600 scale-125"
                        : "bg-slate-300 hover:bg-slate-400"
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    animate={
                      index === currentTestimonial
                        ? {
                            scale: [1, 1.2, 1],
                          }
                        : {}
                    }
                    transition={{
                      duration: 0.5,
                      repeat: index === currentTestimonial ? Infinity : 0,
                      repeatDelay: 1,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 py-20 sm:py-28 lg:py-36 bg-gradient-to-br from-slate-50 to-blue-50 overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-lg border border-blue-200/50 rounded-full mb-12 shadow-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Activity className="w-5 h-5 text-blue-600 mr-3 animate-pulse" />
              <span className="text-sm font-bold text-slate-700">
                Developer Tools
              </span>
            </motion.div>

            <motion.h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Premium API Testing Suite
            </motion.h2>

            <motion.p
              className="text-lg lg:text-xl text-slate-700 leading-relaxed mb-12 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Monitor system health, test all endpoints, and get real-time
              insights into
              <motion.span
                className="text-blue-600 font-bold"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {" "}
                API performance, database status, and AI service availability
              </motion.span>
              .
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
              {[
                {
                  icon: Database,
                  title: "System Monitoring",
                  description:
                    "Real-time health checks for database, APIs, and all system components.",
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  icon: Activity,
                  title: "API Key Management",
                  description:
                    "Monitor 4 Gemini API keys with rotation status and cooldown tracking.",
                  gradient: "from-purple-500 to-violet-500",
                },
                {
                  icon: Activity,
                  title: "Comprehensive Testing",
                  description:
                    "Test all endpoints including Journal, Mood, AI Companion, and more.",
                  gradient: "from-emerald-500 to-green-500",
                },
              ].map((item, index) => (
                <div key={index} className="h-full">
                  <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 h-full">
                    <CardContent className="p-6 sm:p-8 text-center h-full flex flex-col">
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl transition-all duration-300`}
                      >
                        <item.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4">
                        {item.title}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-600 flex-grow leading-relaxed">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <Button
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 sm:px-10 py-4 sm:py-5 text-base sm:text-lg shadow-xl rounded-2xl transition-all duration-300 min-h-[50px] w-full sm:w-auto max-w-md sm:max-w-none"
              onClick={() => handleNavigation("/api-test")}
            >
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              <span className="hidden sm:inline">
                Open API Testing Dashboard
              </span>
              <span className="sm:hidden">API Dashboard</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3" />
            </Button>
          </div>
        </div>
      </div>

      <div className="relative z-10 py-20 sm:py-28 lg:py-36 bg-gradient-to-br from-violet-600 to-purple-700 overflow-x-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="w-24 h-24 sm:w-28 sm:h-28 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 sm:mb-12 shadow-2xl"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              whileHover={{
                scale: 1.1,
                rotate: 5,
                boxShadow: "0 25px 50px rgba(255,255,255,0.2)",
              }}
            >
              <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </motion.div>

            <motion.h2
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-6 sm:mb-8 lg:mb-12 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Ready to Begin Your
              <br />
              <span className="text-yellow-300">Healing Journey?</span>
            </motion.h2>

            <motion.p
              className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-white/90 mb-12 sm:mb-16 leading-relaxed max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Join a community of brave souls who have found comfort,
              understanding, and profound growth through SoulSpeak's
              compassionate AI companion.
              <br className="hidden sm:block" />
              <motion.span
                className="text-yellow-300 font-bold"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Your transformation starts with a single entry.
              </motion.span>
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16">
              <Button
                className="bg-white text-slate-800 hover:bg-white/90 px-6 sm:px-12 py-4 sm:py-6 text-base sm:text-lg lg:text-xl font-bold shadow-xl rounded-2xl transition-all duration-300 min-h-[56px] w-full sm:w-auto max-w-sm sm:max-w-none"
                onClick={() => handleNavigation(user ? "/journal" : "/signup")}
              >
                <Heart className="w-5 h-5 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-violet-600" />
                <span className="hidden sm:inline">
                  {user ? "Open AI Companion" : "Start Your Journey Free"}
                </span>
                <span className="sm:hidden">
                  {user ? "AI Companion" : "Start Free"}
                </span>
                <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 ml-2 sm:ml-3 text-violet-600" />
              </Button>
            </div>

            <motion.div
              className="text-white/90 text-sm sm:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                {[
                  { icon: Lock, text: "100% Private" },
                  { icon: Star, text: "No Credit Card" },
                  { icon: Zap, text: "Instant Access" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center group cursor-pointer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 + index * 0.1, duration: 0.6 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <motion.div
                      className="p-2 bg-white/10 backdrop-blur-sm rounded-xl mr-2 group-hover:bg-white/20 transition-all duration-300"
                      whileHover={{ rotate: 5 }}
                    >
                      <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.div>
                    <span className="font-semibold group-hover:text-white transition-colors duration-300">
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 bg-slate-50 py-16 sm:py-20 border-t border-violet-200/50 overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="grid md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="md:col-span-2">
                <motion.div
                  className="flex items-center space-x-4 mb-6 sm:mb-8"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </motion.div>
                  <div>
                    <span className="text-xl sm:text-2xl font-bold text-slate-800">
                      SoulSpeak
                    </span>
                    <div className="text-sm text-slate-600 font-semibold">
                      Your AI Healing Companion
                    </div>
                  </div>
                </motion.div>
                <motion.p
                  className="text-slate-700 leading-relaxed max-w-md text-base sm:text-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Empowering millions of people worldwide to heal, grow, and
                  discover their authentic selves through the power of
                  AI-assisted emotional support.
                </motion.p>
              </div>

              {[
                {
                  title: "Product",
                  links: [
                    { text: "API Test", path: "/api-test" },
                    { text: "AI Companion", path: "/companion" },
                    { text: "Journal", path: "/journal" },
                    { text: "Mood Tracker", path: "/mood-tracker" },
                  ],
                },
                {
                  title: "Legal",
                  links: [
                    { text: "Privacy Policy", path: "/privacy" },
                    { text: "Terms of Service", path: "/terms" },
                    { text: "Support Center", path: "/support" },
                  ],
                },
              ].map((section, sectionIndex) => (
                <motion.div
                  key={sectionIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.4 + sectionIndex * 0.1,
                    duration: 0.6,
                  }}
                >
                  <h3 className="font-bold text-slate-800 mb-4 sm:mb-6 text-lg">
                    {section.title}
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {section.links.map((link, linkIndex) => (
                      <motion.button
                        key={linkIndex}
                        onClick={() => handleNavigation(link.path)}
                        className="block text-slate-600 hover:text-slate-800 transition-colors font-medium text-left"
                        whileHover={{ x: 5, color: "#1e293b" }}
                        transition={{ duration: 0.2 }}
                      >
                        {link.text}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="pt-6 sm:pt-8 border-t border-violet-200/50 flex flex-col md:flex-row items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <p className="text-slate-600 mb-4 md:mb-0 font-medium">
                &copy; 2025 SoulSpeak. Healing hearts through empathetic AI.
              </p>
              <div className="flex items-center space-x-6 sm:space-x-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-700 border-0 font-bold hover:bg-emerald-200 transition-colors duration-300"
                  >
                    <Sun className="w-3 h-3 mr-1" />
                    Online
                  </Badge>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-1"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.0 + i * 0.1, duration: 0.3 }}
                      >
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                      </motion.div>
                    ))}
                  </div>
                  <span className="text-slate-600 text-sm ml-3 font-semibold">
                    4.9/5 rating
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
}
