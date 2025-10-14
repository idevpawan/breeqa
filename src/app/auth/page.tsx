"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { ForgotPassword } from "@/components/forgot-password";
import { createClient } from "@/lib/supabase/client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, MailCheck } from "lucide-react";

function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationSent, setIsConfirmationSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(mode === "signup");

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${
            window.location.origin
          }/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}`,
        },
      });
      if (error) {
        console.error("Google login error:", error);
      }
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Validate password strength
        if (password.length < 6) {
          setError("Password must be at least 6 characters long");
          toast({
            title: "Error",
            description: "Password must be at least 6 characters long",
            variant: "destructive",
          });
          return;
        }

        // Validate full name
        if (!fullName.trim()) {
          setError("Please enter your full name");
          toast({
            title: "Error",
            description: "Please enter your full name",
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) {
          setError(error.message);
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setIsConfirmationSent(true);
          toast({
            title: "Confirmation email sent!",
            description: `We've sent a confirmation link to ${email}. Please check your inbox and click the link to verify your account.`,
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          // Redirect will be handled by middleware
          window.location.href = returnUrl;
        }
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <p className="absolute top-5 left-6 text-lg font-semibold">Breeqa.</p>
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Auth Section */}
        <div className="flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-sm space-y-8">
            {/* Show Forgot Password Component or Auth Card */}
            {isConfirmationSent ? (
              <div className="space-y-4">
                <div className="flex mx-auto w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/20 p-4 items-center justify-center">
                  <MailCheck className="w-10 h-10 mx-auto" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Verification email has been sent to your{" "}
                  <span className="font-bold text-primary">{email}</span>.
                  Please check your inbox and click the link to verify your
                  account.
                </p>
              </div>
            ) : showForgotPassword ? (
              <ForgotPassword
                onBack={() => setShowForgotPassword(false)}
                returnUrl={returnUrl}
              />
            ) : (
              <div className="border-0 shadow-none">
                <div className="space-y-1 text-center mb-4">
                  <p className="text-2xl font-semibold">
                    {isSignUp ? "Sign up" : "Login"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Login to your account to continue
                  </p>
                </div>
                <div className="space-y-4">
                  {/* Google Login */}
                  <Button
                    variant="outline"
                    className="w-full h-10 text-base font-medium hover:bg-muted/50 transition-colors"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  {error && <div className="text-red-500 text-sm">{error}</div>}

                  {/* Email Auth Form */}
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {isSignUp && (
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required={isSignUp}
                          disabled={isLoading}
                          autoComplete="off"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        autoComplete="off"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          autoComplete="off"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Forgot Password Link - Only show during login */}
                    {!isSignUp && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-sm text-primary hover:underline"
                          disabled={isLoading}
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <Button
                      type="submit"
                      size="default"
                      className="w-full h-10 text-base font-medium"
                      disabled={isLoading}
                    >
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      {isSignUp ? "Sign up with Email" : "Sign in with Email"}
                    </Button>
                  </form>

                  {/* Footer */}
                  <div className="text-center text-[10px] text-muted-foreground">
                    By continuing, you agree to our{" "}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </div>

                  {/* Toggle between sign up and sign in */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setEmail("");
                        setPassword("");
                        setFullName("");
                        setShowPassword(false);
                        setError(null);
                        setShowForgotPassword(false);
                        window.history.replaceState(
                          {},
                          "",
                          `${window.location.pathname}?${isSignUp ? "mode=login" : "mode=signup"}`
                        );
                      }}
                      className="text-sm text-primary cursor-pointer hover:underline"
                      disabled={isLoading}
                    >
                      {isSignUp
                        ? "Already have an account? Sign in"
                        : "Don't have an account? Sign up"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Branding Section */}
        <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12 bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-chart-1 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-chart-2 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-chart-3 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 text-center space-y-8 max-w-lg">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-3">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-3xl">
                  B
                </span>
              </div>
              <span className="text-4xl font-bold text-foreground">BREEQA</span>
            </div>

            {/* Tagline */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground leading-tight">
                Streamline Your Project Management
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Join thousands of teams already using BREEQA to collaborate
                efficiently, track progress in real-time, and deliver projects
                on time.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6 text-left">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
                  <span className="text-sm font-medium text-foreground">
                    Task Management
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                  <span className="text-sm font-medium text-foreground">
                    Team Collaboration
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
                  <span className="text-sm font-medium text-foreground">
                    Progress Tracking
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-chart-4 rounded-full"></div>
                  <span className="text-sm font-medium text-foreground">
                    Deadline Alerts
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-chart-5 rounded-full"></div>
                  <span className="text-sm font-medium text-foreground">
                    Analytics Dashboard
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
                  <span className="text-sm font-medium text-foreground">
                    Real-time Updates
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-1">10K+</div>
                <div className="text-sm text-muted-foreground">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-2">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-3">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
