import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SubmissionForm } from "@/components/SubmissionForm";
import { PricingTable } from "@/components/PricingTable";
import { Shield, CheckCircle, Clock, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useUserNotifications } from "@/hooks/useUserNotifications";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { notifications } = useUserNotifications();

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 animate-fade-in min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-white p-1 shadow-md transition-transform hover:scale-105">
                <img 
                  src="/nysc-logo.png" 
                  alt="NYSC Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground tracking-tight truncate">NYSC Direct Posting</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Secure Application Portal</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  <Button 
                    onClick={() => navigate("/support")} 
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex relative"
                  >
                    Support
                    {notifications.unreadMessages > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                      >
                        {notifications.unreadMessages}
                      </Badge>
                    )}
                  </Button>
                  <Button 
                    onClick={() => navigate("/submissions")} 
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm relative"
                  >
                    <span className="hidden sm:inline">Submissions</span>
                    <span className="sm:hidden">📋</span>
                    {(notifications.pendingSubmissions > 0 || notifications.unverifiedPayments > 0) && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                      >
                        {notifications.pendingSubmissions + notifications.unverifiedPayments}
                      </Badge>
                    )}
                  </Button>
                  {notifications.totalAlerts > 0 && (
                    <div className="md:hidden">
                      <Button 
                        onClick={() => navigate("/support")} 
                        variant="ghost"
                        size="sm"
                        className="relative"
                      >
                        <Bell className="h-4 w-4" />
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                        >
                          {notifications.totalAlerts}
                        </Badge>
                      </Button>
                    </div>
                  )}
                  <Button 
                    onClick={handleLogout} 
                    variant="ghost"
                    size="sm"
                    className="text-xs sm:text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => navigate("/auth")}
                  size="sm"
                  className="shadow-sm text-xs sm:text-sm px-4 sm:px-6"
                >
                  <span className="hidden xs:inline">Login / Sign Up</span>
                  <span className="xs:hidden">Login</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        {!isAuthenticated ? (
          <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
            {/* Hero Section */}
            <div className="text-center space-y-6 sm:space-y-8 animate-fade-up px-4">
              <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/20 text-primary px-4 py-2 rounded-full text-xs sm:text-sm font-medium animate-scale-in">
                <span className="text-lg">🎓</span>
                <span>Professional NYSC Services</span>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
                  Apply for NYSC<br className="sm:hidden" /> Direct Posting
                </h2>
                <p className="text-xl sm:text-2xl md:text-3xl font-semibold">
                  <span className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                    PPA Posting, Relocation & More
                  </span>
                </p>
              </div>
              
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Submit your application with ease. Our secure platform ensures your information is handled professionally with fast processing times.
              </p>
              
              <div className="pt-4">
                <Button 
                  onClick={() => navigate("/auth")} 
                  size="lg" 
                  className="text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-7 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 font-semibold"
                >
                  Get Started Now
                  <span className="ml-2">→</span>
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 px-4">
              <div className="group relative bg-card rounded-2xl p-6 sm:p-8 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative space-y-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg sm:text-xl text-foreground">Easy Application</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Simple form process with step-by-step guidance
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative bg-card rounded-2xl p-6 sm:p-8 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative space-y-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg sm:text-xl text-foreground">Secure & Private</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your information is encrypted and protected
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative bg-card rounded-2xl p-6 sm:p-8 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative space-y-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg sm:text-xl text-foreground">Quick Processing</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Fast approval and professional service
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 animate-fade-up">
            <div className="text-center space-y-4 px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Submit Your Application
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Complete the form below with accurate information. Review our pricing table before proceeding.
              </p>
            </div>

            {/* Mobile: Tabs to reduce clutter */}
            <div className="md:hidden">
              <Tabs defaultValue="pricing" className="w-full">
                <TabsList className="grid grid-cols-2 w-full rounded-xl">
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="apply">Apply</TabsTrigger>
                </TabsList>
                <TabsContent value="pricing" className="mt-4">
                  <div className="animate-fade-in">
                    <PricingTable />
                  </div>
                </TabsContent>
                <TabsContent value="apply" className="mt-4">
                  <div className="animate-slide-in-right">
                    <SubmissionForm />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Desktop / Tablet: vertical layout with pricing on top */}
            <div className="hidden md:block space-y-6 sm:space-y-8">
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
      <footer className="border-t border-border/20 mt-16 sm:mt-20 md:mt-24">
        <div className="container mx-auto px-4 sm:px-6 py-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © {new Date().getFullYear()} NYSC Direct Posting Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
