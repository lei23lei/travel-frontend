"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authAPI, authUtils } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { nameSchema } from "@/lib/validations";
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
  Pencil,
  Check,
  X,
} from "lucide-react";

export default function User() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [nameError, setNameError] = useState("");
  const { logout: contextLogout, refreshUser } = useAuth();

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

  // Logout mutation using AuthContext
  const logoutMutation = useMutation({
    mutationFn: contextLogout,
    onSuccess: () => {
      router.push("/login");
    },
    onError: () => {
      // Even if logout fails, redirect to login
      router.push("/login");
    },
  });

  // Update name mutation
  const updateNameMutation = useMutation({
    mutationFn: (newName: string) =>
      authAPI.updateUserProfile({ name: newName }),
    onSuccess: () => {
      setIsEditingName(false);
      setEditingName("");
      refetch(); // Refresh user data
      refreshUser(); // Update AuthContext
    },
    onError: (error) => {
      console.error("Failed to update name:", error);
      // Keep editing mode open so user can try again
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleEditName = () => {
    setIsEditingName(true);
    setEditingName(user?.name || "");
  };

  const handleSaveName = () => {
    // Clear previous errors
    setNameError("");

    try {
      // Use centralized validation
      const validatedName = nameSchema.parse(editingName);

      if (validatedName !== (user?.name || "")) {
        updateNameMutation.mutate(validatedName);
      } else {
        setIsEditingName(false);
        setEditingName("");
      }
    } catch (error: any) {
      // Handle validation errors
      if (error.errors && error.errors.length > 0) {
        setNameError(error.errors[0].message);
      } else {
        setNameError("Invalid name format");
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditingName("");
    setNameError("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
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
              <div className="flex flex-col items-center justify-center gap-2">
                <Avatar className="h-20 w-20 bg-gradient-to-r from-pink-300 to-purple-300">
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
                <p className="text-xs text-muted-foreground underline cursor-pointer">
                  Edit
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex flex-row items-center gap-2">
                  {isEditingName ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingName}
                          onChange={(e) => {
                            setEditingName(e.target.value);
                            if (nameError) setNameError(""); // Clear error when typing
                          }}
                          onKeyDown={handleKeyPress}
                          placeholder="Enter your name"
                          className={`text-xl font-semibold h-8 w-48 ${
                            nameError ? "border-red-500" : ""
                          }`}
                          disabled={updateNameMutation.isPending}
                          autoFocus
                          maxLength={30}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleSaveName}
                          disabled={
                            updateNameMutation.isPending || !editingName.trim()
                          }
                          className="h-8 w-8 p-0"
                        >
                          {updateNameMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          disabled={updateNameMutation.isPending}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                      {nameError && (
                        <p className="text-red-500 text-sm">{nameError}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {editingName.length}/30 characters
                      </p>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-semibold">
                        {user.name || "User name"}
                      </h3>
                      <Pencil
                        className="w-3.5 h-3.5 mt-0.5 cursor-pointer hover:text-primary transition-colors"
                        onClick={handleEditName}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </div>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
