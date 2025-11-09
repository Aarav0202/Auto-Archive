"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
  role: string;
  name?: string;
  dealershipId?: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/auth/checkToken", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setUser(data.user); 
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    checkAuth();
  }, [pathname]);

  // ✅ Login function
  const login = async (data: { email: string; password: string; role?: string }) => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(`Login failed: ${result.message}`);
        return;
      }

      setIsLoggedIn(true);
      setUser(result.user);

      toast.success("Login successful!");

      // Redirect by role
      if (result.user?.role === "carDealership") {
        router.push("/dealership/home");
      } else if (result.user?.role === "customer") {
        router.push("/customer/home");
      } else {
        router.push("/home");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login error");
    }
  };
//  ---- REGISTER ----
  const register = async (data: any) => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(`Registration failed: ${result.message}`);
        return;
      }

      toast.success("Registration successful!");
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("An error occurred during registration.");
    }
  };

  // ✅ Logout function
  const logout = async () => {
    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setIsLoggedIn(false);
      setUser(null);

      router.push("/");
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// -----------------
// Custom hook
// -----------------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
};
