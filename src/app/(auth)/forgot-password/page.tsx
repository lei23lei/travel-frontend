"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";
import { authAPI } from "@/services/auth";
import AuthPageWrapper from "@/components/auth/AuthPageWrapper";
import ErrorMessage from "@/components/auth/error-message";

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authAPI.forgotPassword(data);

      if (response.status === "success") {
        setIsSubmitted(true);
      } else {
        throw new Error(response.message || "Failed to send reset email");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageWrapper>
      {isSubmitted ? (
        <CardContent className="flex flex-col items-center text-center p-6">
          <CheckCircle
            className="h-12 w-12 text-green-600 mb-4"
            aria-hidden="true"
          />
          <CardTitle className=" font-bold mb-4 text-authtext">
            Check Your Email
          </CardTitle>
          <CardDescription className="mb-6 text-authtext">
            We've sent a password reset link to{" "}
            <strong>{getValues("email")}</strong>. Please check your email and
            follow the instructions to reset your password.
          </CardDescription>
          <div className="space-y-3 w-full">
            <Button
              onClick={() => setIsSubmitted(false)}
              variant="glass"
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
              Didn't receive email? Try again
            </Button>
            <Button asChild variant="glass" className="w-full">
              <Link href="/login">
                <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                Back to Sign In
              </Link>
            </Button>
          </div>
        </CardContent>
      ) : (
        <>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-authtext">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-authtext">
              Enter your email address and we'll send you a link to reset your
              password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Message */}
            {error && <ErrorMessage error={error} variant="destructive" />}

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
                  placeholder="Enter your email address"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-authtexterror">
                    {errors.email.message}
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
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                    Send Reset Link
                  </>
                )}
              </Button>

              {/* Back to Login Link */}
              <div className="text-center">
                <p className="text-sm text-authtext">
                  Remember your password?{" "}
                  <Link href="/login" className="underline font-medium">
                    Back to Sign In
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </>
      )}
    </AuthPageWrapper>
  );
}
