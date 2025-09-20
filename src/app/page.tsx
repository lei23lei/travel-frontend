"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Github } from "lucide-react";

export default function Home() {
  const {
    user,
    loading,
    loginWithGitHub,
    loginWithGoogle,
    logout,
    error,
    clearError,
  } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2
              className="h-12 w-12 animate-spin text-primary mb-4"
              aria-hidden="true"
            />
            <CardTitle className="text-3xl font-bold text-center mb-6">
              Welcome to Travel App
            </CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className=" min-h-screen bg-gray-400 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md liquid-glass-heavy">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Welcome to Travel App
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 bg-destructive/15 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="mt-2 h-auto p-0 text-xs text-destructive/70 hover:text-destructive"
              >
                Dismiss
              </Button>
            </div>
          )}

          {user ? (
            <>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={user.avatar_url || undefined}
                    alt={user.name || user.email}
                  />
                  <AvatarFallback className="text-xl font-bold">
                    {user.name
                      ? user.name.charAt(0).toUpperCase()
                      : user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center">
                  <CardDescription className="text-base">
                    Welcome back, {user.name || user.username || user.email}!
                  </CardDescription>
                  <CardDescription className="text-sm">
                    Ready to continue your journey?
                  </CardDescription>
                  {user.provider && (
                    <Badge variant="secondary" className="mt-2">
                      {user.provider.charAt(0).toUpperCase() +
                        user.provider.slice(1)}{" "}
                      Account
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button asChild className="flex-1">
                  <Link href="/user">My Account</Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={logout}
                  className="flex-1"
                >
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <>
              <CardDescription className="text-center">
                Your journey starts here. Sign in to explore amazing
                destinations.
              </CardDescription>

              {/* OAuth Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={loginWithGitHub}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Github className="w-4 h-4 mr-2" aria-hidden="true" />
                  {loading ? "Signing in..." : "Continue with GitHub"}
                </Button>

                <Button
                  onClick={loginWithGoogle}
                  disabled={loading}
                  variant="outline"
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
                  {loading ? "Signing in..." : "Continue with Google"}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Email Login Buttons */}
              <div className="flex space-x-2">
                <Button asChild className="flex-1">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild variant="secondary" className="flex-1">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
