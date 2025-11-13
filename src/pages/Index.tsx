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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">NYSC Direct Posting</h1>
                <p className="text-xs md:text-sm text-muted-foreground">Secure Application Portal</p>
              </div>
            </div>
            <div className="flex gap-2 md:gap-3">
              {isAuthenticated ? (
                <>
                  <Button 
                    onClick={() => navigate("/support")} 
                    variant="outline"
                    className="hidden sm:flex transition-all hover:scale-105"
                  >
                    Contact Support
                  </Button>
                  <Button 
                    onClick={() => navigate("/submissions")} 
                    variant="outline"
                    className="transition-all hover:scale-105"
                  >
                    <span className="hidden sm:inline">My Submissions</span>
                    <span className="sm:hidden">Submissions</span>
                  </Button>
                  <Button 
                    onClick={handleLogout} 
                    variant="destructive"
                    className="transition-all hover:scale-105"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => navigate("/auth")}
                  className="transition-all hover:scale-105 shadow-lg"
                >
                  Login / Sign Up
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8 md:py-16">
        {!isAuthenticated ? (
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6 animate-fade-up">
              <div className="inline-block">
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4 animate-scale-in">
                  🎓 Professional NYSC Services
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Apply for NYSC Direct Posting,<br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  PPA Posting, Relocation
                </span> and More
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Submit your application with ease. Our secure platform ensures your information is handled professionally with fast processing times.
              </p>
              <Button 
                onClick={() => navigate("/auth")} 
                size="lg" 
                className="text-base md:text-lg px-6 md:px-10 py-5 md:py-7 shadow-xl hover:shadow-2xl transition-all hover:scale-105 bg-gradient-to-r from-primary to-primary/90"
              >
                Get Started Now →
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-12 md:mt-16">
              <div className="group flex flex-col items-center gap-4 p-6 md:p-8 bg-card rounded-2xl border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-base md:text-lg text-foreground">Easy Application</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Simple form process with step-by-step guidance
                </p>
              </div>

              <div className="group flex flex-col items-center gap-4 p-6 md:p-8 bg-card rounded-2xl border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Secure & Private</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Your information is encrypted and protected
                </p>
              </div>

              <div className="group flex flex-col items-center gap-4 p-6 md:p-8 bg-card rounded-2xl border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-base md:text-lg text-foreground">Quick Processing</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Fast approval and professional service
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
            <div className="text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                Submit Your Application
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Complete the form below with accurate information. Review our pricing table before proceeding.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-start">
              <div className="animate-fade-in">
                <PricingTable />
              </div>
              <div className="animate-slide-in-right">
                <SubmissionForm />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-6 md:py-8 text-center">
          <p className="text-xs md:text-sm text-muted-foreground">
            © {new Date().getFullYear()} NYSC Direct Posting Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
