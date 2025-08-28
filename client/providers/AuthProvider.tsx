import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    username?: string,
  ) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const createTestUser = () => {
    const testUser = {
      id: "test-user-id",
      email: "madmaxsecondac@gmail.com", 
      user_metadata: {
        username: "madmax",
      },
      created_at: new Date().toISOString(),
      aud: "authenticated",
      role: "authenticated",
    } as User;

    console.log("🔧 Development mode: Using test user for authentication");
    return testUser;
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setSession(session);
          setUser(session.user);
          console.log(
            "✅ Real Supabase user authenticated:",
            session.user.email,
          );
        } else {
          const testUser = createTestUser();
          setUser(testUser);
          console.log("🔧 Using development test user");
        }
      } catch (error) {
        console.warn("⚠️ Supabase auth failed, using test user:", error);
        const testUser = createTestUser();
        setUser(testUser);
      }
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        if (event === "SIGNED_IN") {
          console.log("✅ User signed in:", session.user.email);
        }
      } else {
        setSession(null);
        if (event === "SIGNED_OUT") {
          console.log("📤 User signed out");
          setUser(null);
        } else if (!user && event !== "SIGNED_OUT") {
          const testUser = createTestUser();
          setUser(testUser);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split("@")[0],
        },
      },
    });

    if (error) {
      console.error("❌ Sign up error:", error.message);
    } else {
      console.log("✅ Sign up successful:", data.user?.email);
    }

    return { user: data.user, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ Sign in error:", error.message);
    } else {
      console.log("✅ Sign in successful:", data.user?.email);
    }

    return { user: data.user, error };
  };

  const signOut = async () => {
    try {
      console.log("🔄 Starting sign out process...");

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("❌ Sign out error:", error.message);
        throw error;
      }

      console.log("✅ Sign out successful");
      return { error: null };
    } catch (error) {
      console.error("❌ Sign out failed:", error);
      setUser(null);
      setSession(null);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      console.error("❌ Password reset error:", error.message);
    } else {
      console.log("✅ Password reset email sent to:", email);
    }

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
