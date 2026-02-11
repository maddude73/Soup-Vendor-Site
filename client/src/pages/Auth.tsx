import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Auth() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4 texture-grain">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-hand text-3xl font-bold mx-auto shadow-lg mb-2">
            S
          </div>
          <CardTitle className="font-display text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-base">
            Log in to manage your orders and save your favorites.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-8">
          <Button 
            className="w-full h-12 text-lg font-medium" 
            onClick={handleLogin}
            data-testid="button-auth-login"
          >
            Log In or Sign Up
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-4">
            By logging in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
