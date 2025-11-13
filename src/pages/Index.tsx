import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SubmissionForm } from "@/components/SubmissionForm";
import { PricingTable } from "@/components/PricingTable";
import { Shield, CheckCircle, Clock } from "lucide-react";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">NYSC Direct Posting</h1>
                <p className="text-sm text-muted-foreground">Secure Application Portal</p>
              </div>
            </div>
            <div className="flex gap-4">
              {isAuthenticated ? (
                <>
                  <Button onClick={() => navigate("/support")} variant="outline">
                    Contact Support
                  </Button>
                  <Button onClick={() => navigate("/submissions")} variant="outline">
                    My Submissions
                  </Button>
                  <Button onClick={handleLogout} variant="destructive">
                    Logout
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate("/auth")}>
                  Login / Sign Up
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!isAuthenticated ? (
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Apply for NYSC Direct Posting, PPA Posting, Relocation and More
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Submit your application for NYSC direct posting with ease. Our secure platform ensures your information is handled professionally.
              </p>
              <Button onClick={() => navigate("/auth")} size="lg" className="text-lg px-8 py-6">
                Login or Sign Up to Apply
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="flex flex-col items-center gap-3 p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Easy Application</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Fill out a simple form with your details
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Secure & Private</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Your information is encrypted and protected
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Quick Processing</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Fast application processing and confirmation
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <PricingTable />
            <div className="max-w-2xl mx-auto">
              <SubmissionForm />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 NYSC Direct Posting Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
