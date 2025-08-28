import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { Heart, ArrowLeft, Mail } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address");
      setIsSubmitting(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    try {
      const { error: resetError } = await resetPassword(email);

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(
          "Password reset instructions have been sent to your email address. Please check your inbox and follow the instructions to reset your password.",
        );
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Reset password error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Button
          variant="ghost"
          className="text-soul-deep hover:bg-white/20"
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-healing-lavender to-soul-glow rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-soul-deep">
                Reset Your Password
              </CardTitle>
              <p className="text-soul-deep/70 mt-2">
                Enter your email address and we'll send you instructions to
                reset your password
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-destructive/30 bg-destructive/10">
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-healing-sage/30 bg-healing-sage/10">
                  <AlertDescription className="text-healing-sage">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-soul-deep font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                      if (success) setSuccess("");
                    }}
                    placeholder="Enter your email address"
                    className="bg-white/50 border-soul-deep/20 focus:border-healing-ocean"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-soul-deep to-healing-ocean hover:from-soul-deep/90 hover:to-healing-ocean/90 text-white py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    "Sending Instructions..."
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Send Reset Instructions
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center space-y-2">
                <Link
                  to="/login"
                  className="inline-flex items-center text-healing-ocean hover:underline text-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Sign In
                </Link>
              </div>

              <div className="text-center text-sm text-soul-deep/60">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-healing-ocean hover:underline font-medium"
                >
                  Create your account
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
