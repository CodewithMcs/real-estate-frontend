"use client";

import { authenticatedRequest } from "@/lib/authSession";
import axios, { type AxiosRequestConfig, type Method } from "axios";
import { useCallback, useEffect, useState } from "react";

type ApiRequestOptions<TBody = unknown> = {
  url: string;
  method?: Method;
  data?: TBody;
  config?: AxiosRequestConfig;
};

type UseApiOptions<TBody = unknown> = ApiRequestOptions<TBody> & {
  immediate?: boolean;
};

type ApiError = {
  message: string;
  status?: number;
};

export function useApi<TResponse = unknown, TBody = unknown>(
  initialRequest?: UseApiOptions<TBody>,
) {
  const [response, setResponse] = useState<TResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(initialRequest?.immediate));
  const [hasLoaded, setHasLoaded] = useState(false);

  const request = useCallback(
    async ({
      url,
      method = "GET",
      data,
      config,
    }: ApiRequestOptions<TBody>) => {
      setIsLoading(true);
      setError(null);
      setHasLoaded(false);

      try {
        const result = await authenticatedRequest<TResponse>({
          url,
          method,
          data,
          ...config,
        });

        setResponse(result.data);
        return result.data;
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message ?? err.message
          : "Something went wrong.";
        const status = axios.isAxiosError(err) ? err.response?.status : undefined;
        const apiError = { message, status };

        setError(apiError);
        return null;
      } finally {
        setIsLoading(false);
        setHasLoaded(true);
      }
    },
    [],
  );

  useEffect(() => {
    if (!initialRequest?.immediate) {
      return;
    }

    queueMicrotask(() => {
      void request({
        config: initialRequest.config,
        data: initialRequest.data,
        method: initialRequest.method,
        url: initialRequest.url,
      });
    });
  }, [
    initialRequest?.config,
    initialRequest?.data,
    initialRequest?.immediate,
    initialRequest?.method,
    initialRequest?.url,
    request,
  ]);

  return {
    response,
    error,
    isLoading,
    hasLoaded,
    request,
  };
}
