"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authAPI, authUtils } from "@/services/auth";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  LogOut,
  RefreshCw,
  Settings,
  User as UserIcon,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export default function User() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true);
    // Check if user is authenticated, redirect if not
    if (!authUtils.isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  // Fetch current user information
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: authAPI.getCurrentUser,
    enabled: isClient && authUtils.isAuthenticated(),
    retry: 1,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      router.push("/login");
    },
    onError: () => {
      // Even if logout API fails, clear token and redirect
      authUtils.logout();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Don't render anything until client-side hydration
  if (!isClient) {
    return null;
  }

  // Redirect if not authenticated
  if (!authUtils.isAuthenticated()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" aria-hidden="true" />
            <p className="text-muted-foreground">Redirecting to login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2
              className="h-12 w-12 animate-spin text-primary mb-4"
              aria-hidden="true"
            />
            <p className="text-muted-foreground">Loading user information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center text-center p-6">
            <AlertTriangle
              className="h-12 w-12 text-destructive mb-4"
              aria-hidden="true"
            />
            <CardTitle className="text-2xl font-bold mb-4">
              Failed to load user information
            </CardTitle>
            <CardDescription className="mb-6">
              {error instanceof Error ? error.message : "Something went wrong"}
            </CardDescription>
            <div className="flex space-x-2 w-full">
              <Button onClick={() => refetch()} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex-1"
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                )}
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold">
                  Welcome back{user.name ? `, ${user.name}` : ""}!
                </CardTitle>
                <CardDescription className="mt-1">
                  Manage your account and preferences
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/")}
                >
                  <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                  Home
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                  )}
                  Sign Out
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* User Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="w-5 h-5 mr-2" aria-hidden="true" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6 pb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={user.avatar_url || undefined}
                  alt={user.name || user.email}
                />
                <AvatarFallback className="text-2xl font-bold">
                  {user.name
                    ? user.name.charAt(0).toUpperCase()
                    : user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{user.name || "User"}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                {user.provider && (
                  <Badge variant="secondary">
                    {user.provider.charAt(0).toUpperCase() +
                      user.provider.slice(1)}{" "}
                    Account
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* User Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>User ID</Label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm">
                    {user.id}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm">
                    {user.email}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Username</Label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm">
                    {user.username || "Not set"}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm">
                    {user.name || "Not set"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Account Provider</Label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm">
                    {user.provider
                      ? user.provider.charAt(0).toUpperCase() +
                        user.provider.slice(1)
                      : "Not set"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Provider ID</Label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm">
                    {user.provider_id || "Not set"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" aria-hidden="true" />
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                Refresh Information
              </Button>

              <Button
                onClick={() => alert("Profile editing coming soon!")}
                variant="outline"
              >
                <UserIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                Edit Profile
              </Button>

              <Button
                onClick={() => alert("Settings page coming soon!")}
                variant="outline"
              >
                <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
                Account Settings
              </Button>

              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                )}
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Token Status:</strong>{" "}
                {authUtils.getToken() ? "✅ Valid" : "❌ Missing"}
              </p>
              <p>
                <strong>API Base URL:</strong>{" "}
                {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
              </p>
              <p>
                <strong>Authentication:</strong>{" "}
                {authUtils.isAuthenticated()
                  ? "✅ Authenticated"
                  : "❌ Not authenticated"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
