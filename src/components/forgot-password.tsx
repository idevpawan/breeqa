"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail } from "lucide-react";

interface ForgotPasswordProps {
  onBack: () => void;
  returnUrl?: string;
}

export function ForgotPassword({
  onBack,
  returnUrl = "/dashboard",
}: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address");
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Send password reset email - Supabase will handle email validation internally
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery&returnUrl=${encodeURIComponent("/auth/reset-password")}`,
      });

      if (error) {
        // Check if it's a user not found error
        if (
          error.message.includes("User not found") ||
          error.message.includes("Invalid email")
        ) {
          // Don't reveal if email exists or not for security reasons
          // Just show a generic success message
          setIsEmailSent(true);
          toast({
            title: "Password reset email sent!",
            description:
              "If an account with this email exists, you'll receive password reset instructions.",
          });
        } else {
          setError(error.message);
          toast({
            title: "Password reset failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        setIsEmailSent(true);
        toast({
          title: "Password reset email sent!",
          description: `We've sent a password reset link to ${email}. Please check your inbox and follow the instructions.`,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-1 text-center mb-4">
          <p className="text-2xl font-semibold">Check your email</p>
          <p className="text-sm text-muted-foreground">
            We've sent password reset instructions to {email}
          </p>
        </div>

        <div className="text-center space-y-4">
          <div className="text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800">
            <div className="flex-col flex items-center justify-center space-x-2">
              <Mail className="w-8 mx-auto mb-2 h-8" />
              <span>
                Password reset email sent! Check your inbox for instructions.
              </span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Didn't receive the email? Check your spam folder or</p>
            <button
              onClick={() => {
                setIsEmailSent(false);
                setEmail("");
                setError(null);
              }}
              className="text-primary hover:underline"
            >
              try again
            </button>
          </div>

          <Button
            variant="outline"
            onClick={onBack}
            className="w-full"
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="space-y-1 text-center mb-4">
        <p className="text-2xl font-semibold">Forgot your password?</p>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="email"
            className="h-10"
          />
        </div>

        <Button
          type="submit"
          size="default"
          className="w-full h-10 text-base font-medium"
          disabled={isLoading}
        >
          <Mail className="w-4 h-4 mr-2" />
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="w-full"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Button>
      </form>
    </div>
  );
}
