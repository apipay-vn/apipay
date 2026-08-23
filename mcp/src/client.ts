export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public body: any,
  ) {
    const msg =
      typeof body?.message === "string"
        ? body.message
        : typeof body?.data?.message === "string"
          ? body.data.message
          : typeof body?.error === "string"
            ? body.error
            : `API request failed with status ${statusCode}`;
    super(msg);
    this.name = "ApiError";
  }
}

export class CredentialsError extends Error {
  constructor(
    message = "ApiPay API credentials are required. Set APIPAY_ACCESS_KEY and APIPAY_SECRET_KEY environment variables or configure via ~/.config/apipay/config.json.",
  ) {
    super(message);
    this.name = "CredentialsError";
  }
}

export interface RequestOptions {
  body?: any;
  auth?: boolean;
  retries?: number;
  query?: Record<string, any>;
}

export class ApiClient {
  private baseUrl: string;
  private accessKey?: string;
  private secretKey?: string;

  constructor(options: { baseUrl: string; accessKey?: string; secretKey?: string }) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.accessKey = options.accessKey;
    this.secretKey = options.secretKey;
  }

  hasCredentials(): boolean {
    return !!(this.accessKey && this.secretKey);
  }

  getAccessKeyPrefix(): string | undefined {
    if (!this.accessKey) return undefined;
    if (this.accessKey.startsWith("ak_test_")) return "ak_test_";
    if (this.accessKey.startsWith("ak_live_")) return "ak_live_";
    return this.accessKey.slice(0, 8);
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  private buildUrl(path: string, query?: Record<string, any>): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${normalizedPath}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          for (const item of value) {
            if (item !== undefined && item !== null) {
              url.searchParams.append(key, String(item));
            }
          }
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private getHeaders(auth = true, hasBody = false): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (hasBody) {
      headers["Content-Type"] = "application/json";
    }

    if (auth) {
      if (!this.accessKey || !this.secretKey) {
        throw new CredentialsError();
      }
      const encoded = Buffer.from(`${this.accessKey}:${this.secretKey}`).toString("base64");
      headers["Authorization"] = `Bearer ${encoded}`;
    }

    return headers;
  }

  async request<T = any>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { body, auth = true, retries = 3, query } = options;
    const url = this.buildUrl(path, query);

    if (auth && !this.hasCredentials()) {
      throw new CredentialsError();
    }

    let lastError: Error | null = null;
    const retryDelayMs = 1000;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const headers = this.getHeaders(auth, !!body);
        const res = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });

        let json: any = null;
        const text = await res.text();
        if (text) {
          try {
            json = JSON.parse(text);
          } catch {
            json = { message: text };
          }
        }

        if (!res.ok) {
          throw new ApiError(res.status, json);
        }

        return (json?.data !== undefined ? json.data : json) as T;
      } catch (error) {
        lastError = error as Error;

        if (error instanceof CredentialsError) {
          throw error;
        }

        if (error instanceof ApiError) {
          if (
            error.statusCode >= 400 &&
            error.statusCode < 500 &&
            error.statusCode !== 429
          ) {
            throw error;
          }
        }

        if (attempt < retries) {
          const delay = retryDelayMs * Math.pow(2, attempt);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    throw lastError ?? new Error("Request failed");
  }

  get<T = any>(path: string, options: Omit<RequestOptions, "body"> = {}) {
    return this.request<T>("GET", path, options);
  }

  post<T = any>(path: string, body?: any, options: Omit<RequestOptions, "body"> = {}) {
    return this.request<T>("POST", path, { ...options, body });
  }

  patch<T = any>(path: string, body?: any, options: Omit<RequestOptions, "body"> = {}) {
    return this.request<T>("PATCH", path, { ...options, body });
  }

  delete<T = any>(path: string, options: Omit<RequestOptions, "body"> = {}) {
    return this.request<T>("DELETE", path, options);
  }
}
