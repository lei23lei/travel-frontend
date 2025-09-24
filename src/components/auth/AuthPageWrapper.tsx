"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import AuthBackground from "./auth-bg";

interface AuthPageWrapperProps {
  children: ReactNode;
  backgroundClass?: string;
}

export default function AuthPageWrapper({ children }: AuthPageWrapperProps) {
  return (
    <AuthBackground>
      <Card className="w-full max-w-md liquid-glass-heavy">
        <CardContent className="p-0">{children}</CardContent>
      </Card>
    </AuthBackground>
  );
}
