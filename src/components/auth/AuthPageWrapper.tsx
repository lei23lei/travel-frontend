"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AuthPageWrapperProps {
  children: ReactNode;
  backgroundClass?: string;
}

export default function AuthPageWrapper({
  children,
  backgroundClass = "bg-gradient-to-br from-blue-300 via-gray-400 to-purple-400",
}: AuthPageWrapperProps) {
  return (
    <div
      className={`min-h-screen ${backgroundClass} flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8`}
    >
      <Card className="w-full max-w-md liquid-glass-heavy">
        <CardContent className="p-0">{children}</CardContent>
      </Card>
    </div>
  );
}
