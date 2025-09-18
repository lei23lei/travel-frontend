"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";

// Validation schema for forgot password
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

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

      // TODO: Replace with actual API call to your backend
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send reset email");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center text-center p-6">
            <CheckCircle
              className="h-12 w-12 text-green-600 mb-4"
              aria-hidden="true"
            />
            <CardTitle className="text-2xl font-bold mb-4">
              Check Your Email
            </CardTitle>
            <CardDescription className="mb-6">
              We've sent a password reset link to{" "}
              <strong>{getValues("email")}</strong>. Please check your email and
              follow the instructions to reset your password.
            </CardDescription>
            <div className="space-y-3 w-full">
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
                Didn't receive email? Try again
              </Button>
              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                  Back to Sign In
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your
            password.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/15 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                {...register("email")}
                id="email"
                type="email"
                placeholder="Enter your email address"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading} className="w-full">
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
      </Card>
    </div>
  );
}
