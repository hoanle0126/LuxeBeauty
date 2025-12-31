import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, "id" | "role">) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user từ localStorage khi app khởi động
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Giả lập API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check nếu password là admin
    const isAdminLogin = password === "12345678";

    // Mock user data
    const mockUser: User = {
      id: isAdminLogin ? 999 : 1,
      fullName: isAdminLogin ? "Admin" : "Lê Văn Xuân Hoàn",
      email: email,
      phone: isAdminLogin ? "0900000000" : "0912345678",
      avatar: isAdminLogin 
        ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
        : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      role: isAdminLogin ? "admin" : "user",
    };

    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
  };

  const register = async (userData: Omit<User, "id" | "role">) => {
    // Giả lập API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock user data with generated ID
    const newUser: User = {
      id: Date.now(),
      ...userData,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.fullName}`,
      role: "user",
    };

    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

