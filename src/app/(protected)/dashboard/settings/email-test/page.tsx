"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOrganization } from "@/lib/contexts/organization-context";
import { usePermission } from "@/lib/contexts/organization-context";

export default function EmailTestPage() {
  const { currentOrganization } = useOrganization();
  const canInviteUsers = usePermission("users:invite");
  const [testEmail, setTestEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: testEmail }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: "Failed to send test email",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEmailPreview = () => {
    window.open("/api/email-preview/invitation", "_blank");
  };

  if (!canInviteUsers) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Email Test</h1>
        <p className="text-muted-foreground">
          Test your email configuration and preview invitation emails.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Test Email */}
        <Card>
          <CardHeader>
            <CardTitle>Send Test Email</CardTitle>
            <CardDescription>
              Send a test email to verify your Resend configuration is working.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testEmail">Email Address</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="your-email@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" disabled={isLoading || !testEmail.trim()}>
                {isLoading ? "Sending..." : "Send Test Email"}
              </Button>
            </form>

            {result && (
              <div className="mt-4 p-4 rounded-lg border">
                {result.success ? (
                  <div className="text-green-600">
                    <p className="font-medium">✅ {result.message}</p>
                    <p className="text-sm mt-1">
                      Check your email inbox for the test message.
                    </p>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <p className="font-medium">❌ {result.error}</p>
                    <p className="text-sm mt-1">
                      Check your environment variables and Resend configuration.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Email Preview</CardTitle>
            <CardDescription>
              Preview how invitation emails will look to your team members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the button below to open the invitation email preview in a
                new tab.
              </p>

              <Button onClick={openEmailPreview} variant="outline">
                Preview Invitation Email
              </Button>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Preview shows sample data</p>
                <p>• Actual emails will use real organization and user data</p>
                <p>• Styling matches your brand colors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Status</CardTitle>
          <CardDescription>
            Check your email service configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Resend API Key</span>
              <span className="text-sm text-yellow-600">
                ⚠️ Server-side only
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Site URL</span>
              <span
                className={`text-sm ${
                  process.env.NEXT_PUBLIC_SITE_URL
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {process.env.NEXT_PUBLIC_SITE_URL ? "✅ Set" : "❌ Missing"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Organization</span>
              <span
                className={`text-sm ${
                  currentOrganization ? "text-green-600" : "text-red-600"
                }`}
              >
                {currentOrganization ? "✅ Active" : "❌ None"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
