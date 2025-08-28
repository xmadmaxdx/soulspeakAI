import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Journal from "./pages/Journal";
import Profile from "./pages/Profile";
import MyEntries from "./pages/MyEntries";
import MoodTracker from "./pages/MoodTracker";
import Companion from "./pages/Companion";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import ApiTest from "./pages/ApiTest";
import SimpleTest from "./pages/SimpleTest";
import { AuthProvider } from "./providers/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-entries" element={<MyEntries />} />
          <Route path="/mood-tracker" element={<MoodTracker />} />
          <Route path="/companion" element={<Companion />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="/simple-test" element={<SimpleTest />} />
          <Route
            path="/learn-more"
            element={
              <Placeholder
                title="Discover the Science of Healing"
                description="Learn how SoulSpeak combines cutting-edge AI with therapeutic principles to support your emotional wellbeing."
                feature="detailed information"
              />
            }
          />
          <Route
            path="/privacy"
            element={
              <Placeholder
                title="Your Privacy is Sacred"
                description="Learn how we protect your most intimate thoughts with military-grade encryption and privacy-first design."
                feature="privacy policy"
              />
            }
          />
          <Route
            path="/terms"
            element={
              <Placeholder
                title="Terms of Service"
                description="Understanding our commitment to your safety, privacy, and healing journey."
                feature="terms of service"
              />
            }
          />
          <Route
            path="/support"
            element={
              <Placeholder
                title="We're Here for You"
                description="Get help, share feedback, or connect with our caring support team."
                feature="customer support"
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
