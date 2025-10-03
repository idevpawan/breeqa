import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-destructive">
            Authentication Error
          </CardTitle>
          <CardDescription>
            There was an error signing you in. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            This could be due to:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• The authentication code has expired</li>
            <li>• The authentication was cancelled</li>
            <li>• There was a network error</li>
          </ul>
          <Button asChild className="w-full">
            <Link href="/auth">Try Again</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
