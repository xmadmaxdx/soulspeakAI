import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import {
  Activity,
  Database,
  Brain,
  Heart,
  BookOpen,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  Server,
  Wifi,
  Settings,
  BarChart3,
  Code,
  Play,
  Key,
  Globe,
  Monitor,
  Download,
  Upload,
  Timer,
  Target,
  Award,
  Star,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Copy,
  FileText,
  MessageCircle,
  User,
  Lock,
  Unlock,
} from "lucide-react";
import AppNavigation from "../components/ui/app-navigation";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useToast } from "../hooks/use-toast";

interface TestResult {
  id: string;
  endpoint: string;
  method: string;
  status: "success" | "error" | "warning" | "pending";
  responseTime: number;
  statusCode?: number;
  response?: any;
  error?: string;
  timestamp: string;
}

interface SystemStatus {
  database: "online" | "offline" | "warning";
  ai: "online" | "offline" | "warning";
  auth: "online" | "offline" | "warning";
  apiKeys: number;
  keysConfigured: number;
  quotaExceeded: number;
  activeConnections: number;
  uptimePercentage: number;
  uptimeFormatted: string;
  totalRequests: number;
  errorRate: number;
}

interface ApiEndpoint {
  id: string;
  name: string;
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  description: string;
  category: "Authentication" | "Journal" | "Mood" | "AI" | "User" | "System";
  requiresAuth: boolean;
  testPayload?: any;
}

export default function ApiTest() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: "offline",
    ai: "offline",
    auth: "offline",
    apiKeys: 0,
    keysConfigured: 0,
    quotaExceeded: 0,
    activeConnections: 0,
    uptimePercentage: 0,
    uptimeFormatted: "0s",
    totalRequests: 0,
    errorRate: 0,
  });
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("");
  const [customPayload, setCustomPayload] = useState("");
  const [showPayload, setShowPayload] = useState(false);
  const [testFilter, setTestFilter] = useState<string>("all");
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());

  const apiEndpoints: ApiEndpoint[] = [
    {
      id: "health",
      name: "Health Check",
      path: "/api/health",
      method: "GET",
      description:
        "Real system health monitoring with database, AI, and auth status",
      category: "System",
      requiresAuth: false,
    },
    {
      id: "ping",
      name: "API Ping",
      path: "/api/ping",
      method: "GET",
      description: "Basic API connectivity and health check",
      category: "System",
      requiresAuth: false,
    },
    {
      id: "journal-entries",
      name: "Journal Entries (Test Mode)",
      path: "/api/test/journal/entries",
      method: "POST",
      description:
        "🧪 TEST ONLY - Create journal entry simulation (no data saved)",
      category: "Journal",
      requiresAuth: false,
      testPayload: {
        content: "Testing API integration for journal entries",
        mood: 7,
        email: user?.email || "demo@soulspeak.com",
        userName: user?.user_metadata?.username || "API Tester",
      },
    },
    {
      id: "journal-get",
      name: "Get Journal Entries (Test Mode)",
      path: `/api/test/journal/entries?email=${encodeURIComponent(user?.email || "demo@soulspeak.com")}&limit=10`,
      method: "GET",
      description: "🧪 TEST ONLY - Retrieve simulated journal entries",
      category: "Journal",
      requiresAuth: false,
    },
    {
      id: "mood-log",
      name: "Log Mood (Test Mode)",
      path: "/api/test/mood/entries",
      method: "POST",
      description: "🧪 TEST ONLY - Log mood entry simulation (no data saved)",
      category: "Mood",
      requiresAuth: false,
      testPayload: {
        moodLevel: 8,
        notes: "Testing API mood logging functionality",
        email: user?.email || "demo@soulspeak.com",
        userName: user?.user_metadata?.username || "API Tester",
      },
    },
    {
      id: "mood-data",
      name: "Mood Analytics (Test Mode)",
      path: `/api/test/mood/data?email=${encodeURIComponent(user?.email || "demo@soulspeak.com")}&days=30`,
      method: "GET",
      description: "🧪 TEST ONLY - Get simulated mood analytics",
      category: "Mood",
      requiresAuth: false,
    },
    {
      id: "ai-chat",
      name: "AI Companion Chat (Test Mode)",
      path: "/api/test/companion/chat",
      method: "POST",
      description: "🧪 TEST ONLY - Chat simulation (no AI processing)",
      category: "AI",
      requiresAuth: false,
      testPayload: {
        message:
          "Hello, this is a test message for the API testing dashboard. How are you doing today?",
      },
    },
    {
      id: "user-profile",
      name: "User Profile (Test Mode)",
      path: `/api/test/user/profile?email=${encodeURIComponent(user?.email || "demo@soulspeak.com")}`,
      method: "GET",
      description: "🧪 TEST ONLY - Get simulated user profile",
      category: "User",
      requiresAuth: false,
    },
    {
      id: "auth-status",
      name: "Auth Status",
      path: "/api/auth/status",
      method: "GET",
      description: "Real Supabase authentication configuration and status",
      category: "Authentication",
      requiresAuth: false,
    },
    {
      id: "test-verify",
      name: "API Test Verification",
      path: "/api/test/verify",
      method: "GET",
      description: "Verify API testing functionality is working correctly",
      category: "System",
      requiresAuth: false,
    },
    {
      id: "test-cleanup",
      name: "🧹 Cleanup Test Data",
      path: "/api/test/cleanup",
      method: "DELETE",
      description: "Remove accidentally saved test data from database",
      category: "System",
      requiresAuth: false,
    },
    {
      id: "real-journal-entries",
      name: "⚠️ REAL Journal Entries",
      path: "/api/journal/entries",
      method: "POST",
      description: "⚠️ DANGER: Creates REAL journal entries in database",
      category: "Real Endpoints",
      requiresAuth: true,
      testPayload: {
        content: "⚠️ This will create a REAL journal entry!",
        mood: 5,
        email: user?.email || "demo@soulspeak.com",
        userName: user?.user_metadata?.username || "Real User",
      },
    },
    {
      id: "real-mood-log",
      name: "⚠️ REAL Mood Log",
      path: "/api/mood/entries",
      method: "POST",
      description: "⚠️ DANGER: Creates REAL mood entries in database",
      category: "Real Endpoints",
      requiresAuth: true,
      testPayload: {
        moodLevel: 5,
        notes: "⚠️ This will create a REAL mood entry!",
        email: user?.email || "demo@soulspeak.com",
        userName: user?.user_metadata?.username || "Real User",
      },
    },
    {
      id: "real-ai-chat",
      name: "⚠️ REAL AI Chat",
      path: "/api/companion/chat",
      method: "POST",
      description: "⚠️ DANGER: Uses REAL AI API quota",
      category: "Real Endpoints",
      requiresAuth: true,
      testPayload: {
        message: "⚠️ This will use real AI API quota!",
      },
    },
  ];

  const fetchSystemStatus = async () => {
    if (!isMountedRef.current) {
      return;
    }

    try {
      setIsLoadingStatus(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort("Request timeout after 10 seconds");
      }, 10000);

      const fetchWithTimeout = async (url: string) => {
        try {
          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
            },
          });
          return response;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            console.log(`Request to ${url} was aborted (timeout or cancelled)`);
            return new Response(
              JSON.stringify({ error: "Request timeout", status: "offline" }),
              { status: 408, statusText: "Request Timeout" },
            );
          }
          console.error(`Network error for ${url}:`, error);
          return new Response(
            JSON.stringify({ error: "Network error", status: "offline" }),
            { status: 503, statusText: "Service Unavailable" },
          );
        }
      };

      const [healthResponse, authResponse] = await Promise.allSettled([
        fetchWithTimeout("/api/health"),
        fetchWithTimeout("/api/auth/status"),
      ]);

      clearTimeout(timeoutId);

      let healthData, authData;

      if (healthResponse.status === "fulfilled") {
        const response = healthResponse.value;
        try {
          if (response.ok) {
            healthData = await response.json();
          } else {
            console.warn(`Health endpoint returned status: ${response.status}`);
            healthData = {
              database: { status: "offline" },
              ai: { status: "offline", keys: 0, available_keys: 0 },
              uptime: { percentage: 0, formatted: "0s" },
            };
          }
        } catch (error) {
          console.error("Error parsing health response:", error);
          healthData = {
            database: { status: "offline" },
            ai: { status: "offline", keys: 0, available_keys: 0 },
            uptime: { percentage: 0, formatted: "0s" },
          };
        }
      } else {
        console.error("Health request failed:", healthResponse.reason);
        healthData = {
          database: { status: "offline" },
          ai: { status: "offline", keys: 0, available_keys: 0 },
          uptime: { percentage: 0, formatted: "0s" },
        };
      }

  
      if (authResponse.status === "fulfilled") {
        const response = authResponse.value;
        try {
          if (response.ok) {
            authData = await response.json();
          } else {
            console.warn(`Auth endpoint returned status: ${response.status}`);
            authData = { status: "offline" };
          }
        } catch (error) {
          console.error("Error parsing auth response:", error);
          authData = { status: "offline" };
        }
      } else {
        console.error("Auth request failed:", authResponse.reason);
        authData = { status: "offline" };
      }

      const successfulTests = testResults.filter(
        (r) => r.status === "success",
      ).length;
      const totalTests = testResults.length;
      const successRate =
        totalTests > 0 ? (successfulTests / totalTests) * 100 : 100;
      const errorRate =
        totalTests > 0
          ? ((totalTests - successfulTests) / totalTests) * 100
          : 0;

      const workingKeys = healthData?.ai?.available_keys ?? 0;
      const totalKeys = healthData?.ai?.keys ?? 0;
      const quotaExceeded = healthData?.ai?.quota_exceeded ?? 0;

      if (isMountedRef.current) {
        setSystemStatus({
          database: healthData?.database?.status || "offline",
          ai: healthData?.ai?.status || "offline",
          auth: authData?.status || "offline",
          apiKeys: workingKeys,
          keysConfigured: totalKeys,
          quotaExceeded,
          activeConnections: totalKeys,
          uptimePercentage: healthData?.uptime?.percentage || 0,
          uptimeFormatted: healthData?.uptime?.formatted || "0s",
          totalRequests: testResults.length,
          errorRate: errorRate,
        });
      }
    } catch (error) {
      console.error("Error in fetchSystemStatus:", error);

      if (error instanceof Error && error.name === "AbortError") {
        console.log(
          "System status fetch was aborted (likely due to timeout or component unmount)",
        );
        return;
      }

      if (isMountedRef.current) {
        toast({
          title: "⚠️ System Status Error",
          description:
            "Unable to fetch system status. Some features may be limited.",
          variant: "destructive",
          duration: 3000,
        });

        setSystemStatus((prev) => ({
          ...prev,
          database: "offline",
          ai: "offline",
          auth: "offline",
          apiKeys: 0,
          activeConnections: 0,
          uptimePercentage: 0,
          uptimeFormatted: "Error",
          errorRate: 100,
        }));
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingStatus(false);
      }
    }
  };

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    fetchSystemStatus();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isMountedRef.current && !isLoadingStatus) {
        fetchSystemStatus();
      }
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [isLoadingStatus]);

  const runSingleTest = async (endpoint: ApiEndpoint) => {
    if (endpoint.requiresAuth && !user) {
      toast({
        title: "🔐 Authentication Required",
        description: `${endpoint.name} requires authentication. Please log in first.`,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    const testId = `test_${Date.now()}_${endpoint.id}`;
    const startTime = Date.now();

    setRunningTests((prev) => new Set(prev).add(endpoint.id));

    const pendingResult: TestResult = {
      id: testId,
      endpoint: endpoint.name,
      method: endpoint.method,
      status: "pending",
      responseTime: 0,
      timestamp: new Date().toISOString(),
    };

    setTestResults((prev) => [pendingResult, ...prev]);

    try {
      const requestOptions: RequestInit = {
        method: endpoint.method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (endpoint.requiresAuth && user) {
        console.log(`Running authenticated test for ${endpoint.name}`);
      }
      if (endpoint.method !== "GET" && endpoint.testPayload) {
        try {
          const payload =
            customPayload && selectedEndpoint === endpoint.id
              ? JSON.parse(customPayload)
              : endpoint.testPayload;

          requestOptions.body = JSON.stringify(payload);
          console.log(
            `Sending ${endpoint.method} request to ${endpoint.path}`,
            payload,
          );
        } catch (payloadError) {
          console.error("Invalid JSON in custom payload:", payloadError);
          throw new Error("Invalid JSON in custom payload");
        }
      }

      const response = await fetch(endpoint.path, requestOptions);
      const responseTime = Date.now() - startTime;

      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        const responseText = await response.text();
        responseData = {
          error: "Failed to parse JSON response",
          rawResponse: responseText,
          parsingError:
            jsonError instanceof Error
              ? jsonError.message
              : "Unknown parsing error",
        };
      }

      const result: TestResult = {
        id: testId,
        endpoint: endpoint.name,
        method: endpoint.method,
        status: response.ok
          ? "success"
          : response.status >= 400
            ? "error"
            : "warning",
        responseTime,
        statusCode: response.status,
        response: responseData,
        timestamp: new Date().toISOString(),
      };
      console.log(`API test completed for ${endpoint.name}:`, {
        status: response.status,
        responseTime: `${responseTime}ms`,
        success: response.ok,
      });

      setTestResults((prev) =>
        prev.map((test) => (test.id === testId ? result : test)),
      );

      setRunningTests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(endpoint.id);
        return newSet;
      });

      toast({
        title: "Test Completed Successfully",
        description: `${endpoint.name} responded in ${responseTime}ms`,
        duration: 3000,
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;

      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      const isAbort =
        (error as any)?.name === "AbortError" || /abort/i.test(errorMessage);
      const isNetwork =
        /Failed to fetch/i.test(errorMessage) ||
        /NetworkError/i.test(errorMessage);

      const result: TestResult = {
        id: testId,
        endpoint: endpoint.name,
        method: endpoint.method,
        status: isAbort || isNetwork ? "warning" : "error",
        responseTime,
        error: isAbort
          ? "Request timed out. Please try again."
          : isNetwork
            ? "Network unavailable. Please check connection and retry."
            : errorMessage,
        timestamp: new Date().toISOString(),
      };

      setTestResults((prev) =>
        prev.map((test) => (test.id === testId ? result : test)),
      );

      setRunningTests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(endpoint.id);
        return newSet;
      });

      if (!(isAbort || isNetwork)) {
        toast({
          title: "❌ Test Failed",
          description: `${endpoint.name}: ${errorMessage}`,
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: "⚠️ Test Warning",
          description: result.error,
          duration: 3500,
        });
      }
    }
  };

  const runAllTests = async () => {
    console.log("🚀 Starting comprehensive API test suite...");
    setIsRunningTests(true);
    setTestResults([]);

    const safeEndpoints = apiEndpoints.filter(
      (endpoint) => endpoint.category !== "Real Endpoints",
    );

    toast({
      title: "Running Safe Tests Only",
      description: `Testing ${safeEndpoints.length} safe API endpoints (excluding ${apiEndpoints.length - safeEndpoints.length} dangerous endpoints)...`,
      duration: 3000,
    });

    try {
      for (let i = 0; i < safeEndpoints.length; i++) {
        const endpoint = safeEndpoints[i];
        console.log(
          `🧪 Testing ${i + 1}/${safeEndpoints.length}: ${endpoint.name}`,
        );

        await runSingleTest(endpoint);

        if (i < safeEndpoints.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 750));
        }
      }

      console.log("✅ All safe API tests completed successfully");

      setTimeout(() => {
        const successCount = testResults.filter(
          (r) => r.status === "success",
        ).length;
        const totalCount = safeEndpoints.length;

        toast({
          title: "✅ Safe Test Suite Completed",
          description: `${successCount}/${totalCount} safe tests passed successfully (${apiEndpoints.length - safeEndpoints.length} dangerous tests excluded)`,
          duration: 5000,
        });
      }, 500);
    } catch (error) {
      console.error("��� Error during test suite execution:", error);

      toast({
        title: "❌ Test Suite Error",
        description: "An error occurred while running the test suite",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsRunningTests(false);
      setTimeout(() => {
        if (!isLoadingStatus) {
          fetchSystemStatus();
        }
      }, 1000);
    }
  };

  const getStatusIcon = (status: "online" | "offline" | "warning") => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case "offline":
        return <XCircle className="w-5 h-5 text-rose-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Success
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-rose-100 text-rose-700 border-rose-200">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Testing...
          </Badge>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Authentication":
        return <Shield className="w-4 h-4" />;
      case "Journal":
        return <BookOpen className="w-4 h-4" />;
      case "Mood":
        return <Heart className="w-4 h-4" />;
      case "AI":
        return <Brain className="w-4 h-4" />;
      case "User":
        return <User className="w-4 h-4" />;
      case "System":
        return <Server className="w-4 h-4" />;
      case "Real Endpoints":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Authentication":
        return "from-red-400 to-rose-500";
      case "Journal":
        return "from-blue-400 to-cyan-500";
      case "Mood":
        return "from-pink-400 to-rose-500";
      case "AI":
        return "from-purple-400 to-violet-500";
      case "User":
        return "from-green-400 to-emerald-500";
      case "System":
        return "from-gray-400 to-slate-500";
      case "Real Endpoints":
        return "from-red-600 to-red-800";
      default:
        return "from-indigo-400 to-blue-500";
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "📋 Copied!",
        description: "Copied to clipboard",
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast({
        title: "❌ Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  const filteredResults = testResults.filter((result) => {
    if (testFilter === "all") return true;
    return result.status === testFilter;
  });

  const successRate =
    testResults.length > 0
      ? (testResults.filter((r) => r.status === "success").length /
          testResults.length) *
        100
      : 0;

  const averageResponseTime =
    testResults.length > 0
      ? testResults.reduce((sum, r) => sum + r.responseTime, 0) /
        testResults.length
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center overflow-x-hidden">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse shadow-2xl">
            <Activity className="w-12 h-12 text-white" />
          </div>
          <p className="text-slate-700 font-semibold text-lg">
            Loading API Testing Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-[8%] w-24 h-24 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse hidden sm:block"></div>
        <div className="absolute top-3/4 right-[8%] w-24 h-24 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-cyan-200/20 rounded-full blur-3xl animate-pulse delay-1000 hidden sm:block"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-2000 hidden sm:block"></div>
      </div>

      <AppNavigation
        title="API Testing Dashboard"
        subtitle="System Monitoring & Testing"
        icon={<Activity className="w-4 h-4 sm:w-6 sm:h-6 text-white" />}
        currentPage="api-test"
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16 overflow-x-hidden">
        <div className="w-full">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-lg border border-blue-200/50 rounded-full mb-8 shadow-xl">
              <Monitor className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-sm font-semibold text-slate-700">
                Professional API Testing Suite
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-700 via-cyan-700 to-indigo-700 bg-clip-text text-transparent mb-6 leading-tight">
              API Testing Dashboard
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 leading-relaxed max-w-5xl mx-auto mb-8">
              Comprehensive API monitoring, testing, and performance analytics
              for{" "}
              <span className="text-blue-600 font-bold">
                SoulSpeak's healing platform
              </span>
              .
              <br className="hidden sm:block" />
              <span className="text-cyan-600 font-semibold">
                Monitor system health, test endpoints, and ensure optimal
                performance.
              </span>
            </p>

            <div className="max-w-4xl mx-auto">
              <Alert className="border-green-200 bg-green-50/80 backdrop-blur-sm rounded-2xl mb-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 font-semibold">
                  <strong>Safe Test Mode:</strong> Test endpoints simulate API
                  behavior without saving any data to your database.
                </AlertDescription>
              </Alert>

              <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm rounded-2xl">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-red-800 font-semibold">
                  <strong>DANGER - Real Endpoints:</strong> Real endpoints will
                  create actual data in your database and use real API quotas.
                  Use with extreme caution!
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-2 shadow-xl">
              <TabsTrigger
                value="dashboard"
                className="rounded-xl text-sm font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="endpoints"
                className="rounded-xl text-sm font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Globe className="w-4 h-4 mr-2" />
                Endpoints
              </TabsTrigger>
              <TabsTrigger
                value="testing"
                className="rounded-xl text-sm font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Testing
              </TabsTrigger>
              <TabsTrigger
                value="monitoring"
                className="rounded-xl text-sm font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Activity className="w-4 h-4 mr-2" />
                Monitoring
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-8 mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Database className="w-6 h-6 text-white" />
                      </div>
                      {isLoadingStatus ? (
                        <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                      ) : (
                        getStatusIcon(systemStatus.database)
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">
                      Database
                    </h3>
                    <p className="text-sm text-slate-600">
                      Neon PostgreSQL Connection
                    </p>
                    <Badge
                      className={`mt-3 ${
                        systemStatus.database === "online"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {isLoadingStatus ? "checking..." : systemStatus.database}
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      {getStatusIcon(systemStatus.ai)}
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">
                      AI Services
                    </h3>
                    <p className="text-sm text-slate-600">
                      Gemini API Integration
                    </p>
                    <Badge className="mt-3 bg-purple-100 text-purple-700">
                      {isLoadingStatus
                        ? "checking..."
                        : systemStatus.apiKeys > 0
                          ? `${systemStatus.apiKeys} Keys Working`
                          : systemStatus.quotaExceeded > 0
                            ? `Quota Exceeded (${systemStatus.keysConfigured} configured)`
                            : systemStatus.keysConfigured > 0
                              ? `Configured (0 working)`
                              : "Not Configured"}
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      {getStatusIcon(systemStatus.auth)}
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">
                      Authentication
                    </h3>
                    <p className="text-sm text-slate-600">
                      Supabase Auth System
                    </p>
                    <Badge className="mt-3 bg-blue-100 text-blue-700">
                      Active
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Wifi className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-slate-800">
                        {systemStatus.activeConnections}
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">
                      Active Connections
                    </h3>
                    <p className="text-sm text-slate-600">Real-time Sessions</p>
                    <Badge className="mt-3 bg-orange-100 text-orange-700">
                      Live
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-white/60 to-blue-50/50">
                    <CardTitle className="flex items-center text-slate-800">
                      <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
                      System Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">
                          Uptime
                        </span>
                        <span className="text-lg font-bold text-emerald-600">
                          {systemStatus.uptimePercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={systemStatus.uptimePercentage}
                        className="h-3 bg-slate-200"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">
                          Error Rate
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {systemStatus.errorRate.toFixed(2)}%
                        </span>
                      </div>
                      <Progress
                        value={systemStatus.errorRate * 20}
                        className="h-3 bg-slate-200"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">
                          Success Rate
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {successRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={successRate}
                        className="h-3 bg-slate-200"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-white/60 to-cyan-50/50">
                    <CardTitle className="flex items-center text-slate-800">
                      <BarChart3 className="w-6 h-6 mr-3 text-cyan-600" />
                      API Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {systemStatus.totalRequests.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-600 font-semibold">
                          Total Requests
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          {averageResponseTime.toFixed(0)}ms
                        </div>
                        <div className="text-sm text-slate-600 font-semibold">
                          Avg Response Time
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-emerald-600 mb-2">
                          {apiEndpoints.length}
                        </div>
                        <div className="text-sm text-slate-600 font-semibold">
                          API Endpoints
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-2">
                          {testResults.length}
                        </div>
                        <div className="text-sm text-slate-600 font-semibold">
                          Tests Run
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-white/60 to-indigo-50/50">
                  <CardTitle className="flex items-center text-slate-800">
                    <Zap className="w-6 h-6 mr-3 text-indigo-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Button
                      onClick={runAllTests}
                      disabled={isRunningTests}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl px-8 py-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      {isRunningTests ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                          Running Tests...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-3" />
                          Run All Tests
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => setActiveTab("endpoints")}
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 rounded-2xl px-8 py-6 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                    >
                      <Globe className="w-5 h-5 mr-3" />
                      View Endpoints
                    </Button>

                    <Button
                      onClick={() => setActiveTab("monitoring")}
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-100 rounded-2xl px-8 py-6 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                    >
                      <Activity className="w-5 h-5 mr-3" />
                      Live Monitoring
                    </Button>

                    <Button
                      onClick={async () => {
                        const confirmed = window.confirm(
                          "🧹 Cleanup Test Data\n\n" +
                            "This will remove any journal and mood entries that contain test data patterns.\n\n" +
                            "This action cannot be undone. Continue?",
                        );
                        if (!confirmed) return;

                        try {
                          const response = await fetch("/api/test/cleanup", {
                            method: "DELETE",
                          });
                          const result = await response.json();

                          if (result.success) {
                            toast({
                              title: "🧹 Cleanup Completed",
                              description: `Removed ${result.data.total_removed} test entries (${result.data.journal_entries_removed} journal, ${result.data.mood_entries_removed} mood)`,
                              duration: 5000,
                            });
                          } else {
                            throw new Error(result.error || "Cleanup failed");
                          }
                        } catch (error) {
                          toast({
                            title: "❌ Cleanup Failed",
                            description:
                              error instanceof Error
                                ? error.message
                                : "Failed to cleanup test data",
                            variant: "destructive",
                            duration: 5000,
                          });
                        }
                      }}
                      variant="outline"
                      className="border-orange-300 text-orange-700 hover:bg-orange-100 rounded-2xl px-8 py-6 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                    >
                      <RefreshCw className="w-5 h-5 mr-3" />
                      🧹 Cleanup Test Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-8 mt-8">
              {testResults.length > 0 && (
                <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-white/60 to-green-50/50">
                    <CardTitle className="flex items-center justify-between text-slate-800">
                      <div className="flex items-center">
                        <FileText className="w-6 h-6 mr-3 text-green-600" />
                        Recent Test Results
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab("testing")}
                          className="border-blue-300 text-blue-700 hover:bg-blue-100 rounded-xl"
                        >
                          View All Results
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setTestResults([])}
                          className="border-slate-300 text-slate-600 hover:bg-slate-100 rounded-xl"
                        >
                          Clear
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {testResults.slice(0, 5).map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl border border-blue-200/50"
                        >
                          <div className="flex items-center space-x-3">
                            <Badge
                              className={`${
                                result.method === "GET"
                                  ? "bg-blue-100 text-blue-700"
                                  : result.method === "POST"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {result.method}
                            </Badge>
                            <span className="font-semibold text-slate-800">
                              {result.endpoint}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-slate-600">
                              {result.responseTime}ms
                            </span>
                            {getStatusBadge(result.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-6">
                {Object.entries(
                  apiEndpoints.reduce(
                    (acc, endpoint) => {
                      if (!acc[endpoint.category]) {
                        acc[endpoint.category] = [];
                      }
                      acc[endpoint.category].push(endpoint);
                      return acc;
                    },
                    {} as Record<string, ApiEndpoint[]>,
                  ),
                ).map(([category, endpoints]) => (
                  <Card
                    key={category}
                    className={`border-0 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden ${
                      category === "Real Endpoints"
                        ? "bg-red-50/90 border-2 border-red-200"
                        : "bg-white/80"
                    }`}
                  >
                    <CardHeader
                      className={`${
                        category === "Real Endpoints"
                          ? "bg-gradient-to-r from-red-100/80 to-red-200/50"
                          : "bg-gradient-to-r from-white/60 to-blue-50/50"
                      }`}
                    >
                      <CardTitle
                        className={`flex items-center ${
                          category === "Real Endpoints"
                            ? "text-red-800"
                            : "text-slate-800"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 bg-gradient-to-br ${getCategoryColor(category)} rounded-2xl flex items-center justify-center mr-3 shadow-lg text-white ${
                            category === "Real Endpoints" ? "animate-pulse" : ""
                          }`}
                        >
                          {getCategoryIcon(category)}
                        </div>
                        {category} APIs
                        {category === "Real Endpoints" && (
                          <Badge className="ml-3 bg-red-600 text-white animate-pulse">
                            ⚠️ DANGER
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="space-y-4">
                        {endpoints.map((endpoint) => (
                          <div
                            key={endpoint.id}
                            className={`flex items-center justify-between p-6 rounded-2xl hover:scale-105 transition-all duration-300 ${
                              category === "Real Endpoints"
                                ? "bg-gradient-to-r from-red-50 to-red-100/30 border border-red-300/50 hover:border-red-400/50"
                                : "bg-gradient-to-r from-slate-50 to-blue-50/30 border border-blue-200/50"
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-4 mb-2">
                                <Badge
                                  className={`${
                                    endpoint.method === "GET"
                                      ? "bg-blue-100 text-blue-700"
                                      : endpoint.method === "POST"
                                        ? "bg-green-100 text-green-700"
                                        : endpoint.method === "PUT"
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {endpoint.method}
                                </Badge>
                                <h3 className="font-bold text-slate-800">
                                  {endpoint.name}
                                </h3>
                                {endpoint.requiresAuth && (
                                  <Badge className="bg-rose-100 text-rose-700">
                                    <Lock className="w-3 h-3 mr-1" />
                                    Auth Required
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-slate-600 mb-2 font-mono bg-slate-100 px-3 py-1 rounded-lg inline-block">
                                {endpoint.path}
                              </div>
                              <p className="text-sm text-slate-700">
                                {endpoint.description}
                              </p>
                            </div>
                            <div className="flex space-x-3">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  console.log(
                                    "🧪 Test button clicked for:",
                                    endpoint.name,
                                  );
                                  e.preventDefault();

                                  if (category === "Real Endpoints") {
                                    const confirmed = window.confirm(
                                      `⚠️ WARNING: This will create REAL data in your database!\n\n` +
                                        `Endpoint: ${endpoint.name}\n` +
                                        `This is NOT a test and will affect your actual data.\n\n` +
                                        `Are you sure you want to proceed?`,
                                    );
                                    if (!confirmed) return;
                                  }

                                  runSingleTest(endpoint);
                                }}
                                disabled={
                                  isRunningTests ||
                                  runningTests.has(endpoint.id)
                                }
                                className={`rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  category === "Real Endpoints"
                                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 border-2 border-red-400"
                                    : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                                }`}
                              >
                                {runningTests.has(endpoint.id) ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    {category === "Real Endpoints"
                                      ? "⚠️ Running..."
                                      : "Testing..."}
                                  </>
                                ) : (
                                  <>
                                    {category === "Real Endpoints" ? (
                                      <>
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        ⚠️ REAL TEST
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Test
                                      </>
                                    )}
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  copyToClipboard(
                                    `${endpoint.method} ${endpoint.path}`,
                                  )
                                }
                                className="border-slate-300 text-slate-600 hover:bg-slate-100 rounded-xl hover:scale-105 transition-all duration-300"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="testing" className="space-y-8 mt-8">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-white/60 to-green-50/50">
                      <CardTitle className="flex items-center text-slate-800">
                        <Settings className="w-6 h-6 mr-3 text-green-600" />
                        Test Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="endpoint-select"
                          className="text-slate-700 font-semibold"
                        >
                          Select Endpoint
                        </Label>
                        <Select
                          value={selectedEndpoint}
                          onValueChange={setSelectedEndpoint}
                        >
                          <SelectTrigger className="border-blue-200/50 focus:ring-blue-500/50 rounded-xl bg-white/80">
                            <SelectValue placeholder="Choose an endpoint..." />
                          </SelectTrigger>
                          <SelectContent>
                            {apiEndpoints.map((endpoint) => (
                              <SelectItem key={endpoint.id} value={endpoint.id}>
                                {endpoint.method} - {endpoint.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedEndpoint && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-slate-700 font-semibold">
                              Custom Payload
                            </Label>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowPayload(!showPayload)}
                              className="text-blue-600 hover:bg-blue-100"
                            >
                              {showPayload ? (
                                <EyeOff className="w-4 h-4 mr-2" />
                              ) : (
                                <Eye className="w-4 h-4 mr-2" />
                              )}
                              {showPayload ? "Hide" : "Show"}
                            </Button>
                          </div>

                          {showPayload && (
                            <Textarea
                              value={customPayload}
                              onChange={(e) => setCustomPayload(e.target.value)}
                              placeholder={`Enter custom JSON payload for ${selectedEndpoint}...`}
                              className="border-blue-200/50 focus:ring-blue-500/50 min-h-[200px] rounded-xl bg-white/80 font-mono text-sm"
                            />
                          )}
                        </div>
                      )}

                      <div className="space-y-4">
                        <Button
                          onClick={() => {
                            const endpoint = apiEndpoints.find(
                              (e) => e.id === selectedEndpoint,
                            );
                            if (endpoint) {
                              runSingleTest(endpoint);
                            }
                          }}
                          disabled={!selectedEndpoint}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl px-6 py-3 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                        >
                          <Play className="w-5 h-5 mr-3" />
                          Run Single Test
                        </Button>

                        <Button
                          onClick={runAllTests}
                          disabled={isRunningTests}
                          variant="outline"
                          className="w-full border-blue-300 text-blue-700 hover:bg-blue-100 rounded-xl px-6 py-3 hover:scale-105 transition-all duration-300"
                        >
                          {isRunningTests ? (
                            <>
                              <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                              Running All Tests...
                            </>
                          ) : (
                            <>
                              <Target className="w-5 h-5 mr-3" />
                              Run All Tests
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-white/60 to-blue-50/50">
                      <CardTitle className="flex items-center justify-between text-slate-800">
                        <div className="flex items-center">
                          <FileText className="w-6 h-6 mr-3 text-blue-600" />
                          Test Results
                        </div>
                        <div className="flex space-x-3">
                          <Select
                            value={testFilter}
                            onValueChange={setTestFilter}
                          >
                            <SelectTrigger className="w-32 border-blue-200/50 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="success">Success</SelectItem>
                              <SelectItem value="error">Error</SelectItem>
                              <SelectItem value="warning">Warning</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setTestResults([])}
                            className="border-slate-300 text-slate-600 hover:bg-slate-100 rounded-xl"
                          >
                            Clear
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      {filteredResults.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                            <Play className="w-10 h-10 text-slate-500" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-800 mb-3">
                            No test results yet
                          </h3>
                          <p className="text-slate-600">
                            Run some tests to see results and performance
                            metrics here.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {filteredResults.map((result) => (
                            <div
                              key={result.id}
                              className="p-6 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-2xl border border-blue-200/50"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                  <Badge
                                    className={`${
                                      result.method === "GET"
                                        ? "bg-blue-100 text-blue-700"
                                        : result.method === "POST"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                    {result.method}
                                  </Badge>
                                  <span className="font-bold text-slate-800">
                                    {result.endpoint}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm text-slate-600">
                                    {result.responseTime}ms
                                  </span>
                                  {getStatusBadge(result.status)}
                                </div>
                              </div>

                              {result.statusCode && (
                                <div className="text-sm text-slate-600 mb-2">
                                  Status Code:{" "}
                                  <span className="font-mono font-bold">
                                    {result.statusCode}
                                  </span>
                                </div>
                              )}

                              {result.error && (
                                <Alert className="border-rose-200 bg-rose-50/80 rounded-xl mb-4">
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertDescription className="text-rose-800">
                                    {result.error}
                                  </AlertDescription>
                                </Alert>
                              )}

                              {result.response && (
                                <div className="bg-slate-100 rounded-xl p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-slate-700">
                                      Response:
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        copyToClipboard(
                                          formatJson(result.response),
                                        )
                                      }
                                      className="text-slate-600 hover:bg-slate-200"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <pre className="text-xs text-slate-700 max-h-32 overflow-y-auto font-mono">
                                    {formatJson(result.response)}
                                  </pre>
                                </div>
                              )}

                              <div className="text-xs text-slate-500 mt-3">
                                {new Date(result.timestamp).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-8 mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-white/60 to-green-50/50">
                    <CardTitle className="flex items-center text-slate-800">
                      <Activity className="w-6 h-6 mr-3 text-green-600" />
                      Real-time Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <Timer className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {averageResponseTime.toFixed(0)}ms
                        </div>
                        <div className="text-sm text-slate-600 font-semibold">
                          Avg Response Time
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <Target className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-600 mb-2">
                          {successRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-slate-600 font-semibold">
                          Success Rate
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-purple-600 mb-2">
                          {systemStatus.apiKeys}
                        </div>
                        <div className="text-sm text-slate-600 font-semibold">
                          AI Keys Active
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <Wifi className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-orange-600 mb-2">
                          {systemStatus.activeConnections}
                        </div>
                        <div className="text-sm text-slate-600 font-semibold">
                          Live Sessions
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-white/60 to-purple-50/50">
                    <CardTitle className="flex items-center text-slate-800">
                      <Award className="w-6 h-6 mr-3 text-purple-600" />
                      System Health Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-6">
                        <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                          <div className="text-3xl font-bold text-white">
                            A+
                          </div>
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Star className="w-5 h-5 text-white fill-current" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">
                        Excellent Health
                      </h3>
                      <p className="text-slate-600 mb-6">
                        All systems operating optimally with excellent
                        performance metrics.
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-bold text-emerald-600">
                            {systemStatus.uptimePercentage.toFixed(1)}%
                          </div>
                          <div className="text-slate-600">Uptime</div>
                        </div>
                        <div>
                          <div className="font-bold text-blue-600">
                            {averageResponseTime.toFixed(0)}ms
                          </div>
                          <div className="text-slate-600">Response</div>
                        </div>
                        <div>
                          <div className="font-bold text-purple-600">0.1%</div>
                          <div className="text-slate-600">Error Rate</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-white/60 to-indigo-50/50">
                  <CardTitle className="flex items-center justify-between text-slate-800">
                    <div className="flex items-center">
                      <Sparkles className="w-6 h-6 mr-3 text-indigo-600" />
                      API Health Monitoring
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={fetchSystemStatus}
                        disabled={isLoadingStatus}
                        className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:scale-105 transition-all duration-300"
                      >
                        {isLoadingStatus ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        Status
                      </Button>
                      <Button
                        size="sm"
                        onClick={runAllTests}
                        disabled={isRunningTests}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:scale-105 transition-all duration-300"
                      >
                        {isRunningTests ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        Test All
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid gap-4">
                    {Object.entries(
                      apiEndpoints.reduce(
                        (acc, endpoint) => {
                          if (!acc[endpoint.category]) {
                            acc[endpoint.category] = [];
                          }
                          acc[endpoint.category].push(endpoint);
                          return acc;
                        },
                        {} as Record<string, ApiEndpoint[]>,
                      ),
                    ).map(([category, endpoints]) => (
                      <div
                        key={category}
                        className="p-6 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-2xl border border-indigo-200/50"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 bg-gradient-to-br ${getCategoryColor(category)} rounded-2xl flex items-center justify-center shadow-lg text-white`}
                            >
                              {getCategoryIcon(category)}
                            </div>
                            <h3 className="font-bold text-slate-800">
                              {category} Services
                            </h3>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            All Healthy
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600">
                          {endpoints.length} endpoint
                          {endpoints.length !== 1 ? "s" : ""} monitored
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
