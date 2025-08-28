import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import {
  Heart,
  User,
  Mail,
  Calendar,
  Edit,
  Save,
  X,
  TrendingUp,
  BookOpen,
  Crown,
  Star,
  Sparkles,
  Award,
  Target,
  Zap,
  Moon,
  Sun,
  Smile,
  Meh,
  Frown,
  Settings,
} from "lucide-react";
import AppNavigation from "../components/ui/app-navigation";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { apiClient } from "../lib/api";
import { UserProfile, UpdateProfileRequest } from "@shared/api";

interface UserProfile {
  name: string;
  email: string;
  joinDate: string;
  totalEntries: number;
  averageMood: number;
  bio: string;
}

interface UserStats {
  weeklyEntries: number;
  moodTrend: "starting" | "improving" | "stable" | "needs attention";
  longestStreak: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  const [profile, setProfile] = useState<UserProfile>({
    name:
      user?.user_metadata?.username ||
      user?.email?.split("@")[0] ||
      "SoulSpeak User",
    email: user?.email || "demo@soulspeak.com",
    joinDate: user?.created_at
      ? new Date(user.created_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    totalEntries: 0, 
    averageMood: 0, 
    bio: "Ready to begin my healing journey.",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [stats, setStats] = useState<UserStats>({
    weeklyEntries: 0,
    moodTrend: "starting",
    longestStreak: 0,
  });

  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const makeApiCall = async (url: string, requestId: number) => {
    if (!isMountedRef.current || requestIdRef.current !== requestId) {
      console.log(
        "Request cancelled - component unmounted or newer request started",
      );
      return null;
    }

    try {
      const response = await new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onload = () => {
          const response = new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: new Headers(
              xhr
                .getAllResponseHeaders()
                .split("\r\n")
                .reduce(
                  (headers, line) => {
                    const [key, value] = line.split(": ");
                    if (key && value) headers[key] = value;
                    return headers;
                  },
                  {} as Record<string, string>,
                ),
            ),
          });
          resolve(response);
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.ontimeout = () => reject(new Error("Request timeout"));
        xhr.timeout = 10000;

        xhr.send();
      });

      if (!isMountedRef.current || requestIdRef.current !== requestId) {
        console.log("Request cancelled after fetch");
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!isMountedRef.current || requestIdRef.current !== requestId) {
        console.log("Request cancelled after parsing");
        return null;
      }

      return data;
    } catch (error: any) {
      if (isMountedRef.current && requestIdRef.current === requestId) {
        console.error(`API call failed for ${url}:`, error.message);
        return {
          success: false,
          entries: [],
          total: 0,
          error: error.message,
        };
      }
      return null;
    }
  };

  const fetchUserStats = useCallback(async () => {
    if (!user?.email || !isMountedRef.current) {
      console.log(
        "❌ No user email or component unmounted, skipping stats fetch",
      );
      return;
    }

    if (isLoadingStats) {
      console.log("⏳ Stats fetch already in progress, skipping");
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    console.log(`📊 Starting to fetch user stats for: ${user.email}`);

    setIsLoadingStats(true);
    setStatsError(null);

    try {
      const userEmail = encodeURIComponent(user.email);
      console.log("Fetching user stats for:", user.email);

      const [entriesResult, moodResult] = await Promise.allSettled([
        apiClient.getJournalEntries(user.email, 1, 100),
        apiClient.getMoodData(user.email, 30),
      ]);

      if (!isMountedRef.current || requestIdRef.current !== currentRequestId) {
        console.log("Request outdated, skipping data processing");
        return;
      }

      if (
        entriesResult.status === "fulfilled" &&
        entriesResult.value &&
        entriesResult.value.success !== false
      ) {
        const entries = entriesResult.value;
        console.log("✅ Journal entries data received:", entries);
        console.log("🔍 Entries structure:", {
          total: entries.total,
          entriesLength: entries.entries?.length,
          success: entries.success,
          firstEntry: entries.entries?.[0],
        });

        const entriesArray = Array.isArray(entries.entries)
          ? entries.entries
          : [];
        const totalEntries = entries.total || entriesArray.length || 0;

        const weeklyEntries = entriesArray.filter((entry: any) => {
          try {
            const entryDate = new Date(entry.createdAt || entry.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const isInWeek =
              entryDate >= weekAgo && !isNaN(entryDate.getTime());
            return isInWeek;
          } catch (error) {
            console.warn("Invalid date in entry:", entry);
            return false;
          }
        }).length;

        console.log(
          `📊 Calculated stats: totalEntries=${totalEntries}, weeklyEntries=${weeklyEntries}`,
        );

        if (isMountedRef.current && requestIdRef.current === currentRequestId) {
          setProfile((prev) => ({
            ...prev,
            totalEntries: totalEntries,
          }));
          setStats((prev) => ({ ...prev, weeklyEntries: weeklyEntries }));
          console.log(
            `📈 Updated profile: ${totalEntries} total entries, ${weeklyEntries} this week`,
          );
        }
      } else {
        const errorMessage =
          entriesResult.status === "fulfilled"
            ? entriesResult.value?.error || "Unknown error"
            : entriesResult.reason?.message || "Request failed";
        console.warn("❌ Journal entries fetch failed:", errorMessage);
        console.warn("🔍 Entries result details:", entriesResult);

        console.warn(
          "❌ Journal entries fetch failed, keeping existing values",
        );
      }

      if (
        moodResult.status === "fulfilled" &&
        moodResult.value &&
        moodResult.value.success !== false
      ) {
        const mood = moodResult.value;
        console.log("✅ Mood data received:", mood);
        console.log("🔍 Mood structure:", {
          average: mood.average,
          trend: mood.trend,
          entriesLength: mood.entries?.length,
          success: mood.success,
          totalEntries: mood.totalEntries,
        });

        const avgMood = mood.average || 0;
        const roundedMood = Math.round(avgMood * 10) / 10;

        const apiTrend = mood.trend || "starting";
        const moodTrend: UserStats["moodTrend"] =
          apiTrend === "improving"
            ? "improving"
            : apiTrend === "declining"
              ? "needs attention"
              : apiTrend === "stable"
                ? "stable"
                : "starting";

        console.log(
          `📊 Calculated mood stats: avgMood=${avgMood}, roundedMood=${roundedMood}, trend=${moodTrend}`,
        );

        if (isMountedRef.current && requestIdRef.current === currentRequestId) {
          setProfile((prev) => ({
            ...prev,
            averageMood: roundedMood,
          }));
          setStats((prev) => ({ ...prev, moodTrend: moodTrend }));
          console.log(
            `🎯 Updated mood stats: ${roundedMood}/10 average, ${moodTrend} trend`,
          );
        }
      } else {
        const errorMessage =
          moodResult.status === "fulfilled"
            ? moodResult.value?.error || "Unknown error"
            : moodResult.reason?.message || "Request failed";
        console.warn("❌ Mood data fetch failed:", errorMessage);
        console.warn("🔍 Mood result details:", moodResult);

        console.warn("❌ Mood data fetch failed, keeping existing values");
      }

      if (isMountedRef.current && requestIdRef.current === currentRequestId) {
        console.log("✅ Profile stats loading completed successfully");
        console.log("📈 Profile stats fetch completed");
      }
    } catch (error: any) {
      if (isMountedRef.current && requestIdRef.current === currentRequestId) {
        console.error("❌ Error fetching user stats:", error);
        setStatsError(
          "Unable to load some profile data. Please try refreshing the page.",
        );
      }
    } finally {
      if (isMountedRef.current && requestIdRef.current === currentRequestId) {
        setIsLoadingStats(false);
      }
    }
  }, [user?.email]);

  useEffect(() => {
    if (!loading && user?.email) {
      fetchUserStats();
    }
  }, [user?.email, loading]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadUserProfile = useCallback(async () => {
    if (!user?.email) return;

    try {
      console.log("🔄 Loading user profile from database...");
      const response = await apiClient.getUserProfile(user.email);

      if (response.success && response.user) {
        const userProfile = response.user;
        setProfile((prev) => ({
          ...prev,
          name:
            userProfile.username ||
            user.email?.split("@")[0] ||
            "SoulSpeak User",
          email: userProfile.email,
          joinDate: userProfile.createdAt
            ? new Date(userProfile.createdAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          bio: userProfile.bio || "Ready to begin my healing journey.",
        }));
        setEditForm((prev) => ({
          ...prev,
          name:
            userProfile.username ||
            user.email?.split("@")[0] ||
            "SoulSpeak User",
          email: userProfile.email,
          joinDate: userProfile.createdAt
            ? new Date(userProfile.createdAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          bio: userProfile.bio || "Ready to begin my healing journey.",
        }));
        console.log("✅ User profile loaded successfully");
      }
    } catch (error) {
      console.error("❌ Error loading user profile:", error);
      setProfile((prev) => ({
        ...prev,
        name:
          user.user_metadata?.username ||
          user.email?.split("@")[0] ||
          "SoulSpeak User",
        email: user.email || "demo@soulspeak.com",
        joinDate: user.created_at
          ? new Date(user.created_at).toISOString().split("T")[0]
          : prev.joinDate,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!loading && user?.email) {
      loadUserProfile();
    }
  }, [user?.email, loading, loadUserProfile]);

  const handleSave = async () => {
    if (!user?.email) return;

    try {
      console.log("💾 Saving profile to database...");

      const updateData: UpdateProfileRequest = {
        email: user.email,
        username: editForm.name,
        bio: editForm.bio,
      };

      const response = await apiClient.updateUserProfile(updateData);

      if (response.success && response.user) {
        const savedProfile = {
          ...profile, 
          name: response.user.username,
          email: response.user.email,
          joinDate: new Date(response.user.createdAt)
            .toISOString()
            .split("T")[0],
          bio: response.user.bio,
        };

        setProfile(savedProfile);
        setEditForm(savedProfile);
        setIsEditing(false);

        console.log("✅ Profile saved successfully to database");
      } else {
        throw new Error(response.error || "Failed to save profile");
      }
    } catch (error) {
      console.error("❌ Error saving profile:", error);
      setStatsError("Failed to save profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const handleRefreshStats = () => {
    if (!isLoadingStats) {
      fetchUserStats();
    }
  };

  const getMoodTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-6 h-6 text-emerald-600" />;
      case "stable":
        return <Target className="w-6 h-6 text-blue-600" />;
      case "needs attention":
        return <Heart className="w-6 h-6 text-rose-600" />;
      default:
        return <Sparkles className="w-6 h-6 text-violet-600" />;
    }
  };

  const getMoodTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "from-emerald-400 to-green-500";
      case "stable":
        return "from-blue-400 to-cyan-500";
      case "needs attention":
        return "from-rose-400 to-red-500";
      default:
        return "from-violet-400 to-purple-500";
    }
  };

  const getDaysSinceJoin = () => {
    const joinDate = new Date(profile.joinDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getJourneyProgress = () => {
    const days = Math.max(getDaysSinceJoin(), 1);
    const avgEntriesPerWeek = (profile.totalEntries / days) * 7;
    return Math.min((avgEntriesPerWeek / 3) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center overflow-x-hidden">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse shadow-2xl">
            <Heart className="w-12 h-12 text-white" />
          </div>
          <p className="text-slate-700 font-semibold text-lg">
            Loading your sacred space...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-[8%] w-24 h-24 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-violet-200/20 rounded-full blur-3xl animate-pulse hidden sm:block"></div>
        <div className="absolute top-3/4 right-[8%] w-24 h-24 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000 hidden sm:block"></div>
      </div>

      <AppNavigation
        title="Profile"
        subtitle="Your Personal Sanctuary"
        icon={<Settings className="w-4 h-4 sm:w-6 sm:h-6 text-white" />}
        currentPage="profile"
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 overflow-x-hidden">
        <div className="w-full">
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-lg border border-violet-200/50 rounded-full mb-8 shadow-xl">
              <Crown className="w-5 h-5 text-violet-600 mr-3" />
              <span className="text-sm font-semibold text-slate-700">
                Your Personal Sanctuary
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent mb-4 sm:mb-6">
              Your Profile
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 leading-relaxed max-w-4xl mx-auto">
              Your personal space for reflection, growth, and celebrating your
              healing journey.
              <br className="hidden sm:block" />
              <span className="text-violet-600 font-semibold">
                Every step forward is worth celebrating.
              </span>
            </p>
          </div>

          {statsError && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <p className="text-rose-800 text-sm">{statsError}</p>
                <Button
                  onClick={handleRefreshStats}
                  size="sm"
                  variant="outline"
                  className="border-rose-300 text-rose-700 hover:bg-rose-100"
                  disabled={isLoadingStats}
                >
                  {isLoadingStats ? "Loading..." : "Retry"}
                </Button>
              </div>
            </div>
          )}

          <div className="grid xl:grid-cols-4 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="xl:col-span-3 lg:col-span-2 space-y-8">
              <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-white/60 to-violet-50/50">
                  <CardTitle className="flex items-center text-slate-800 text-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-xl">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    Profile Information
                  </CardTitle>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                      className="border-violet-300 text-violet-700 hover:bg-violet-100 rounded-2xl backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-lg"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleSave}
                        size="sm"
                        className="bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl hover:scale-105 transition-all duration-300 shadow-xl"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        size="sm"
                        className="border-slate-300 text-slate-600 hover:bg-slate-100 rounded-2xl hover:scale-105 transition-all duration-300"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-8 p-8 lg:p-12">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label
                        htmlFor="name"
                        className="text-slate-700 font-semibold flex items-center"
                      >
                        <Star className="w-5 h-5 mr-3 text-violet-600" />
                        Name
                      </Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="border-violet-200/50 focus:ring-violet-500/50 rounded-2xl bg-white/80 backdrop-blur-sm h-12"
                        />
                      ) : (
                        <p className="text-slate-800 font-bold text-xl">
                          {profile.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-4">
                      <Label
                        htmlFor="email"
                        className="text-slate-700 font-semibold flex items-center"
                      >
                        <Mail className="w-5 h-5 mr-3 text-purple-600" />
                        Email
                      </Label>
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl backdrop-blur-sm border border-purple-200/50">
                        <Mail className="w-5 h-5 text-slate-600" />
                        <p className="text-slate-700 font-medium">
                          {profile.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label
                      htmlFor="bio"
                      className="text-slate-700 font-semibold flex items-center"
                    >
                      <Heart className="w-5 h-5 mr-3 text-pink-600" />
                      Your Healing Story
                    </Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }))
                        }
                        className="border-violet-200/50 focus:ring-violet-500/50 min-h-[140px] rounded-2xl bg-white/80 backdrop-blur-sm"
                        placeholder="Share your journey, hopes, dreams, or what brought you to SoulSpeak..."
                      />
                    ) : (
                      <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl backdrop-blur-sm border border-violet-200/50">
                        <p className="text-slate-700 leading-relaxed italic font-medium">
                          "{profile.bio}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-violet-100/50 to-purple-100/50 rounded-2xl backdrop-blur-sm border border-violet-200/50">
                    <Calendar className="w-6 h-6 text-violet-600" />
                    <span className="text-slate-700 font-medium">
                      Member since{" "}
                      <span className="font-bold text-slate-800">
                        {new Date(profile.joinDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
                      <span className="text-slate-500 ml-3 text-sm">
                        ({getDaysSinceJoin()} days of growth)
                      </span>
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-white/60 to-purple-50/50">
                  <CardTitle className="flex items-center text-slate-800 text-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mr-4 shadow-xl">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    Your Healing Journey
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 lg:p-12">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-semibold text-slate-700">
                          Journey Progress
                        </span>
                        <span className="text-sm text-slate-600 bg-violet-100 px-3 py-1 rounded-xl font-semibold">
                          {Math.round(getJourneyProgress())}%
                        </span>
                      </div>
                      <Progress
                        value={getJourneyProgress()}
                        className="h-4 bg-white/80 rounded-full"
                      />
                      <p className="text-sm text-slate-500">
                        Based on consistency and engagement with your healing
                        practice
                      </p>
                    </div>

                    <div className="prose prose-lg max-w-none text-slate-700 space-y-6">
                      <p className="leading-relaxed text-lg">
                        Every entry you write is a courageous step forward in
                        your healing journey. Your willingness to explore your
                        emotions and seek understanding shows incredible{" "}
                        <span className="text-violet-600 font-bold">
                          bravery and self-compassion
                        </span>
                        .
                      </p>
                      <p className="leading-relaxed text-lg">
                        Remember that healing isn't linear—there will be ups and
                        downs, mountains and valleys, and that's perfectly
                        normal. Each moment of reflection brings you closer to
                        understanding yourself and finding{" "}
                        <span className="text-purple-600 font-bold">
                          inner peace and wisdom
                        </span>
                        .
                      </p>
                      <div className="bg-gradient-to-r from-violet-100/50 to-purple-100/50 p-6 rounded-2xl border border-violet-200/50">
                        <p className="text-slate-800 font-semibold text-lg flex items-center">
                          <Sparkles className="w-5 h-5 mr-3 text-violet-600" />
                          You are exactly where you need to be in this moment.
                          Trust your process.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="xl:col-span-1 lg:col-span-1 space-y-8">
              <Card className="border-0 bg-gradient-to-br from-white/80 to-violet-50/50 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-white/60 to-violet-50/50">
                  <CardTitle className="text-slate-800 text-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <Award className="w-6 h-6 mr-3 text-violet-600" />
                      Your Statistics
                    </div>
                    {isLoadingStats && (
                      <div className="w-4 h-4 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin"></div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 p-8">
                  <div className="text-center space-y-3">
                    <div className="text-3xl sm:text-4xl font-bold text-slate-800">
                      {isLoadingStats ? "..." : profile.totalEntries || 0}
                    </div>
                    <div className="text-sm text-slate-600 font-semibold">
                      Total Journal Entries
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.min(profile.totalEntries, 5) ? "text-violet-500 fill-current" : "text-slate-300"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="text-3xl sm:text-4xl font-bold text-purple-600">
                      {isLoadingStats
                        ? "..."
                        : profile.averageMood > 0
                          ? `${profile.averageMood.toFixed(1)}/10`
                          : "—"}
                    </div>
                    <div className="text-sm text-slate-600 font-semibold">
                      Average Mood
                    </div>
                    {profile.averageMood > 0 && (
                      <div className="flex items-center justify-center">
                        {profile.averageMood <= 3 ? (
                          <Frown className="w-5 h-5 text-rose-500" />
                        ) : profile.averageMood <= 7 ? (
                          <Meh className="w-5 h-5 text-amber-500" />
                        ) : (
                          <Smile className="w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-center space-y-3">
                    <div className="text-3xl sm:text-4xl font-bold text-pink-600">
                      {isLoadingStats ? "..." : stats.weeklyEntries || 0}
                    </div>
                    <div className="text-sm text-slate-600 font-semibold">
                      Entries This Week
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-pink-100 text-pink-700 border-0 font-semibold"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      {stats.weeklyEntries >= 3 ? "Amazing!" : "Keep going!"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-white/80 to-purple-50/50 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-white/60 to-purple-50/50">
                  <CardTitle className="text-slate-800 text-lg flex items-center">
                    <TrendingUp className="w-6 h-6 mr-3 text-purple-600" />
                    Mood Journey
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${getMoodTrendColor(stats.moodTrend)} rounded-3xl flex items-center justify-center mx-auto shadow-2xl`}
                    >
                      {getMoodTrendIcon(stats.moodTrend)}
                    </div>
                    <div className="space-y-3">
                      <div className="text-2xl font-bold capitalize text-slate-800">
                        {stats.moodTrend.replace("_", " ")}
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {stats.moodTrend === "starting" &&
                          "Begin your journey by writing your first entry or logging your mood. Every small step counts! 🌱"}
                        {stats.moodTrend === "improving" &&
                          "Your mood has been on an upward trend. Keep nurturing yourself! You're doing beautifully. 🌟"}
                        {stats.moodTrend === "stable" &&
                          "Your mood has been steady. Consistency is a sign of inner strength and growth. 🌊"}
                        {stats.moodTrend === "needs attention" &&
                          "Be extra gentle with yourself during difficult times. You're braver than you believe. 💜"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-white/80 to-pink-50/50 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-white/60 to-pink-50/50">
                  <CardTitle className="text-slate-800 text-lg flex items-center">
                    <Sparkles className="w-6 h-6 mr-3 text-pink-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-8">
                  <Button
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-2xl hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl py-3"
                    onClick={() => navigate("/journal")}
                  >
                    <BookOpen className="w-5 h-5 mr-3" />
                    Write New Entry
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-purple-300 text-purple-700 hover:bg-purple-100 rounded-2xl hover:scale-105 transition-all duration-300 backdrop-blur-sm py-3"
                    onClick={() => navigate("/mood-tracker")}
                  >
                    <TrendingUp className="w-5 h-5 mr-3" />
                    Log Mood
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-pink-300 text-pink-700 hover:bg-pink-100 rounded-2xl hover:scale-105 transition-all duration-300 backdrop-blur-sm py-3"
                    onClick={() => navigate("/my-entries")}
                  >
                    <Heart className="w-5 h-5 mr-3" />
                    View All Entries
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-white/80 to-violet-50/50 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <Sun className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-4 text-lg">
                    Daily Inspiration
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed italic bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-2xl">
                    "The most beautiful people are those who have known defeat,
                    known suffering, known struggle, known loss, and have found
                    their way out of the depths."
                  </p>
                  <p className="text-xs text-slate-500 mt-3 font-semibold">
                    — Elisabeth Kübler-Ross
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
