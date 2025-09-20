"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { tokenManager } from "@/services/auth";
import { Button } from "@/components/ui/button";
import AuthPageWrapper from "@/components/auth/AuthPageWrapper";
import { CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  AlertTriangle,
  Loader2,
  Home,
  RotateCcw,
} from "lucide-react";

export default function OAuthSuccess() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const errorMessage = searchParams.get("message");

    if (token) {
      // Success - send token to parent window and close popup
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          {
            type: "OAUTH_SUCCESS",
            token: token,
          },
          window.location.origin
        );
        window.close();
      } else {
        // Not in popup, store token and redirect to user page
        tokenManager.setToken(token);
        setStatus("success");
        setMessage("Authentication successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "/user";
        }, 2000);
      }
    } else if (error) {
      // Error occurred
      const decodedMessage = errorMessage
        ? decodeURIComponent(errorMessage)
        : "Authentication failed";

      if (window.opener) {
        window.opener.postMessage(
          {
            type: "OAUTH_ERROR",
            error: decodedMessage,
          },
          window.location.origin
        );
        window.close();
      } else {
        setStatus("error");
        setMessage(decodedMessage);
      }
    } else {
      // No token or error - something went wrong
      const fallbackMessage = "Authentication failed - no token received";

      if (window.opener) {
        window.opener.postMessage(
          {
            type: "OAUTH_ERROR",
            error: fallbackMessage,
          },
          window.location.origin
        );
        window.close();
      } else {
        setStatus("error");
        setMessage(fallbackMessage);
      }
    }
  }, [searchParams]);

  return (
    <AuthPageWrapper>
      <CardContent className="flex flex-col items-center text-center p-6">
        {status === "processing" && (
          <>
            <Loader2
              className="h-10 w-10 animate-spin text-primary mb-4"
              aria-hidden="true"
            />
            <CardTitle className="text-2xl font-bold mb-4">
              Processing Authentication
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle
              className="h-10 w-10 text-green-600 mb-4"
              aria-hidden="true"
            />
            <CardTitle className="text-2xl font-bold mb-4">
              Authentication Successful!
            </CardTitle>
            <CardDescription className="mb-6">{message}</CardDescription>
            <Button asChild variant="glass">
              <Link href="/user">
                <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                Go to Dashboard
              </Link>
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <AlertTriangle
              className="h-10 w-10 text-destructive mb-4"
              aria-hidden="true"
            />
            <CardTitle className="text-2xl font-bold mb-4">
              Authentication Failed
            </CardTitle>
            <CardDescription className="mb-6">{message}</CardDescription>
            <div className="flex space-x-2 w-full">
              <Button asChild className="flex-1" variant="glass">
                <Link href="/login">
                  <RotateCcw className="w-4 h-4 mr-2" aria-hidden="true" />
                  Try Again
                </Link>
              </Button>
              <Button asChild variant="glass" className="flex-1">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                  Go Home
                </Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </AuthPageWrapper>
  );
}
