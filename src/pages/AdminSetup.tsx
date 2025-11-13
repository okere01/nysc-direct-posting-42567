import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminSetup = () => {
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [hasAdmins, setHasAdmins] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [alreadyAdmin, setAlreadyAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      setIsAuthenticated(true);

      // Check if any admins exist
      const { data: adminCheck, error: adminCheckError } = await supabase
        .from("user_roles")
        .select("id")
        .eq("role", "admin")
        .maybeSingle();

      if (adminCheckError) {
        console.error("Error checking admin status:", adminCheckError);
        toast({
          title: "Error",
          description: "Failed to check admin status",
          variant: "destructive",
        });
        return;
      }

      setHasAdmins(!!adminCheck);

      // Check if current user is already an admin
      const { data: userRole, error: userRoleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (userRoleError) {
        console.error("Error checking user role:", userRoleError);
      }

      setAlreadyAdmin(!!userRole);
    } catch (error) {
      console.error("Error in checkAdminStatus:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const claimAdminAccess = async () => {
    try {
      setClaiming(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to claim admin access",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: session.user.id,
          role: "admin",
        });

      if (error) {
        console.error("Error claiming admin access:", error);
        toast({
          title: "Error",
          description: "Failed to claim admin access. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success!",
        description: "You are now an admin. Redirecting to admin panel...",
      });

      setTimeout(() => {
        navigate("/admin");
      }, 2000);
    } catch (error) {
      console.error("Error in claimAdminAccess:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              You must be logged in to access admin setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (alreadyAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Already an Admin
            </CardTitle>
            <CardDescription>
              You already have admin privileges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your account is already set up with admin access.
            </p>
            <Button onClick={() => navigate("/admin")} className="w-full">
              Go to Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasAdmins) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Admin Already Exists
            </CardTitle>
            <CardDescription>
              This system already has an administrator
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              An admin account has already been claimed. If you need admin access, please contact the existing administrator.
            </p>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Claim Admin Access
          </CardTitle>
          <CardDescription>
            Be the first administrator of this system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Full System Access</p>
                <p className="text-xs text-muted-foreground">
                  Manage all submissions and user applications
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Support Management</p>
                <p className="text-xs text-muted-foreground">
                  Respond to user support messages
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Payment Verification</p>
                <p className="text-xs text-muted-foreground">
                  Verify and approve payment proofs
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This action can only be performed once. The first user to claim admin access will become the system administrator.
            </p>
          </div>

          <Button 
            onClick={claimAdminAccess} 
            disabled={claiming}
            className="w-full"
            size="lg"
          >
            {claiming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Claiming Access...
              </>
            ) : (
              "Claim Admin Access"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
