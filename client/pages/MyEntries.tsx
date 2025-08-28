import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import {
  Heart,
  BookOpen,
  Calendar,
  Search,
  Filter,
  Eye,
  Trash2,
  Star,
  Sparkles,
  Crown,
  Moon,
  Sun,
  Zap,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import AppNavigation from "../components/ui/app-navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";

interface JournalEntry {
  id: string;
  aiResponse: string;
  mood?: number;
  tags?: string[];
  createdAt: string;
  excerpt?: string;
  content?: string;
}

export default function MyEntries() {
  const { user, loading } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterMood, setFilterMood] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const isMountedRef = useRef(true);

  const entriesPerPage = 6;

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
      return;
    }
    if (user) {
      fetchEntries();
    }
  }, [currentPage, user, loading]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []); 

  useEffect(() => {
    filterAndSortEntries();
  }, [entries, searchTerm, sortBy, filterMood]);

  const fetchEntries = async () => {
    if (!user?.email || !isMountedRef.current) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log(
        `📚 Fetching entries for ${user.email} (page ${currentPage})`,
      );
      const userEmail = encodeURIComponent(user.email);
      const response = await fetch(
        `/api/journal/entries?email=${userEmail}&page=${currentPage}&limit=${entriesPerPage}`,
      );

      if (!isMountedRef.current) {
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Entries data received:", data);
        const entriesWithDefaults = (data.entries || []).map((entry: any) => ({
          ...entry,
          tags: entry.tags || [],
        }));
        setEntries(entriesWithDefaults);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error(
          "❌ Failed to fetch entries:",
          response.status,
          response.statusText,
        );
        setEntries([]);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error("❌ Error fetching entries:", error);
        setEntries([]);
        setTotalPages(1);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const filterAndSortEntries = () => {
    if (!entries || !Array.isArray(entries)) {
      setFilteredEntries([]);
      return;
    }
    let filtered = [...entries];

    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.aiResponse.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entry.tags &&
            entry.tags.some((tag) =>
              tag.toLowerCase().includes(searchTerm.toLowerCase()),
            )),
      );
    }

    if (filterMood !== "all") {
      if (filterMood === "none") {
        filtered = filtered.filter((entry) => !entry.mood);
      } else {
        const moodRange = filterMood.split("-").map(Number);
        filtered = filtered.filter(
          (entry) =>
            entry.mood &&
            entry.mood >= moodRange[0] &&
            entry.mood <= moodRange[1],
        );
      }
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "mood-high":
          return (b.mood || 0) - (a.mood || 0);
        case "mood-low":
          return (a.mood || 0) - (b.mood || 0);
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    setFilteredEntries(filtered);
  };

  const viewFullEntry = async (entryId: string) => {
    if (!user?.email || !isMountedRef.current) return;

    try {
      console.log(`👁️ Viewing full entry: ${entryId}`);
      const userEmail = encodeURIComponent(user.email);
      const response = await fetch(
        `/api/journal/entries/${entryId}?email=${userEmail}`,
      );

      if (!isMountedRef.current) {
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Single entry data received:", data);
        const entry = data.entry || data;
        const entryWithDefaults = {
          ...entry,
          tags: entry.tags || [],
          content: entry.content || "Content not available",
        };
        setSelectedEntry(entryWithDefaults);
      } else {
        console.error(
          "❌ Failed to fetch entry:",
          response.status,
          response.statusText,
        );
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      if (isMountedRef.current) {
        console.error("❌ Error fetching full entry:", error);
      }
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (!user?.email || !isMountedRef.current) return;

    if (
      confirm(
        "Are you sure you want to delete this entry? This action cannot be undone.",
      )
    ) {
      try {
        console.log(`🗑️ Deleting entry: ${entryId}`);
        const response = await fetch(`/api/journal/entries/${entryId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        });

        if (!isMountedRef.current) {
          return;
        }

        if (response.ok) {
          console.log("✅ Entry deleted successfully");
          setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
        } else {
          console.error("❌ Failed to delete entry:", response.status);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        if (isMountedRef.current) {
          console.error("❌ Error deleting entry:", error);
        }
      }
    }
  };

  const getMoodColor = (mood?: number) => {
    if (!mood) return "bg-slate-100 text-slate-600";
    if (mood <= 3) return "bg-rose-100 text-rose-700 border-rose-200";
    if (mood <= 6) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  };

  const getMoodLabel = (mood?: number) => {
    if (!mood) return "No mood logged";
    if (mood <= 3) return "Challenging";
    if (mood <= 6) return "Mixed";
    return "Positive";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center overflow-x-hidden">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <p className="text-slate-700 font-semibold">
            Loading your memories...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center overflow-x-hidden">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Please Sign In
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            You need to be signed in to view your beautiful collection of
            entries.
          </p>
          <Button
            onClick={() => (window.location.href = "/login")}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-3 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <Crown className="w-5 h-5 mr-2" />
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-[8%] w-24 h-24 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-violet-200/20 rounded-full blur-3xl animate-pulse hidden sm:block"></div>
        <div className="absolute top-3/4 right-[8%] w-24 h-24 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000 hidden sm:block"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-pink-200/20 rounded-full blur-3xl animate-pulse delay-2000 hidden sm:block"></div>
      </div>

      <AppNavigation
        title="My Entries"
        subtitle="Your Sacred Collection"
        icon={<BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-white" />}
        currentPage="entries"
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-x-hidden">
        <div className="w-full">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-lg border border-violet-200/50 rounded-full mb-8 shadow-xl">
              <Star className="w-5 h-5 text-violet-600 mr-3" />
              <span className="text-sm font-semibold text-slate-700">
                Your Memory Palace
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-700 via-purple-700 to-pink-700 bg-clip-text text-transparent mb-6 leading-tight">
              My Journal Entries
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 leading-relaxed max-w-4xl mx-auto">
              Your personal collection of{" "}
              <span className="text-violet-600 font-semibold">
                thoughts, feelings,
              </span>{" "}
              and
              <span className="text-purple-600 font-semibold">
                {" "}
                AI reflections
              </span>{" "}
              — a beautiful tapestry of your growth journey.
            </p>
          </div>

          <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl mb-12 rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col xl:flex-row gap-6 items-center">
                <div className="flex-1 w-full relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <Input
                    placeholder="Search your memories and AI reflections..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 border-violet-200/50 focus:ring-violet-500/50 bg-white/80 rounded-2xl h-12 text-slate-700 placeholder:text-slate-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48 border-violet-200/50 rounded-2xl bg-white/80 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-violet-200/50 rounded-2xl">
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="mood-high">Highest Mood</SelectItem>
                      <SelectItem value="mood-low">Lowest Mood</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterMood} onValueChange={setFilterMood}>
                    <SelectTrigger className="w-full sm:w-48 border-violet-200/50 rounded-2xl bg-white/80 h-12">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-violet-200/50 rounded-2xl">
                      <SelectItem value="all">All Moods</SelectItem>
                      <SelectItem value="1-3">Challenging (1-3)</SelectItem>
                      <SelectItem value="4-6">Mixed (4-6)</SelectItem>
                      <SelectItem value="7-10">Positive (7-10)</SelectItem>
                      <SelectItem value="none">No Mood</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card
                  key={i}
                  className="border-0 bg-white/70 backdrop-blur-xl shadow-xl animate-pulse rounded-3xl overflow-hidden"
                >
                  <CardContent className="p-8">
                    <div className="h-6 bg-slate-200 rounded-xl mb-6"></div>
                    <div className="h-24 bg-slate-100 rounded-2xl mb-6"></div>
                    <div className="h-4 bg-slate-200 rounded-xl w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-6 sm:p-8 md:p-12 lg:p-16 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <BookOpen className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-4">
                  {searchTerm || filterMood !== "all"
                    ? "No entries found"
                    : "Your collection awaits"}
                </h3>
                <p className="text-xl text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                  {searchTerm || filterMood !== "all"
                    ? "Try adjusting your search or filters to find what you're looking for"
                    : "Start your beautiful healing journey by writing your first heartfelt entry"}
                </p>
                <Link to="/journal">
                  <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <Sparkles className="w-5 h-5 mr-3" />
                    Write Your First Entry
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
                {filteredEntries.map((entry) => (
                  <Card
                    key={entry.id}
                    className="border-0 bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 group rounded-3xl overflow-hidden hover:scale-105"
                  >
                    <CardHeader className="pb-4 bg-gradient-to-r from-white/50 to-transparent">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-slate-600">
                            {new Date(entry.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        {entry.mood && (
                          <Badge
                            className={`${getMoodColor(entry.mood)} border font-semibold shadow-sm`}
                          >
                            {entry.mood}/10
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 p-8 pt-0">
                      <div className="text-slate-700 text-sm leading-relaxed line-clamp-4 bg-gradient-to-br from-slate-50 to-violet-50/50 p-4 rounded-2xl">
                        {entry.aiResponse.substring(0, 150)}...
                      </div>

                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {entry.tags.slice(0, 3).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs border-violet-200 text-violet-700 bg-violet-50/50 rounded-xl"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {entry.tags.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs border-purple-200 text-purple-700 bg-purple-50/50 rounded-xl"
                            >
                              +{entry.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-4">
                        <Button
                          onClick={() => viewFullEntry(entry.id)}
                          variant="outline"
                          size="sm"
                          className="border-violet-300 text-violet-700 hover:bg-violet-100 rounded-2xl hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-lg"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Read Full
                        </Button>
                        <Button
                          onClick={() => deleteEntry(entry.id)}
                          variant="outline"
                          size="sm"
                          className="border-rose-300 text-rose-700 hover:bg-rose-100 rounded-2xl hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center space-x-3">
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      className={
                        currentPage === i + 1
                          ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl hover:scale-105 transition-all duration-300 shadow-xl"
                          : "border-violet-300 text-violet-700 hover:bg-violet-100 rounded-2xl hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-lg"
                      }
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="border-0 bg-white/95 backdrop-blur-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-white/80 to-violet-50/50 border-b border-violet-200/50">
              <CardTitle className="text-slate-800 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mr-3 shadow-lg">
                  <Moon className="w-4 h-4 text-white" />
                </div>
                Entry from{" "}
                {new Date(selectedEntry.createdAt).toLocaleDateString()}
              </CardTitle>
              <Button
                onClick={() => setSelectedEntry(null)}
                variant="outline"
                size="sm"
                className="border-slate-300 text-slate-600 hover:bg-slate-100 rounded-2xl hover:scale-105 transition-all duration-300"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              {selectedEntry.mood && (
                <div className="flex items-center space-x-3">
                  <span className="text-slate-600 font-medium">Mood:</span>
                  <Badge
                    className={`${getMoodColor(selectedEntry.mood)} border font-semibold shadow-sm`}
                  >
                    {selectedEntry.mood}/10 - {getMoodLabel(selectedEntry.mood)}
                  </Badge>
                </div>
              )}

              <div>
                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                  <Sun className="w-5 h-5 mr-2 text-violet-600" />
                  Your Entry:
                </h3>
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-2xl border border-violet-200/50">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedEntry.content || "Content not available"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                  AI Response:
                </h3>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200/50">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedEntry.aiResponse}
                  </p>
                </div>
              </div>

              {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-pink-600" />
                    Tags:
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedEntry.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-violet-200 text-violet-700 bg-violet-50/80 rounded-xl px-3 py-1"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
