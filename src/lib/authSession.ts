import axios, { type AxiosRequestConfig } from "axios";

type RefreshResponse = {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
  };
};

export type AuthenticatedRequestConfig = AxiosRequestConfig & {
  skipAuthRefresh?: boolean;
};

let refreshAccessTokenRequest: Promise<string | null> | null = null;

export function resolveApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
}

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

export function storeSessionTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
}

export function clearSessionTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function notifySessionExpired() {
  clearSessionTokens();
  window.dispatchEvent(new Event("auth-session-expired"));
}

export async function refreshAccessToken() {
  if (refreshAccessTokenRequest) {
    return refreshAccessTokenRequest;
  }

  refreshAccessTokenRequest = (async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      notifySessionExpired();
      return null;
    }

    try {
      const response = await axios.post<RefreshResponse>(
        `${resolveApiBaseUrl()}/auth/refresh-token`,
        {
          refresh_token: refreshToken,
        },
      );
      const {
        access_token: accessToken,
        refresh_token: nextRefreshToken,
      } = response.data.data;

      storeSessionTokens(accessToken, nextRefreshToken);
      return accessToken;
    } catch {
      notifySessionExpired();
      return null;
    } finally {
      refreshAccessTokenRequest = null;
    }
  })();

  return refreshAccessTokenRequest;
}

export async function authenticatedRequest<TResponse>(
  config: AuthenticatedRequestConfig,
) {
  const accessToken = getAccessToken();

  try {
    return await axios.request<TResponse>({
      baseURL: resolveApiBaseUrl(),
      ...config,
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...config.headers,
      },
    });
  } catch (error) {
    const shouldTryRefresh =
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !config.skipAuthRefresh &&
      Boolean(getRefreshToken());

    if (!shouldTryRefresh) {
      throw error;
    }

    const nextAccessToken = await refreshAccessToken();

    if (!nextAccessToken) {
      throw error;
    }

    return axios.request<TResponse>({
      baseURL: resolveApiBaseUrl(),
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${nextAccessToken}`,
      },
    });
  }
}
