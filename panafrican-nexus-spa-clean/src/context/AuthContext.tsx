// Contexte React d'authentification (utilisateur connecté + login/logout)

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { tokenStorage } from "../services/tokenStorage";
import type { LoginRequest, UserDto } from "../types/auth";

interface AuthContextValue {
  user: UserDto | null;
  loading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const refreshMe = useCallback(async () => {
    if (!tokenStorage.getAccess()) {
      setUser(null);
      return;
    }
    try {
      const me = await authService.me();
      setUser(me);
    } catch {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  // Chargement initial : vérifie si un token valide existe
  useEffect(() => {
    refreshMe().finally(() => setLoading(false));
  }, [refreshMe]);

  // Écoute l'événement émis par http.ts quand les deux tokens sont expirés
  useEffect(() => {
    const onSessionExpired = () => {
      setUser(null);
      tokenStorage.clear();

      // Évite de rediriger si déjà sur la page de login
      if (!window.location.pathname.startsWith("/login")) {
        navigate("/login?expired=1", { replace: true });
      }
    };

    window.addEventListener("auth:session-expired", onSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", onSessionExpired);
    };
  }, [navigate]);

  const login = useCallback(
    async (payload: LoginRequest) => {
      await authService.login(payload);
      await refreshMe();
    },
    [refreshMe],
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    navigate("/", { replace: true });
  }, [navigate]);

  const hasRole = useCallback(
    (role: string) => !!user?.roles?.includes(role as any),
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshMe, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
