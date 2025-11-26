import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutDashboard, FileText, MessageSquare, Users, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth", { replace: true });
      }
    };

    if (!roleLoading) {
      if (!isAdmin) {
        toast.error("Access Denied", {
          description: "You don't have admin privileges",
        });
        navigate("/", { replace: true });
      } else {
        checkAuth();
      }
    }
  }, [isAdmin, roleLoading, navigate]);

  if (roleLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth", { replace: true });
  };

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/submissions", label: "Submissions", icon: FileText },
    { path: "/admin/messages", label: "Messages", icon: MessageSquare },
    { path: "/admin/users", label: "Users", icon: Users },
  ];

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "border-r bg-card transition-all duration-300 relative",
        collapsed ? "w-16" : "w-64"
      )}>
        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background p-0 shadow-md"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        <div className={cn("p-6 border-b", collapsed && "px-2")}>
          {!collapsed ? (
            <>
              <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
              <p className="text-sm text-muted-foreground mt-1">Management Portal</p>
            </>
          ) : (
            <div className="flex justify-center">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
        
        <ScrollArea className="h-[calc(100vh-180px)]">
          <nav className={cn("p-4 space-y-2", collapsed && "px-2")}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full",
                    collapsed ? "justify-center px-2" : "justify-start"
                  )}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                  {!collapsed && item.label}
                </Button>
              );
            })}
          </nav>
        </ScrollArea>

        <div className={cn("p-4 border-t", collapsed && "px-2")}>
          <Button
            variant="outline"
            className={cn(
              "w-full",
              collapsed ? "justify-center px-2" : "justify-start"
            )}
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
            {!collapsed && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
