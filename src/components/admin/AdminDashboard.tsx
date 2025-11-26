import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { FileText, MessageSquare, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityLog } from "@/components/admin/ActivityLog";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    verifiedPayments: 0,
    pendingSubmissions: 0,
    totalMessages: 0,
    openMessages: 0,
    closedMessages: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [submissions, messages, users] = await Promise.all([
        supabase.from("submissions").select("*", { count: "exact" }),
        supabase.from("support_messages").select("*", { count: "exact" }),
        supabase.from("profiles").select("*", { count: "exact" }),
      ]);

      const verifiedPayments = submissions.data?.filter(s => s.payment_verified === true).length || 0;
      const pendingSubmissions = submissions.data?.filter(s => s.status === "pending").length || 0;
      const openMessages = messages.data?.filter(m => m.status === "open").length || 0;
      const closedMessages = messages.data?.filter(m => m.status === "closed").length || 0;

      setStats({
        totalSubmissions: submissions.count || 0,
        verifiedPayments,
        pendingSubmissions,
        totalMessages: messages.count || 0,
        openMessages,
        closedMessages,
        totalUsers: users.count || 0,
      });
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Submissions",
      value: stats.totalSubmissions,
      icon: FileText,
      description: "All NYSC submissions",
      color: "text-blue-600",
    },
    {
      title: "Verified Payments",
      value: stats.verifiedPayments,
      icon: CheckCircle,
      description: "Payments confirmed",
      color: "text-green-600",
    },
    {
      title: "Pending Submissions",
      value: stats.pendingSubmissions,
      icon: Clock,
      description: "Awaiting review",
      color: "text-yellow-600",
    },
    {
      title: "Support Messages",
      value: stats.totalMessages,
      icon: MessageSquare,
      description: "Total inquiries",
      color: "text-purple-600",
    },
    {
      title: "Open Messages",
      value: stats.openMessages,
      icon: AlertCircle,
      description: "Needs response",
      color: "text-orange-600",
    },
    {
      title: "Registered Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Total user accounts",
      color: "text-indigo-600",
    },
  ];

  return (
    <ScrollArea className="h-screen">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of your NYSC management system
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Verification Rate</span>
                  <span className="text-sm font-semibold">
                    {stats.totalSubmissions > 0 
                      ? Math.round((stats.verifiedPayments / stats.totalSubmissions) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Response Rate</span>
                  <span className="text-sm font-semibold">
                    {stats.totalMessages > 0
                      ? Math.round((stats.closedMessages / stats.totalMessages) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Submissions per User</span>
                  <span className="text-sm font-semibold">
                    {stats.totalUsers > 0
                      ? (stats.totalSubmissions / stats.totalUsers).toFixed(1)
                      : 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <ActivityLog limit={10} />
        </div>
      </div>
    </ScrollArea>
  );
}
