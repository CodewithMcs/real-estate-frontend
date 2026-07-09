"use client";

import axios from "axios";
import {
  authenticatedRequest,
  clearSessionTokens,
  getAccessToken,
  getRefreshToken,
  refreshAccessToken,
  resolveApiBaseUrl,
  storeSessionTokens,
} from "@/lib/authSession";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type User = {
  id: string;
  role_id?: number;
  first_name?: string;
  last_name?: string | null;
  display_name?: string | null;
  email?: string;
  phone?: string;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
};

type AuthResponse = {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
  };
};

type MeResponse = {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function createDeviceMetadata() {
  const userAgent = navigator.userAgent;

  return {
    browser: userAgent.slice(0, 100),
    device_name: navigator.platform.slice(0, 100),
    device_type: /Mobi|Android/i.test(userAgent)
      ? "mobile"
      : "desktop",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  async function loadAuthenticatedUser(accessToken: string) {
    const response = await authenticatedRequest<MeResponse>({
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "GET",
      url: "/auth/me",
    });

    setUser(response.data.data.user);
  }

  function clearSession() {
    clearSessionTokens();
    setUser(null);
  }

  useEffect(() => {
    async function restoreUserSession() {
      let accessToken = getAccessToken();

      if (!accessToken) {
        accessToken = await refreshAccessToken();

        if (!accessToken) {
          setIsLoading(false);
          return;
        }
      }

      try {
        await loadAuthenticatedUser(accessToken);
      } catch {
        accessToken = await refreshAccessToken();

        if (accessToken) {
          await loadAuthenticatedUser(accessToken);
        } else {
          clearSession();
        }
      } finally {
        setIsLoading(false);
      }
    }

    void restoreUserSession();
  }, []);

  useEffect(() => {
    function handleSessionExpired() {
      setUser(null);

      if (pathname.startsWith("/profile") || pathname.startsWith("/recent-activity")) {
        router.push("/");
      }
    }

    window.addEventListener("auth-session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("auth-session-expired", handleSessionExpired);
    };
  }, [pathname, router]);

  async function login(data: LoginData) {
    const response = await axios.post<AuthResponse>(
      `${resolveApiBaseUrl()}/auth/login`,
      {
        ...data,
        ...createDeviceMetadata(),
      },
    );
    const { access_token: accessToken, refresh_token: refreshToken } =
      response.data.data;

    storeSessionTokens(accessToken, refreshToken);
    await loadAuthenticatedUser(accessToken);
    router.push("/");
  }

  async function register(data: RegisterData) {
    const response = await axios.post<AuthResponse>(
      `${resolveApiBaseUrl()}/auth/register`,
      {
        ...data,
        ...createDeviceMetadata(),
      },
    );
    const { access_token: accessToken, refresh_token: refreshToken } =
      response.data.data;

    storeSessionTokens(accessToken, refreshToken);
    await loadAuthenticatedUser(accessToken);
    router.push("/");
  }

  async function logout() {
    let accessToken = getAccessToken();
    let refreshToken = getRefreshToken();

    try {
      if (!accessToken && refreshToken) {
        accessToken = await refreshAccessToken();
        refreshToken = getRefreshToken();
      }

      if (accessToken && refreshToken) {
        try {
          await axios.post(
            `${resolveApiBaseUrl()}/auth/logout`,
            { refresh_token: refreshToken },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );
        } catch (error) {
          if (!axios.isAxiosError(error) || error.response?.status !== 401) {
            throw error;
          }

          accessToken = await refreshAccessToken();
          refreshToken = getRefreshToken();

          if (!accessToken || !refreshToken) {
            return;
          }

          await axios.post(
            `${resolveApiBaseUrl()}/auth/logout`,
            { refresh_token: refreshToken },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );
        }
      } else if (accessToken) {
        await axios.post(
          `${resolveApiBaseUrl()}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
      }
    } finally {
      clearSession();

      if (pathname.startsWith("/profile") || pathname.startsWith("/recent-activity")) {
        router.push("/");
      }
    }
  }

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
