import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle, Bell } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUserNotifications } from "@/hooks/useUserNotifications";

interface Submission {
  id: string;
  name: string;
  course: string;
  call_up: string;
  state_of_origin: string;
  state_of_choices: string;
  service_type: string | null;
  calculated_amount: number | null;
  status: string;
  payment_verified: boolean;
  payment_proof_url: string | null;
  remarks: string | null;
  created_at: string;
}

const Submissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { notifications } = useUserNotifications();

  useEffect(() => {
    checkAuth();
    fetchSubmissions();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "in_progress":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const pendingSubmissions = submissions.filter(s => s.status === "pending");
  const unverifiedPayments = submissions.filter(s => !s.payment_verified);
  const hasNewRemarks = submissions.filter(s => s.remarks && s.remarks.trim() !== "");

  const filteredSubmissions = submissions.filter(sub =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.call_up.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.state_of_origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.state_of_choices.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sub.service_type && sub.service_type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const hasActionRequired = pendingSubmissions.length > 0 || unverifiedPayments.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-foreground">My Submissions</h1>
            {hasActionRequired && (
              <Badge variant="destructive" className="animate-pulse">
                <Bell className="h-3 w-3 mr-1" />
                Action Required
              </Badge>
            )}
          </div>
          <div className="space-x-4">
            <Button 
              onClick={() => navigate("/support")} 
              variant="outline"
              className="relative"
            >
              Contact Support
              {notifications.unreadMessages > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                >
                  {notifications.unreadMessages}
                </Badge>
              )}
            </Button>
            <Button onClick={() => navigate("/")} variant="outline">
              New Submission
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              Logout
            </Button>
          </div>
        </div>

        {hasActionRequired && (
          <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-600">Pending Actions</AlertTitle>
            <AlertDescription className="flex flex-col gap-1 text-yellow-600">
              {pendingSubmissions.length > 0 && (
                <span>• {pendingSubmissions.length} submission{pendingSubmissions.length > 1 ? 's' : ''} pending review</span>
              )}
              {unverifiedPayments.length > 0 && (
                <span>• {unverifiedPayments.length} payment{unverifiedPayments.length > 1 ? 's' : ''} awaiting verification</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {hasNewRemarks.length > 0 && (
          <Alert className="mb-6 border-blue-500/50 bg-blue-500/10">
            <Bell className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-600">New Updates</AlertTitle>
            <AlertDescription className="text-blue-600">
              You have {hasNewRemarks.length} submission{hasNewRemarks.length > 1 ? 's' : ''} with admin remarks. Check the remarks column below.
            </AlertDescription>
          </Alert>
        )}

        {submissions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">You haven't submitted any applications yet.</p>
              <Button onClick={() => navigate("/")}>Submit Your First Application</Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Your NYSC Submissions</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search submissions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>State of Origin</TableHead>
                    <TableHead>State of Choice</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                        No submissions found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>{submission.name}</TableCell>
                      <TableCell>{submission.course}</TableCell>
                      <TableCell className="capitalize">
                        {submission.service_type?.replace('_', ' ') || '-'}
                      </TableCell>
                      <TableCell>
                        {submission.calculated_amount ? `₦${submission.calculated_amount.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell>{submission.state_of_origin}</TableCell>
                      <TableCell>{submission.state_of_choices}</TableCell>
                      <TableCell>
                        <Badge className={submission.payment_verified ? "bg-green-500" : "bg-yellow-500"}>
                          {submission.payment_verified ? "Verified" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {submission.remarks ? (
                          <span className="text-sm">{submission.remarks}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(submission.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Submissions;
