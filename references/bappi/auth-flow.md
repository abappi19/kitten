---
title: Bappi's Auth Flow
description: Complete auth patterns — login, registration, logout, forgot password/OTP, token refresh, social auth, and the AuthProvider context pattern for cross-platform apps.
type: reference
when_to_load: When implementing any auth-related feature — login, logout, registration, password reset, social auth, token management, or auth guards.
---

# Bappi's Auth Flow

## Login Sequence

1. POST credentials → receive `{ user, auth: { jwt, refreshToken } }`
2. `await TokenService.setToken(jwt)`
3. `await TokenService.setRefreshToken(refreshToken)`
4. `queryClient.setQueryData(["user", user.id], user)` — seed cache
5. `setUser(user)` — update Zustand auth store
6. `showMessage({ message: "Welcome back!", type: "success" })`
7. `router.replace("/")` — replace stack so user can't go back to login

```ts
export function useLogin() {
    const queryClient = useQueryClient();
    const { setUser } = useAuthUserStore();

    return useMutation<LoginResponse, Error, LoginPayload>({
        mutationFn: async payload => {
            return await fetchClient.post(Endpoints.auth.login, payload, { skipAuthorization: true });
        },
        onSuccess: async data => {
            await TokenService.setToken(data.auth.jwt);
            await TokenService.setRefreshToken(data.auth.refreshToken);
            queryClient.setQueryData(["user", data.user.id], data.user);
            setUser(data.user);
            showMessage({ message: "Welcome back!", type: "success" });
            router.replace("/");
        },
        onError: error => {
            if (error?.message?.startsWith("Email not confirmed")) {
                resendEmailConfirmation(email || "");
                showMessage({ message: "Please confirm your email address to continue.", type: "warning" });
                router.push("/auth/verify-email");
                return;
            }
            showMessage({ message: error?.message || "Something went wrong", type: "danger" });
        },
    });
}
```

---

## Registration Sequence

1. POST payload (includes `deviceToken` from `react-native-device-info`)
2. `onSuccess`: save email to forgot-password store → show "check your email" message
3. Navigate to `/auth/verify-email` (keeps back stack — `router.push`)

```ts
export function useRegister() {
    const { setEmail } = useAuthForgotPasswordStore();

    return useMutation<RegisterResponse, Error, RegisterPayload>({
        mutationFn: async payload => {
            const deviceToken = await getUniqueId();
            return await fetchClient.post(Endpoints.auth.registration, { ...payload, deviceToken }, {
                skipAuthorization: true,
            });
        },
        onSuccess: data => {
            setEmail(data.user.email);
            showMessage({ message: "A confirmation email has been sent.", type: "success" });
            router.push("/auth/verify-email");
        },
    });
}
```

---

## Logout Sequence

Order matters: `clearTokens → clear stores → invalidateQueries → navigate`

```ts
export function useLogout() {
    const queryClient = useQueryClient();
    const { setUser } = useAuthUserStore();

    return useMutation<void, Error, void>({
        mutationFn: async () => {
            await TokenService.clearTokens();
            setUser(null);
            queryClient.invalidateQueries({ queryKey: ["user"] });
            router.replace("/");
        },
        onError: error => {
            showMessage({ message: error?.message || "Something went wrong", type: "danger" });
            console.error("Logout error:", error);
        },
    });
}
```

**`router.replace("/")` not `router.push`** — user must not be able to navigate back to authenticated screens after logout.

---

## Forgot Password / OTP Flow

Multi-step flow — state carried via `useAuthForgotPasswordStore`:

```
Step 1: POST email → receive { email, token }
        → save email + token to store → navigate to OTP screen

Step 2: POST OTP → verify → receive new reset token
        → update token in store → navigate to set-new-password screen

Step 3: POST new password + token → success
        → show message → navigate back to login (router.replace)
```

```ts
export function useForgotPassword() {
    const { setEmail, setToken } = useAuthForgotPasswordStore();

    return useMutation<ForgotPasswordResponse, Error, ForgotPasswordPayload>({
        mutationFn: async payload => {
            return await fetchClient.post(Endpoints.auth["forgot-password"], payload, { skipAuthorization: true });
        },
        onSuccess: data => {
            setEmail(data.email);
            setToken(data.token);
            showMessage({ message: "A password reset link has been sent.", type: "success" });
            router.push("/auth/recovery/verify-email");
        },
    });
}
```

---

## Token Refresh (Automatic — Inside FetchClient)

Token refresh is transparent to service hooks. The FetchClient handles it:

1. Any request returns 401 or 403 (and `skipAuthorization` is false)
2. FetchClient calls `TokenService.getRefreshToken()`
3. POST to `/auth/refresh-token` with refresh token as Bearer
4. On success: `setToken(newJwt)` + `setRefreshToken(newRefresh)` → retry original request
5. On failure (after 3 exponential backoff retries): `clearTokens()` → `setState({ user: null })` → `router.replace("/")`

Exponential backoff: `2^retryCount * 1000ms` (1s, 2s, 4s)

---

## AuthProvider Context (Cross-Platform)

For cross-platform apps, an `AuthProvider` wraps the app and provides `isAuthenticated`, `userType`, `user`, and `checkAuthentication`:

```tsx
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userType, setUserType] = useState<UserRole | null>(null);
    const [user, setUser] = useState<TUserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const checkAuthentication = async () => {
        setIsLoading(true);
        const token = await TokenService.getToken();
        const storedUserType = await TokenService.getUserType();
        const storedUserInfo = await TokenService.getUserInfo();
        setIsAuthenticated(!!token);
        setUserType(storedUserType);
        setUser(typeof storedUserInfo === "string" ? JSON.parse(storedUserInfo) : storedUserInfo);
        setIsLoading(false);
    };

    useEffect(() => { void checkAuthentication(); }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, userType, user, checkAuthentication, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
```

**Pattern:** after any token change (login, social auth), call `await checkAuthentication()` to re-sync auth state.

---

## Social Auth

```ts
export const useSocialLogin = () => {
    const { checkAuthentication } = useAuthProvider();

    return useMutation({
        mutationFn: async (credentials: SocialLoginPayload) => {
            return await fetchClient.post(Endpoints.auth["social-login"], credentials, { skipAuthorization: true });
        },
        onSuccess: async response => {
            await TokenService.setToken(response.payload.accessToken);
            await TokenService.setRefreshToken(response.payload.refreshToken);
            await TokenService.setUserType(response.payload.userInfo.userType);
            await checkAuthentication();
            router.replace("/home");
        },
    });
};
```

---

## Multi-Role Navigation After Login

Apps with multiple user types navigate to different homes:

```ts
onSuccess: async data => {
    await TokenService.setUserType(data.userType);
    if (data.userType === "admin") {
        router.replace("/admin");
    } else if (data.userType === "client") {
        router.replace("/client-user");
    } else {
        router.replace("/");
    }
},
```

---

## Auth Guard in Layout

```tsx
// app/(protected)/_layout.tsx
const { isAuthenticated, isLoading } = useAuthProvider();

if (isLoading) return <SplashScreen />;
if (!isAuthenticated) return <Redirect href="/auth" />;

return <Stack />;
```
