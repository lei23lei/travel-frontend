"use client";

import { Button } from "@/components/ui/button";
import { X, AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  error: string;
  onDismiss?: () => void;
  variant?: "default" | "destructive" | "warning";
  showIcon?: boolean;
  className?: string;
}

export default function ErrorMessage({
  error,
  onDismiss,
  variant = "destructive",
  showIcon = true,
  className,
}: ErrorMessageProps) {
  const getIcon = () => {
    if (!showIcon) return null;

    switch (variant) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 flex-shrink-0" />;
      case "destructive":
        return <AlertCircle className="h-4 w-4 flex-shrink-0" />;
      default:
        return <AlertCircle className="h-4 w-4 flex-shrink-0" />;
    }
  };

  return (
    <div
      className={cn(
        "relative p-4 liquid-glass rounded-xl border transition-all duration-200",
        "backdrop-blur-sm bg-opacity-80 text-red-300",
        className
      )}
    >
      <div className="flex items-center  gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className=" text-xs sm:text-sm font-medium leading-relaxed break-words">
            {error}
          </p>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 hover:bg-black/10 rounded-xl dark:hover:bg-white/10 flex-shrink-0"
            aria-label="Dismiss error message"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
