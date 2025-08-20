import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  signIn: (email: string, password: string) => Promise<{ error?: string } | void>;
  signUp: (email: string, password: string) => Promise<{ error?: string } | void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial session fetch
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = (() => {
        const u = data.session?.user ?? null;
        // Overlay locally stored metadata so sidebar/profile show your custom name immediately
        try {
          const stored = localStorage.getItem("anantya-user-meta");
          if (u && stored) {
            const meta = JSON.parse(stored);
            return { ...u, user_metadata: { ...(u.user_metadata || {}), ...meta } };
          }
        } catch {}
        return u;
      })();
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      if (!currentUser) {
        navigate("/login");
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    console.log("🔐 Attempting to sign in with:", { email });
    console.log("🔐 Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
    console.log("🔐 Supabase Key exists:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log("🔐 Sign in result:", { data, error });
      
      if (error) {
        console.error("🔐 Sign in error:", error);
        return { error: error.message };
      }
      
      console.log("🔐 Sign in successful:", data.user);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("🔐 Sign in exception:", err);
      return { error: "An unexpected error occurred" };
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    setUser(data.user);
    setIsAuthenticated(true);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
