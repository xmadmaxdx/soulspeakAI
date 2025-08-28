import { Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

interface PlaceholderProps {
  title: string;
  description: string;
  feature: string;
}

export default function Placeholder({
  title,
  description,
  feature,
}: PlaceholderProps) {
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
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
        </Link>
      </nav>

      <div className="container mx-auto px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-xl">
            <CardContent className="p-12">
              <div className="w-20 h-20 bg-gradient-to-br from-healing-lavender to-soul-glow rounded-full flex items-center justify-center mx-auto mb-8">
                <Heart className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-soul-deep to-healing-ocean bg-clip-text text-transparent mb-4">
                {title}
              </h1>

              <p className="text-xl text-soul-deep/70 leading-relaxed mb-8">
                {description}
              </p>

              <div className="bg-soul-mist/50 rounded-lg p-6 mb-8">
                <p className="text-soul-deep/80 font-medium">
                  The {feature} feature is coming soon! We're crafting this
                  experience with the same care and empathy that defines
                  SoulSpeak.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/journal">
                  <Button className="bg-gradient-to-r from-soul-deep to-healing-ocean hover:from-soul-deep/90 hover:to-healing-ocean/90 text-white">
                    <Heart className="w-4 h-4 mr-2" />
                    Start Journaling
                  </Button>
                </Link>
                <Link to="/">
                  <Button
                    variant="outline"
                    className="border-soul-deep/30 text-soul-deep hover:bg-soul-deep/10"
                  >
                    Back to Home
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
