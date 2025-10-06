"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { OrganizationInvitation } from "@/lib/types/organization";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const [invitation, setInvitation] = useState<OrganizationInvitation | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClient();

  const token = params.token as string;

  const checkAuth = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  }, [supabase.auth]);

  const loadInvitation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/load-invitation?token=${encodeURIComponent(token)}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to load invitation");
        return;
      }

      setInvitation(data.data);
    } catch (error) {
      console.error("Error loading invitation:", error);
      setError("Failed to load invitation");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    checkAuth();
    loadInvitation();
  }, [token, checkAuth, loadInvitation]);

  const handleAcceptInvitation = async () => {
    if (!isAuthenticated) {
      // Redirect to auth with return URL
      const returnUrl = `/invite/${token}`;
      router.push(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    try {
      setIsAccepting(true);
      setError(null);

      const response = await fetch("/api/accept-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to accept invitation");
        return;
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setError("Failed to accept invitation");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleSignIn = () => {
    const returnUrl = `/invite/${token}`;
    router.push(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    B
                  </span>
                </div>
                <span className="text-xl font-bold text-foreground">
                  BREEQA
                </span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">
                  Invalid Invitation
                </CardTitle>
                <CardDescription>
                  {error || "This invitation link is not valid or has expired."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push("/")}>
                  Go to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  B
                </span>
              </div>
              <span className="text-xl font-bold text-foreground">BREEQA</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">You&apos;re Invited!</CardTitle>
              <CardDescription>
                Join {invitation.organization?.name} on BREEQA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Organization Info */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary">
                    {invitation.organization?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">
                  {invitation.organization?.name}
                </h3>
                {invitation.organization?.description && (
                  <p className="text-sm text-muted-foreground">
                    {invitation.organization.description}
                  </p>
                )}
              </div>

              {/* Invitation Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">
                    Email
                  </span>
                  <span className="text-sm">{invitation.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">
                    Role
                  </span>
                  <span className="text-sm capitalize font-medium">
                    {invitation.role}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Invited by
                  </span>
                  <span className="text-sm">
                    {invitation.inviter?.full_name || invitation.inviter?.email}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {!isAuthenticated ? (
                <div className="space-y-3">
                  <Button className="w-full" onClick={handleSignIn}>
                    Sign In to Accept
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/auth")}
                  >
                    Create Account
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleAcceptInvitation}
                  disabled={isAccepting}
                >
                  {isAccepting ? "Accepting..." : "Accept Invitation"}
                </Button>
              )}

              {/* Terms */}
              <p className="text-xs text-muted-foreground text-center">
                By accepting this invitation, you agree to our{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
