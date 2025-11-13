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
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 animate-fade-in min-w-0 flex-shrink">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 flex-shrink-0">
                <Shield className="w-5 h-5 sm:w-7 sm:h-7 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-xl md:text-2xl font-bold text-foreground truncate">NYSC Direct Posting</h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground hidden xs:block">Secure Portal</p>
              </div>
            </div>
            <div className="flex gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  <Button 
                    onClick={() => navigate("/support")} 
                    variant="outline"
                    size="sm"
                    className="hidden lg:flex transition-all hover:scale-105"
                  >
                    Support
                  </Button>
                  <Button 
                    onClick={() => navigate("/submissions")} 
                    variant="outline"
                    size="sm"
                    className="transition-all hover:scale-105 text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">Submissions</span>
                    <span className="sm:hidden">📋</span>
                  </Button>
                  <Button 
                    onClick={handleLogout} 
                    variant="destructive"
                    size="sm"
                    className="transition-all hover:scale-105 text-xs sm:text-sm px-2 sm:px-4"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => navigate("/auth")}
                  size="sm"
                  className="transition-all hover:scale-105 shadow-lg text-xs sm:text-sm px-3 sm:px-6"
                >
                  <span className="hidden sm:inline">Login / Sign Up</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 md:py-16">
        {!isAuthenticated ? (
          <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-4 sm:space-y-6 animate-fade-up">
              <div className="inline-block">
                <div className="bg-primary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4 animate-scale-in">
                  🎓 Professional NYSC Services
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight px-2">
                Apply for NYSC Direct Posting,<br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  PPA Posting, Relocation
                </span> and More
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                Submit your application with ease. Our secure platform ensures your information is handled professionally with fast processing times.
              </p>
              <Button 
                onClick={() => navigate("/auth")} 
                size="lg" 
                className="text-sm sm:text-base md:text-lg px-5 sm:px-6 md:px-10 py-4 sm:py-5 md:py-7 shadow-xl hover:shadow-2xl transition-all hover:scale-105 bg-gradient-to-r from-primary to-primary/90"
              >
                Get Started Now →
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-8 sm:mt-12 md:mt-16">
              <div className="group flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 md:p-8 bg-card rounded-2xl border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base md:text-lg text-foreground text-center">Easy Application</h3>
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  Simple form process with step-by-step guidance
                </p>
              </div>

              <div className="group flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 md:p-8 bg-card rounded-2xl border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base md:text-lg text-foreground text-center">Secure & Private</h3>
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  Your information is encrypted and protected
                </p>
              </div>

              <div className="group flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 md:p-8 bg-card rounded-2xl border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <Clock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base md:text-lg text-foreground text-center">Quick Processing</h3>
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  Fast approval and professional service
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-up">
            <div className="text-center space-y-3 sm:space-y-4 px-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                Submit Your Application
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Complete the form below with accurate information. Review our pricing table before proceeding.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-start">
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
      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-12 sm:mt-16 md:mt-20">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 text-center">
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground px-2">
            © {new Date().getFullYear()} NYSC Direct Posting Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
