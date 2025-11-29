import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { FileText, MessageSquare, Users, CheckCircle, Clock, AlertCircle, Bell, Send, Eye, UserPlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityLog } from "@/components/admin/ActivityLog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    verifiedPayments: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
    totalMessages: 0,
    openMessages: 0,
    closedMessages: 0,
    totalUsers: 0,
  });
  const [submissionTrend, setSubmissionTrend] = useState<any[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [submissions, messages, users] = await Promise.all([
        supabase.from("submissions").select("*").order("created_at", { ascending: false }),
        supabase.from("support_messages").select("*", { count: "exact" }),
        supabase.from("profiles").select("*", { count: "exact" }),
      ]);

      const verifiedPayments = submissions.data?.filter(s => s.payment_verified === true).length || 0;
      const pendingSubmissions = submissions.data?.filter(s => s.status === "pending").length || 0;
      const approvedSubmissions = submissions.data?.filter(s => s.status === "approved").length || 0;
      const rejectedSubmissions = submissions.data?.filter(s => s.status === "rejected").length || 0;
      const openMessages = messages.data?.filter(m => m.status === "open").length || 0;
      const closedMessages = messages.data?.filter(m => m.status === "closed").length || 0;

      setStats({
        totalSubmissions: submissions.data?.length || 0,
        verifiedPayments,
        pendingSubmissions,
        approvedSubmissions,
        rejectedSubmissions,
        totalMessages: messages.count || 0,
        openMessages,
        closedMessages,
        totalUsers: users.count || 0,
      });

      // Calculate trend data for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const trendData = last7Days.map(date => {
        const daySubmissions = submissions.data?.filter(s => 
          s.created_at.startsWith(date)
        ).length || 0;
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          submissions: daySubmissions,
        };
      });

      setSubmissionTrend(trendData);
      setRecentSubmissions(submissions.data?.slice(0, 5) || []);
      setLoading(false);
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
      urgent: stats.pendingSubmissions > 0,
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
      urgent: stats.openMessages > 0,
    },
    {
      title: "Registered Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Total user accounts",
      color: "text-indigo-600",
    },
  ];

  const hasUnattendedRequests = stats.pendingSubmissions > 0 || stats.openMessages > 0;

  const statusData = [
    { name: 'Pending', value: stats.pendingSubmissions },
    { name: 'Approved', value: stats.approvedSubmissions },
    { name: 'Rejected', value: stats.rejectedSubmissions },
  ].filter(item => item.value > 0);

  const statusBarData = [
    { status: 'Pending', count: stats.pendingSubmissions },
    { status: 'Approved', count: stats.approvedSubmissions },
    { status: 'Rejected', count: stats.rejectedSubmissions },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <ScrollArea className="h-screen">
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Overview of your NYSC management system
              </p>
            </div>
            {hasUnattendedRequests && (
              <Badge variant="destructive" className="px-4 py-2 text-sm flex items-center gap-2 animate-pulse">
                <Bell className="h-4 w-4" />
                {stats.pendingSubmissions + stats.openMessages} Unattended
              </Badge>
            )}
          </div>
        </div>

        {hasUnattendedRequests && (
          <Alert variant="destructive" className="mb-6 border-red-500/50 bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Attention Required</AlertTitle>
            <AlertDescription className="flex flex-col gap-1">
              {stats.pendingSubmissions > 0 && (
                <span>• {stats.pendingSubmissions} pending submission{stats.pendingSubmissions > 1 ? 's' : ''} awaiting review</span>
              )}
              {stats.openMessages > 0 && (
                <span>• {stats.openMessages} open support message{stats.openMessages > 1 ? 's' : ''} need response</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="hover:shadow-lg transition-all cursor-pointer border-primary/20" onClick={() => navigate("/admin/submissions")}>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Review Pending</h3>
              <p className="text-2xl font-bold text-primary mb-1">{stats.pendingSubmissions}</p>
              <p className="text-xs text-muted-foreground">Submissions awaiting review</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all cursor-pointer border-primary/20" onClick={() => navigate("/admin/messages")}>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Messages</h3>
              <p className="text-2xl font-bold text-primary mb-1">{stats.openMessages}</p>
              <p className="text-xs text-muted-foreground">Open support messages</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all cursor-pointer border-primary/20" onClick={() => navigate("/admin/users")}>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Users</h3>
              <p className="text-2xl font-bold text-primary mb-1">{stats.totalUsers}</p>
              <p className="text-xs text-muted-foreground">Total registered users</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const isUrgent = 'urgent' in stat && stat.urgent;
            return (
              <Card 
                key={stat.title} 
                className={`hover:shadow-lg transition-shadow ${
                  isUrgent ? 'border-red-500 border-2 bg-red-500/5 relative' : ''
                }`}
              >
                {isUrgent && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 animate-pulse"
                  >
                    <Bell className="h-3 w-3 mr-1" />
                    Action Needed
                  </Badge>
                )}
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

        {/* Recent Activity Preview */}
        {recentSubmissions.length > 0 && (
          <Card className="mb-6 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Submissions</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/submissions")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.name}</TableCell>
                      <TableCell>{submission.service_type || "N/A"}</TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/submissions")}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Submission Trend (7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={submissionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="submissions" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Status Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statusBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))'
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
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
