"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authAPI, authUtils } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { nameSchema } from "@/lib/validations";
import { uploadToCloudinary, generateRandomAvatar } from "@/lib/cloudinary";
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
import AuthPageWrapper from "@/components/auth/AuthPageWrapper";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  LogOut,
  RefreshCw,
  User as UserIcon,
  AlertTriangle,
  Loader2,
  Pencil,
  Check,
  X,
  Upload,
  Shuffle,
} from "lucide-react";

export default function User() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [nameError, setNameError] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRefreshingAvatar, setIsRefreshingAvatar] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
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

  // Preload image function
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  };

  // Update avatar mutation
  const updateAvatarMutation = useMutation({
    mutationFn: async (avatarUrl: string) => {
      setIsImageLoading(true);
      try {
        // Preload the new image
        await preloadImage(avatarUrl);
        // Update the avatar in backend
        return await authAPI.updateUserAvatar({ avatar_url: avatarUrl });
      } finally {
        setIsImageLoading(false);
      }
    },
    onSuccess: async () => {
      setIsRefreshingAvatar(true);
      try {
        await refetch(); // Refresh user data
        await refreshUser(); // Update AuthContext
      } finally {
        setIsRefreshingAvatar(false);
      }
    },
    onError: (error) => {
      console.error("Failed to update avatar:", error);
      setIsRefreshingAvatar(false);
      setIsImageLoading(false);
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
      // Trim the input before validation
      const trimmedName = editingName.trim();

      // Use centralized validation
      const validatedName = nameSchema.parse(trimmedName);

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

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const uploadResult = await uploadToCloudinary(file);
      updateAvatarMutation.mutate(uploadResult.secure_url);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      // You could add a toast notification here
    } finally {
      setIsUploadingAvatar(false);
      // Reset the input
      event.target.value = "";
    }
  };

  const handleGenerateRandomAvatar = () => {
    const randomAvatar = generateRandomAvatar(user?.email);
    updateAvatarMutation.mutate(randomAvatar);
  };

  // Don't render anything until client-side hydration
  if (!isClient) {
    return null;
  }

  // Redirect if not authenticated
  if (!authUtils.isAuthenticated()) {
    return (
      <AuthPageWrapper>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" aria-hidden="true" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </CardContent>
      </AuthPageWrapper>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <AuthPageWrapper>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Loader2
            className="h-12 w-12 animate-spin text-primary mb-4"
            aria-hidden="true"
          />
          <p className="text-muted-foreground">Loading user information...</p>
        </CardContent>
      </AuthPageWrapper>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <AuthPageWrapper>
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
      </AuthPageWrapper>
    );
  }

  return (
    <div className="min-h-screen bg-gray-400 py-4 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <Card className="liquid-glass-heavy">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
                  Welcome back !
                </CardTitle>
                <CardDescription className="mt-1 text-sm sm:text-base">
                  Manage your account and preferences
                </CardDescription>
              </div>
              <div className="flex flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => router.push("/")}
                  className="w-full sm:w-auto"
                >
                  <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                  Home
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="w-full sm:w-auto"
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
        <Card className="liquid-glass-heavy">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <UserIcon className="w-5 h-5 mr-2" aria-hidden="true" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 pb-4 sm:pb-6">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="relative">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-r from-pink-300 to-purple-300">
                    <AvatarImage
                      src={user.avatar_url || undefined}
                      alt={user.name || user.email}
                    />
                    <AvatarFallback className="text-lg sm:text-2xl font-bold">
                      {user.name
                        ? user.name.charAt(0).toUpperCase()
                        : user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {(isUploadingAvatar ||
                    updateAvatarMutation.isPending ||
                    isRefreshingAvatar ||
                    isImageLoading) && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="h-4 w-4 sm:h-6 sm:w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex gap-4 mt-1 ">
                  <label className="text-xs text-muted-foreground underline cursor-pointer hover:text-primary">
                    <Upload className="w-4 h-4 hover:text-primary hover:scale-110 duration-500 transition-all" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={
                        isUploadingAvatar ||
                        updateAvatarMutation.isPending ||
                        isRefreshingAvatar ||
                        isImageLoading
                      }
                    />
                  </label>
                  <button
                    onClick={handleGenerateRandomAvatar}
                    disabled={
                      isUploadingAvatar ||
                      updateAvatarMutation.isPending ||
                      isRefreshingAvatar ||
                      isImageLoading
                    }
                    className="text-xs text-muted-foreground underline cursor-pointer hover:text-primary disabled:opacity-50"
                  >
                    <Shuffle className="w-4 h-4 hover:text-primary hover:scale-110 duration-500 transition-all" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 flex-1 w-full  sm:w-auto  flex flex-col items-center gap-2 justify-center sm:items-start ">
                <div className="flex flex-col gap-2">
                  {isEditingName ? (
                    <div className="flex flex-col gap-2 w-full ">
                      <div className="flex items-center gap-2 w-full sm:w-44">
                        <Input
                          value={editingName}
                          onChange={(e) => {
                            // Trim whitespace on change to prevent leading/trailing spaces
                            setEditingName(e.target.value.trim());
                            if (nameError) setNameError(""); // Clear error when typing
                          }}
                          onKeyDown={handleKeyPress}
                          placeholder="Enter your name"
                          className={`text-lg sm:text-xl font-semibold h-8 flex-1 sm:w-48 ${
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
                            updateNameMutation.isPending || !editingName
                          }
                          className="h-8 w-8 p-0 flex-shrink-0"
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
                          className="h-8 w-8 p-0 flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                      {nameError && (
                        <p className="text-red-500 text-sm">{nameError}</p>
                      )}
                      <p className="text-xs ml-2 text-muted-foreground">
                        {editingName.trim().length}/30 characters
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center w-[100%] sm:w-auto gap-2 ">
                      <h3 className="text-lg sm:text-xl font-semibold  break-words">
                        {user.name || "User name"}
                      </h3>
                      <Pencil
                        className="w-4 h-4 mt-0.5 hover:scale-110 ml-2 duration-500 cursor-pointer hover:text-primary transition-colors flex-shrink-0"
                        onClick={handleEditName}
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground text-sm sm:text-base break-all sm:break-normal">
                  {user.email}
                </p>
                {user.provider && (
                  <Badge
                    variant="secondary"
                    className="w-fit liquid-glass-heavy px-2 py-1"
                  >
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
