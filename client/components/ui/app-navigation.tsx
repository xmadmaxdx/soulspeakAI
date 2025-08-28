import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Brain,
  MessageCircle,
  BarChart3,
  BookOpen,
  Settings,
  LogOut,
  ChevronLeft,
  Activity,
  User,
  Home,
  Menu,
  X,
  Sparkles,
  Crown,
  Zap,
  Shield,
  Star,
} from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";

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

interface AppNavigationProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  showBackButton?: boolean;
  backTo?: string;
  currentPage?: string;
}

export default function AppNavigation({
  title,
  subtitle,
  icon,
  showBackButton = false,
  backTo = "/",
  currentPage,
}: AppNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      console.log("🔄 Initiating logout from AppNavigation...");
      setIsMenuOpen(false);

      const { error } = await signOut();

      if (error) {
        console.error("❌ Logout failed:", error.message);
      } else {
        console.log("✅ Logout successful from AppNavigation");
      }

      navigate("/");
    } catch (error) {
      console.error("❌ Logout error:", error);
      navigate("/");
    }
  };

  const isCurrentPage = (page: string) => {
    if (page === "home") return location.pathname === "/";
    return location.pathname.includes(page) || currentPage === page;
  };

  const navigationItems = [
    {
      id: "home",
      icon: Home,
      label: "Home",
      path: "/",
      color: "violet",
      description: "Dashboard",
    },
    {
      id: "companion",
      icon: MessageCircle,
      label: "AI Chat",
      path: "/companion",
      color: "purple",
      description: "Mental Health Support",
    },
    {
      id: "journal",
      icon: BookOpen,
      label: "Journal",
      path: "/journal",
      color: "indigo",
      description: "Writing Sanctuary",
    },
    {
      id: "mood",
      icon: Activity,
      label: "Mood",
      path: "/mood-tracker",
      color: "blue",
      description: "Track Emotions",
    },
    {
      id: "api-test",
      icon: BarChart3,
      label: "API",
      path: "/api-test",
      color: "cyan",
      description: "System Monitor",
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-xl bg-white/80 shadow-2xl border-b border-violet-200/50"
            : "backdrop-blur-lg bg-white/70 shadow-xl border-b border-violet-200/30"
        }`}
      >
        <div className="relative z-10 flex items-center justify-between px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            {showBackButton && (
              <motion.div
                {...(!isMobile && {
                  whileHover: { scale: 1.1 },
                  whileTap: { scale: 0.9 },
                  transition: { type: "spring", stiffness: 400, damping: 17 },
                })}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(backTo)}
                  className="p-2 hover:bg-violet-100 rounded-xl flex-shrink-0 transition-all duration-300"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </motion.div>
            )}

            <motion.div
              className="flex items-center space-x-3 sm:space-x-4 min-w-0"
              {...(!isMobile && {
                whileHover: { scale: 1.02 },
                transition: { type: "spring", stiffness: 400, damping: 17 },
              })}
            >
              <motion.div
                className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0 relative overflow-hidden"
                {...(!isMobile && {
                  whileHover: {
                    scale: 1.1,
                    rotate: 5,
                    boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)",
                  },
                  transition: { type: "spring", stiffness: 400, damping: 17 },
                })}
              >
                {!isMobile && (
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
                )}
                <div className="relative z-10">
                  {icon || (
                    <Brain className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  )}
                </div>
              </motion.div>

              <div className="min-w-0">
                <motion.h1
                  className="text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent truncate block"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  {title}
                </motion.h1>
                {subtitle && (
                  <motion.div
                    className="text-xs sm:text-sm text-slate-500 font-medium hidden sm:block truncate"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    {subtitle}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {user && (
            <motion.div
              className="hidden lg:flex items-center space-x-2 xl:space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-violet-200/50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {navigationItems.map((item, index) => (
                <div key={item.id}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-3 xl:px-4 py-2 rounded-xl transition-all duration-300 relative overflow-hidden group ${
                      isCurrentPage(item.id)
                        ? `bg-gradient-to-r from-${item.color}-200 to-${item.color}-300 text-black shadow-lg`
                        : `hover:bg-${item.color}-50 text-slate-700`
                    }`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <div className="relative z-10 flex items-center space-x-2">
                      <item.icon className="w-4 h-4" />
                      <span className="hidden xl:inline text-sm font-medium">
                        {item.label}
                      </span>
                    </div>
                  </Button>
                </div>
              ))}
            </motion.div>
          )}

          {user && (
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <motion.div
                className="hidden lg:flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg border border-violet-200/50"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                {...(!isMobile && { whileHover: { scale: 1.02 } })}
              >
                <motion.div
                  className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                  {...(!isMobile && {
                    whileHover: { scale: 1.1, rotate: 5 },
                    transition: { type: "spring", stiffness: 400, damping: 17 },
                  })}
                >
                  {(
                    user?.user_metadata?.username ||
                    user?.email?.split("@")[0] ||
                    "U"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </motion.div>
                <div className="hidden xl:block">
                  <div className="text-sm font-semibold text-slate-800 truncate max-w-24">
                    {user?.user_metadata?.username ||
                      user?.email?.split("@")[0] ||
                      "User"}
                  </div>
                  <div className="text-xs text-slate-500">Member</div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-700 border-0 font-semibold"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </motion.div>

              <motion.div
                className="hidden lg:block"
                {...(!isMobile && {
                  whileHover: { scale: 1.05 },
                  whileTap: { scale: 0.95 },
                })}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-3 hover:bg-purple-100 rounded-xl transition-all duration-300 relative group"
                  onClick={() => navigate("/profile")}
                >
                  <Settings className="w-4 h-4 text-slate-700 group-hover:rotate-45 transition-transform duration-300" />
                </Button>
              </motion.div>

              <motion.div
                className="hidden lg:block"
                {...(!isMobile && {
                  whileHover: { scale: 1.05 },
                  whileTap: { scale: 0.95 },
                })}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-3 hover:bg-rose-100 rounded-xl transition-all duration-300"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 text-slate-700" />
                </Button>
              </motion.div>

              <motion.div
                className="lg:hidden"
                {...(!isMobile && {
                  whileHover: { scale: 1.05 },
                  whileTap: { scale: 0.95 },
                })}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2.5 hover:bg-violet-100 rounded-xl transition-all duration-300 relative"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isMenuOpen ? "close" : "menu"}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isMenuOpen ? (
                        <X className="w-5 h-5" />
                      ) : (
                        <Menu className="w-5 h-5" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && user && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl shadow-2xl z-40 lg:hidden overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-6 space-y-6">
                <motion.div
                  className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-200/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <div className="flex items-center space-x-4">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg"
                      {...(!isMobile && {
                        whileHover: { scale: 1.1, rotate: 5 },
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 17,
                        },
                      })}
                    >
                      {(
                        user?.user_metadata?.username ||
                        user?.email?.split("@")[0] ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-bold text-slate-800 truncate">
                        {user?.user_metadata?.username ||
                          user?.email?.split("@")[0] ||
                          "User"}
                      </div>
                      <div className="text-sm text-slate-600 truncate">
                        {user?.email}
                      </div>
                      <Badge
                        variant="secondary"
                        className="mt-2 bg-emerald-100 text-emerald-700 border-0 font-semibold"
                      >
                        <Crown className="w-3 h-3 mr-1" />
                        Premium Member
                      </Badge>
                    </div>
                  </div>
                </motion.div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-2">
                    Navigation
                  </h3>
                  {navigationItems.map((item, index) => (
                    <div key={item.id}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                          isCurrentPage(item.id)
                            ? `bg-gradient-to-r from-${item.color}-200 to-${item.color}-300 text-black shadow-lg`
                            : `hover:bg-${item.color}-50 text-slate-700`
                        }`}
                        onClick={() => handleNavigation(item.path)}
                      >
                        <div className="flex items-center space-x-4 relative z-10">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isCurrentPage(item.id)
                                ? "bg-white/20"
                                : `bg-${item.color}-100`
                            }`}
                          >
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold">{item.label}</div>
                            <div
                              className={`text-sm ${
                                isCurrentPage(item.id)
                                  ? "text-black/80"
                                  : "text-slate-500"
                              }`}
                            >
                              {item.description}
                            </div>
                          </div>
                          {isCurrentPage(item.id) && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.2, duration: 0.3 }}
                            >
                              <Star className="w-4 h-4 text-black fill-current" />
                            </motion.div>
                          )}
                        </div>
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t border-violet-200/50">
                  <motion.h3
                    className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    Account
                  </motion.h3>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    {...(!isMobile && {
                      whileHover: { x: 5 },
                      whileTap: { scale: 0.98 },
                    })}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-4 rounded-2xl hover:bg-purple-50 text-slate-700 transition-all duration-300"
                      onClick={() => handleNavigation("/profile")}
                    >
                      <div className="flex items-center space-x-4">
                        <motion.div
                          className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"
                          {...(!isMobile && {
                            whileHover: { scale: 1.1, rotate: 5 },
                            transition: {
                              type: "spring",
                              stiffness: 400,
                              damping: 17,
                            },
                          })}
                        >
                          <Settings className="w-5 h-5" />
                        </motion.div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold">Settings</div>
                          <div className="text-sm text-slate-500">
                            Account preferences
                          </div>
                        </div>
                      </div>
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    {...(!isMobile && {
                      whileHover: { x: 5 },
                      whileTap: { scale: 0.98 },
                    })}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-4 rounded-2xl hover:bg-rose-50 text-slate-700 transition-all duration-300"
                      onClick={handleLogout}
                    >
                      <div className="flex items-center space-x-4">
                        <motion.div
                          className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center"
                          {...(!isMobile && {
                            whileHover: { scale: 1.1, rotate: 5 },
                            transition: {
                              type: "spring",
                              stiffness: 400,
                              damping: 17,
                            },
                          })}
                        >
                          <LogOut className="w-5 h-5" />
                        </motion.div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold">Sign Out</div>
                          <div className="text-sm text-slate-500">
                            End your session
                          </div>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                </div>

                <motion.div
                  className="pt-6 border-t border-violet-200/50 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  <div className="text-sm text-slate-500 mb-2">
                    SoulSpeak v2.0
                  </div>
                  <div className="flex justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.0 + i * 0.1, duration: 0.3 }}
                      >
                        <Star className="w-3 h-3 text-violet-400 fill-current" />
                      </motion.div>
                    ))}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Your healing companion
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
