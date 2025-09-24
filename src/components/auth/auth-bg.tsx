"use client";

import { ReactNode } from "react";

interface AuthBackgroundProps {
  isUserPage?: boolean;
  children: ReactNode;
}

export default function AuthBackground({
  children,
  isUserPage = false,
}: AuthBackgroundProps) {
  return (
    <div
      className={`min-h-screen flex ${
        isUserPage ? "items-start" : "items-center"
      } justify-center py-12 px-4 sm:px-6 lg:px-8 relative`}
      style={{
        backgroundImage: `url('/images/auth-bg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
