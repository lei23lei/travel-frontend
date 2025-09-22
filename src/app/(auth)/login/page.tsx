"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { loginSchema, LoginFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Github, Loader2 } from "lucide-react";
import Link from "next/link";
import AuthPageWrapper from "@/components/auth/AuthPageWrapper";
import ErrorMessage from "@/components/auth/error-message";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const {
    loginWithEmail,
    loginWithGitHub,
    loginWithGoogle,
    loading,
    error,
    clearError,
    isAuthenticated,
  } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push("/user");
    }
  }, [isAuthenticated, loading, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError(); // Clear any previous errors
      await loginWithEmail(data.email, data.password);
      router.push("/user");
    } catch (error) {
      // Error is handled by AuthContext and displayed in the UI
      // No need to do anything here - the error will show in the error display
    }
  };

  return (
    <AuthPageWrapper>
      <CardHeader className="text-center">
        <CardTitle className=" font-bold text-authtext ">Sign In</CardTitle>
        <CardDescription className="text-authtext">
          Welcome back! Please sign in to your account.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Global Error Message */}
        {error && (
          <ErrorMessage
            error={error}
            onDismiss={clearError}
            variant="destructive"
          />
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <Button
            onClick={loginWithGitHub}
            disabled={loading}
            variant="glass"
            className="w-full"
          >
            <div className="flex items-center justify-center w-60">
              <Github className="w-4 h-4 mr-2" aria-hidden="true" />
              {loading ? "Loading..." : "Continue with GitHub"}
            </div>
          </Button>

          <Button
            onClick={loginWithGoogle}
            disabled={loading}
            variant="glass"
            className="w-full"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? "Loading..." : "Continue with Google"}
          </Button>
        </div>

        {/* Divider */}
        <div className="flex justify-center">
          <span className=" px-2  text-xs text-authtext">
            Or continue with email
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-authtext">
              Email Address
            </Label>
            <Input
              {...register("email")}
              id="email"
              type="email"
              placeholder="Enter your email"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-authtexterror">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-authtext">
              Password
            </Label>
            <div className="relative">
              <Input
                {...register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                disabled={loading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-authtexterror">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Error Message */}
          {errors.root && (
            <div className="p-3 bg-destructive/15 border border-destructive/20 rounded-md">
              <p className="text-sm text-authtexterror">
                {errors.root.message}
              </p>
            </div>
          )}
          {/* forgot password link */}
          <div className="text-right text-authtext">
            <Link
              href="/forgot-password"
              className="underline font-medium text-sm mr-2"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            variant="glass"
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Loading...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-authtext">
              Don't have an account?{" "}
              <a href="/register" className="underline font-medium">
                Sign up
              </a>
            </p>
          </div>
        </form>
      </CardContent>
    </AuthPageWrapper>
  );
}
