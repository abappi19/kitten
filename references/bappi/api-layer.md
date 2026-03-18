---
title: Bappi's API Layer
description: Custom FetchClient class with automatic token injection, 401/403 refresh intercept, exponential backoff, response parsing, and endpoint constant structure. Also covers the Axios apiClient pattern used in older projects.
type: reference
---

# Bappi's API Layer

## Core Principle

Screens never touch transport. Every API call goes through a single fetch abstraction that handles auth, errors, retries, and response parsing. This is the boundary — nothing leaks through it.

---

## FetchClient Class (Native Fetch)

The canonical pattern wraps the native `fetch` API in a class. One singleton per API base URL.

```ts
interface FetchOptions extends RequestInit {
    skipAuthorization?: boolean;  // public endpoints: login, register, forgot-password
    skipRedirect?: boolean;       // called outside route context (e.g., background task)
}

class FetchClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async getHeaders(options: FetchOptions = {}): Promise<HeadersInit> {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        if (!options.skipAuthorization) {
            const token = await TokenService.getToken();
            if (token) {
                (headers as Record<string, string>).Authorization = `Bearer ${token}`;
            }
        }

        return headers;
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async refreshToken(retryCount = 0): Promise<RefreshTokenResponse> {
        const maxRetries = 3;
        try {
            const refreshToken = await TokenService.getRefreshToken();
            if (!refreshToken) throw new Error("No refresh token");

            const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${refreshToken}`,
                },
            });

            if (!response.ok) throw new Error("Token refresh failed");
            return await response.json();
        } catch (error) {
            if (retryCount < maxRetries) {
                await this.sleep(2 ** retryCount * 1000); // exponential backoff
                return this.refreshToken(retryCount + 1);
            }
            throw new Error(`Token refresh failed after ${maxRetries + 1} attempts`, { cause: error });
        }
    }

    private async parseResponse(response: Response) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            return await response.json();
        }
        return await response.text();
    }

    async request(endpoint: string, options: FetchOptions = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = await this.getHeaders(options);

        try {
            let response = await fetch(url, { ...options, headers });

            // 401/403 → refresh token → retry once
            if ((response.status === 401 || response.status === 403) && !options.skipAuthorization) {
                try {
                    const newToken = await this.refreshToken();
                    await TokenService.setToken(newToken.auth.jwt);
                    await TokenService.setRefreshToken(newToken.auth.refreshToken);
                    const refreshedHeaders = await this.getHeaders(options);
                    response = await fetch(url, { ...options, headers: refreshedHeaders });
                } catch (error) {
                    await TokenService.clearTokens();
                    authUserStore.setState({ user: null });
                    if (!options.skipRedirect) {
                        router.replace("/");
                    }
                    throw new Error("Authentication failed", { cause: error });
                }
            }

            if (!response.ok) {
                let errorMessage = "An error occurred while processing your request";
                try {
                    const contentType = response.headers.get("content-type") || "";
                    if (contentType.includes("application/json")) {
                        const errorData = await response.json();
                        errorMessage = errorData?.message || errorMessage;
                    } else {
                        errorMessage = await response.text() || `HTTP ${response.status}: ${response.statusText}`;
                    }
                } catch {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            return await this.parseResponse(response);
        } catch (error) {
            console.error("FetchClient Catch Block:", {
                error,
                errorType: typeof error,
                errorConstructor: error?.constructor?.name,
                errorMessage: error instanceof Error ? error.message : String(error),
                url,
                platform: Platform.OS,
            });
            throw error instanceof Error ? error : new Error(`Network request failed: ${error}`);
        }
    }

    get(endpoint: string, options: FetchOptions = {}) {
        return this.request(endpoint, { ...options, method: "GET" });
    }

    post(endpoint: string, body: Record<string, unknown>, options: FetchOptions = {}) {
        return this.request(endpoint, { ...options, method: "POST", body: JSON.stringify(body) });
    }

    put(endpoint: string, body: Record<string, unknown>, options: FetchOptions = {}) {
        return this.request(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) });
    }

    patch(endpoint: string, body: Record<string, unknown>, options: FetchOptions = {}) {
        return this.request(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) });
    }

    delete(endpoint: string, options: FetchOptions = {}) {
        return this.request(endpoint, { ...options, method: "DELETE" });
    }
}

const fetchClient = new FetchClient(getEnvVars().API_URL);
export default fetchClient;
```

**Behaviours:**
- `skipAuthorization: true` — skips the `Authorization` header (public endpoints)
- `skipRedirect: true` — skips `router.replace("/")` on auth failure (background calls)
- On 401/403 — refresh token with exponential backoff (up to 3 retries), then clear + redirect
- Error body parsed for `message` field — falls back to `HTTP ${status}: ${statusText}`
- `parseResponse` checks `content-type` — handles both JSON and text responses (common Android edge case)

---

## Axios apiClient Pattern (Older Projects)

Some apps use Axios with a refresh queue — prevents duplicate refresh calls when multiple requests fail at once:

```ts
const instance = axios.create({ baseURL: host, timeout: 300_000 });

let isRefreshing = false;
const refreshAndRetryQueue: Array<{
    config: AxiosRequestConfig;
    resolve: (value: AxiosResponse) => void;
    reject: (reason: unknown) => void;
}> = [];

export const apiClient = <T, D>(config: AxiosRequestConfig<D>): Promise<AxiosResponse<T, D>> => {
    return new Promise(async (resolve, reject) => {
        const configWithAuth = getConfigWithAuth(config);
        instance(configWithAuth)
            .then(resolve)
            .catch(async error => {
                const tokenExpired =
                    error?.response?.data?.status === 403 &&
                    error?.response?.data?.error?.systems === "Token expired!";

                if (!tokenExpired) return reject(error);

                // Queue this request until refresh completes
                refreshAndRetryQueue.push({ config: configWithAuth, resolve, reject });

                if (isRefreshing) return; // another request already refreshing

                isRefreshing = true;
                const newAccessToken = await refreshToken();
                isRefreshing = false;

                if (!newAccessToken) {
                    await completeLogout();
                    return reject(error);
                }

                // Retry all queued requests with the new token
                await executeApiQueues(newAccessToken);
            });
    });
};
```

The queue pattern is critical — without it, three simultaneous 403s trigger three refresh calls.

---

## Endpoints Constant

All API paths are centralized in a single typed object. Never hardcode URLs in service hooks.

```ts
export const Endpoints = {
    auth: {
        login: "/auth/login",
        registration: "/auth/registration",
        logout: "/auth/logout",
        user: "/auth/user",
        "forgot-password": "/auth/forgot-password",
        "reset-password": "/auth/reset-password",
        "refresh-token": "/auth/refresh-token",
        "otp-verification": "/auth/otp-verification",
        "resend-registration-otp": "/auth/resend-registration-otp",
        "2fa-otp-verification": "/auth/2fa-otp-verification",
        "save-device-info": "/auth/save-device-info",
    },
    myFeature: {
        list: "/my-feature/list",
        create: "/my-feature/create",
        update: (id: string) => `/my-feature/${id}/update`,
        findOne: (id: string) => `/my-feature/${id}/find-one`,
        delete: (id: string) => `/my-feature/${id}/delete`,
    },
};
```

Dynamic segments are factory functions. Static segments are string literals. Kebab-case keys throughout.

**Usage:**
```ts
fetchClient.get(Endpoints.auth.user)
fetchClient.post(Endpoints.auth.login, payload)
fetchClient.patch(Endpoints.myFeature.update(id), body)
```

---

## BAD vs GOOD

```ts
// ❌ BAD — hardcoded URL, no error handling, no auth injection
const response = await fetch(`${API_URL}/auth/login`, { method: "POST", body: JSON.stringify(payload) });

// ✅ GOOD — goes through the fetch abstraction
const response = await fetchClient.post(Endpoints.auth.login, payload, { skipAuthorization: true });
```

```ts
// ❌ BAD — public endpoint but sends auth header anyway
fetchClient.post(Endpoints.auth.login, payload);

// ✅ GOOD — login doesn't need a token
fetchClient.post(Endpoints.auth.login, payload, { skipAuthorization: true });
```
