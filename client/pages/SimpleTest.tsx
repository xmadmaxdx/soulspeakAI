import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import {
  Activity,
  ArrowRight,
  Monitor,
  Database,
  Brain,
  Shield,
  Zap,
  CheckCircle,
  Star,
  Globe,
  BarChart3,
  Settings,
  Target,
  Award,
  Sparkles,
  Heart,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function SimpleTest() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const features = [
    {
      icon: <Database className="w-10 h-10 text-white" />,
      title: "System Health Monitoring",
      description:
        "Real-time monitoring of database connections, API services, and authentication systems with comprehensive health checks.",
      gradient: "from-blue-500 to-cyan-600",
      stats: "Real-time monitoring",
    },
    {
      icon: <Brain className="w-10 h-10 text-white" />,
      title: "AI Service Testing",
      description:
        "Test all AI companion endpoints, Gemini API integration, and validate AI responses with performance metrics.",
      gradient: "from-purple-500 to-violet-600",
      stats: "4 AI Keys managed",
    },
    {
      icon: <Shield className="w-10 h-10 text-white" />,
      title: "Comprehensive API Testing",
      description:
        "Full endpoint testing suite for Journal, Mood, User, and Authentication APIs with detailed response analysis.",
      gradient: "from-emerald-500 to-green-600",
      stats: "8+ endpoints tested",
    },
  ];

  const benefits = [
    "Real-time system health monitoring with live metrics",
    "Comprehensive API endpoint testing and validation",
    "AI service performance monitoring and key rotation tracking",
    "Database connection and authentication status monitoring",
    "Response time analysis and performance optimization insights",
    "Error tracking and debugging capabilities with detailed logs",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-[8%] w-24 h-24 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse hidden sm:block"></div>
        <div className="absolute top-3/4 right-[8%] w-24 h-24 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-cyan-200/20 rounded-full blur-3xl animate-pulse delay-1000 hidden sm:block"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-2000 hidden sm:block"></div>
      </div>

      <nav className="relative z-10 flex items-center justify-between px-3 sm:px-6 lg:px-8 py-3 sm:py-5 backdrop-blur-xl bg-white/70 border-b border-blue-200/50 shadow-xl">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
            <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-sm" />
          </div>
          <div>
            <span className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent">
              API Testing Dashboard
            </span>
            <div className="text-xs text-slate-500 font-semibold hidden sm:block">
              Professional System Monitoring
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-700 hover:bg-blue-100 backdrop-blur-sm transition-all duration-300 rounded-2xl hover:scale-105 shadow-sm hover:shadow-lg border border-blue-200/50"
            onClick={() => handleNavigation("/")}
          >
            <Heart className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">SoulSpeak</span>
          </Button>
          {user && (
            <Button
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-2xl hover:shadow-3xl rounded-2xl hover:scale-105 transition-all duration-300"
              onClick={() => handleNavigation("/api-test")}
            >
              <Monitor className="w-4 h-4 mr-2" />
              Full Dashboard
            </Button>
          )}
        </div>
      </nav>

      <div className="relative z-10 w-full overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center relative">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap justify-center items-center gap-4 mb-12">
              <Badge
                variant="secondary"
                className="bg-white/70 backdrop-blur-sm border-0 text-slate-700 shadow-lg"
              >
                <Shield className="w-3 h-3 mr-1" />
                Enterprise Grade
              </Badge>
              <Badge
                variant="secondary"
                className="bg-white/70 backdrop-blur-sm border-0 text-slate-700 shadow-lg"
              >
                <Star className="w-3 h-3 mr-1 fill-current" />
                Real-time Monitoring
              </Badge>
              <Badge
                variant="secondary"
                className="bg-white/70 backdrop-blur-sm border-0 text-slate-700 shadow-lg"
              >
                <Zap className="w-3 h-3 mr-1" />
                High Performance
              </Badge>
            </div>

            <div className="inline-flex items-center px-8 py-4 bg-white/70 backdrop-blur-lg border border-blue-200/50 rounded-full mb-12 shadow-2xl hover:scale-105 transition-all duration-300">
              <Monitor className="w-6 h-6 text-blue-600 mr-4" />
              <span className="text-slate-800 font-bold text-lg">
                Professional API Testing Suite
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-8 sm:mb-12">
              <span className="bg-gradient-to-r from-blue-700 via-cyan-700 to-indigo-700 bg-clip-text text-transparent">
                Open API Testing
              </span>
              <br />
              <span className="text-slate-800">Dashboard</span>
            </h1>

            <p className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl text-slate-600 leading-relaxed mb-8 sm:mb-16 max-w-6xl mx-auto px-4">
              Comprehensive API monitoring and testing platform for{" "}
              <span className="text-blue-600 font-bold">
                SoulSpeak's healing ecosystem
              </span>{" "}
              with real-time performance analytics, system health monitoring,
              and automated testing capabilities.
              <br className="hidden lg:block" />
              <span className="text-cyan-600 font-semibold">
                Monitor, test, and optimize with professional-grade tools.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20">
              <Button
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-12 py-6 text-2xl shadow-2xl transform transition-all hover:scale-110 active:scale-95 rounded-3xl group"
                onClick={() => handleNavigation("/api-test")}
              >
                <Activity className="w-7 h-7 mr-4 group-hover:scale-125 transition-transform" />
                Launch Dashboard
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100 px-12 py-6 text-2xl backdrop-blur-sm rounded-3xl hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                onClick={() => handleNavigation("/")}
              >
                <Heart className="w-6 h-6 mr-3" />
                Back to SoulSpeak
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 py-28 lg:py-36 bg-white/50 backdrop-blur-sm overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-lg border border-blue-200/50 rounded-full mb-8 shadow-xl">
              <Sparkles className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-sm font-bold text-slate-700">
                Professional Features
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-6 sm:mb-8">
              Why Choose Our API Testing Platform
            </h2>
            <p className="text-2xl sm:text-3xl text-slate-600 max-w-5xl mx-auto leading-relaxed">
              This isn't just testing—it's{" "}
              <span className="text-blue-600 font-bold">
                comprehensive system monitoring
              </span>
              , designed for mission-critical applications with real-time
              insights.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-3xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden hover:scale-105 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none"></div>
                <CardContent className="p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 text-center relative">
                  <div
                    className={`w-24 h-24 bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center mx-auto mb-10 group-hover:scale-110 transition-transform duration-300 shadow-2xl`}
                  >
                    {feature.icon}
                  </div>
                  <Badge
                    variant="secondary"
                    className="mb-6 bg-blue-100 text-blue-700 border-0 font-bold text-sm"
                  >
                    {feature.stats}
                  </Badge>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 sm:mb-8">
                    {feature.title}
                  </h3>
                  <p className="text-slate-700 leading-relaxed text-xl">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 py-28 lg:py-36 overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-lg border border-blue-200/50 rounded-full mb-8 shadow-xl">
                  <Award className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm font-bold text-slate-700">
                    Professional Benefits
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-6 sm:mb-10">
                  Enterprise-Grade API Monitoring
                </h2>
                <p className="text-xl text-slate-700 leading-relaxed mb-10">
                  Our API testing dashboard combines advanced monitoring
                  capabilities with intuitive design. Perfect for developers,
                  DevOps teams, and system administrators who demand
                  <span className="text-blue-600 font-bold">
                    {" "}
                    reliable and comprehensive insights
                  </span>
                  .
                </p>
                <div className="space-y-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-xl">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-slate-700 leading-relaxed text-lg">
                        {benefit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                  <CardContent className="p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16">
                    <div className="text-center space-y-8">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                        <Monitor className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-slate-800">
                        Ready to Monitor?
                      </h3>
                      <p className="text-slate-700 leading-relaxed text-lg">
                        Experience comprehensive API monitoring with real-time
                        insights, performance analytics, and system health
                        tracking.
                      </p>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-white/80 rounded-2xl shadow-lg">
                          <span className="text-slate-700 font-bold">
                            Setup Time
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-700 border-0 font-bold"
                          >
                            Instant
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-6 bg-white/80 rounded-2xl shadow-lg">
                          <span className="text-slate-700 font-bold">
                            Real-time Data
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-700 border-0 font-bold"
                          >
                            Live
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-6 bg-white/80 rounded-2xl shadow-lg">
                          <span className="text-slate-700 font-bold">
                            Professional Grade
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-purple-100 text-purple-700 border-0 font-bold"
                          >
                            Enterprise
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 py-28 lg:py-36 bg-gradient-to-br from-blue-600 to-cyan-700 overflow-x-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="max-w-5xl mx-auto">
            <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-12 shadow-2xl">
              <Activity className="w-16 h-16 text-white" />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8 sm:mb-12 leading-tight">
              Launch Your
              <br />
              <span className="text-cyan-300">API Monitoring Experience</span>
            </h2>

            <p className="text-2xl sm:text-3xl text-white/90 mb-16 leading-relaxed max-w-4xl mx-auto">
              Join the next generation of API monitoring with comprehensive
              testing, real-time insights, and enterprise-grade reliability.
              <span className="text-cyan-300 font-bold">
                Your system's performance starts here.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <Button
                className="bg-white text-slate-800 hover:bg-white/90 px-8 sm:px-16 py-4 sm:py-8 text-lg sm:text-2xl font-bold shadow-2xl transform transition-all hover:scale-110 active:scale-95 rounded-2xl sm:rounded-3xl group"
                onClick={() => handleNavigation("/api-test")}
              >
                <Monitor className="w-8 h-8 mr-4 group-hover:scale-125 transition-transform" />
                Open Full Dashboard
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="text-white/90 text-base">
                <div className="flex items-center justify-center space-x-6">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Secure</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 mr-2 fill-current" />
                    <span className="font-semibold">Real-time</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Professional</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
