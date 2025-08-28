import { Heart, Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-light via-healing-moonlight to-soul-mist">
      <nav className="flex items-center justify-between px-6 py-4 backdrop-blur-sm bg-white/10 border-b border-white/20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-healing-lavender to-soul-glow rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-soul-deep to-healing-ocean bg-clip-text text-transparent">
            SoulSpeak
          </span>
        </div>
        <Link to="/">
          <Button variant="ghost" className="text-soul-deep hover:bg-white/20">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </Link>
      </nav>

      <div className="container mx-auto px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-xl">
            <CardContent className="p-12">
              <div className="w-20 h-20 bg-gradient-to-br from-healing-lavender to-soul-glow rounded-full flex items-center justify-center mx-auto mb-8">
                <Heart className="w-10 h-10 text-white animate-pulse" />
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-soul-deep to-healing-ocean bg-clip-text text-transparent mb-4">
                404
              </h1>

              <h2 className="text-2xl font-semibold text-soul-deep mb-4">
                This path doesn't exist
              </h2>

              <p className="text-lg text-soul-deep/70 leading-relaxed mb-8">
                Sometimes we wander off the path, and that's okay. Let's guide
                you back to your safe space for healing and reflection.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button className="bg-gradient-to-r from-soul-deep to-healing-ocean hover:from-soul-deep/90 hover:to-healing-ocean/90 text-white">
                    <Home className="w-4 h-4 mr-2" />
                    Return Home
                  </Button>
                </Link>
                <Link to="/journal">
                  <Button
                    variant="outline"
                    className="border-soul-deep/30 text-soul-deep hover:bg-soul-deep/10"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Start Journaling
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
