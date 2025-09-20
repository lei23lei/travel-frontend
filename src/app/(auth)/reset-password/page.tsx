"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { authAPI } from "@/services/auth";
import AuthPageWrapper from "@/components/auth/AuthPageWrapper";
import ErrorMessage from "@/components/auth/error-message";

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    // Check if token exists
    if (!token) {
      setTokenValid(false);
      setError("Invalid reset link. Please request a new password reset.");
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    try {
      setError(null);
      setIsLoading(true);

      const response = await authAPI.resetPassword({
        token: token,
        new_password: data.password,
      });

      if (response.status === "success") {
        setIsSuccess(true);
      } else {
        throw new Error(response.message || "Failed to reset password");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid token state
  if (tokenValid === false) {
    return (
      <AuthPageWrapper>
        <CardContent className="flex flex-col items-center text-center p-6">
          <AlertTriangle
            className="h-12 w-12 text-destructive mb-4"
            aria-hidden="true"
          />
          <CardTitle className="text-2xl font-bold mb-4">
            Invalid Reset Link
          </CardTitle>
          <CardDescription className="mb-6">
            This password reset link is invalid or has expired. Please request a
            new password reset.
          </CardDescription>
          <div className="space-y-3 w-full">
            <Button asChild variant="glass" className="w-full">
              <Link href="/forgot-password">Request New Reset Link</Link>
            </Button>
            <Button asChild variant="glass" className="w-full">
              <Link href="/login">
                <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                Back to Sign In
              </Link>
            </Button>
          </div>
        </CardContent>
      </AuthPageWrapper>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <AuthPageWrapper>
        <CardContent className="flex flex-col items-center text-center p-6">
          <CheckCircle
            className="h-12 w-12 text-green-600 mb-4"
            aria-hidden="true"
          />
          <CardTitle className="text-2xl font-bold mb-4">
            Password Reset Successful
          </CardTitle>
          <CardDescription className="mb-6">
            Your password has been successfully reset. You can now sign in with
            your new password.
          </CardDescription>
          <Button asChild variant="glass" className="w-full">
            <Link href="/login">Sign In with New Password</Link>
          </Button>
        </CardContent>
      </AuthPageWrapper>
    );
  }

  // Loading state while checking token
  if (tokenValid === null) {
    return (
      <AuthPageWrapper>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Loader2
            className="h-12 w-12 animate-spin text-primary mb-4"
            aria-hidden="true"
          />
          <CardDescription>Verifying reset link...</CardDescription>
        </CardContent>
      </AuthPageWrapper>
    );
  }

  // Reset password form
  return (
    <AuthPageWrapper>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
        <CardDescription>Enter your new password below.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error Message */}
        {error && <ErrorMessage error={error} variant="destructive" />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                {...register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                {...register("confirmPassword")}
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            variant="glass"
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>

          {/* Back to Login Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Back to Sign In
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </AuthPageWrapper>
  );
}
