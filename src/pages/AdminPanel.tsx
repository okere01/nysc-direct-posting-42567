import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
  admin_notes: string | null;
  created_at: string;
  user_id: string;
  nysc_email: string | null;
  nysc_password: string | null;
}

interface SupportMessage {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  role: string;
}

const AdminPanel = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [remarks, setRemarks] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState("");
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [messageResponse, setMessageResponse] = useState("");
  const [messageStatus, setMessageStatus] = useState("");
  const [submissionsSearch, setSubmissionsSearch] = useState("");
  const [messagesSearch, setMessagesSearch] = useState("");
  const [usersSearch, setUsersSearch] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!roleLoading) {
      if (!isAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/");
      } else {
        checkAuth();
        fetchAllSubmissions();
        fetchSupportMessages();
        fetchUsers();
      }
    }
  }, [isAdmin, roleLoading]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchAllSubmissions = async () => {
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

  const fetchSupportMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSupportMessages(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load support messages",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          full_name,
          created_at,
          user_roles!inner(role)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const formattedUsers = data?.map((user: any) => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at,
        role: user.user_roles?.role || 'user'
      })) || [];
      
      setUsers(formattedUsers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          remarks,
          admin_notes: adminNotes,
          status,
          payment_verified: paymentVerified,
        })
        .eq("id", selectedSubmission.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Submission updated successfully",
      });

      fetchAllSubmissions();
      setSelectedSubmission(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update submission",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setRemarks(submission.remarks || "");
    setAdminNotes(submission.admin_notes || "");
    setStatus(submission.status);
    setPaymentVerified(submission.payment_verified);
  };

  const openMessageDialog = (message: SupportMessage) => {
    setSelectedMessage(message);
    setMessageResponse(message.admin_response || "");
    setMessageStatus(message.status);
  };

  const handleUpdateMessage = async () => {
    if (!selectedMessage) return;

    try {
      const { error } = await supabase
        .from("support_messages")
        .update({
          admin_response: messageResponse,
          status: messageStatus,
        })
        .eq("id", selectedMessage.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message updated successfully",
      });

      fetchSupportMessages();
      setSelectedMessage(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive",
      });
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

  const filteredSubmissions = submissions.filter(sub => 
    sub.name.toLowerCase().includes(submissionsSearch.toLowerCase()) ||
    sub.call_up.toLowerCase().includes(submissionsSearch.toLowerCase()) ||
    sub.course.toLowerCase().includes(submissionsSearch.toLowerCase()) ||
    sub.state_of_origin.toLowerCase().includes(submissionsSearch.toLowerCase()) ||
    sub.state_of_choices.toLowerCase().includes(submissionsSearch.toLowerCase()) ||
    (sub.nysc_email && sub.nysc_email.toLowerCase().includes(submissionsSearch.toLowerCase()))
  );

  const filteredMessages = supportMessages.filter(msg =>
    msg.subject.toLowerCase().includes(messagesSearch.toLowerCase()) ||
    msg.message.toLowerCase().includes(messagesSearch.toLowerCase()) ||
    (msg.admin_response && msg.admin_response.toLowerCase().includes(messagesSearch.toLowerCase()))
  );

  const filteredUsers = users.filter(user =>
    (user.email && user.email.toLowerCase().includes(usersSearch.toLowerCase())) ||
    (user.full_name && user.full_name.toLowerCase().includes(usersSearch.toLowerCase())) ||
    user.role.toLowerCase().includes(usersSearch.toLowerCase())
  );

  if (loading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Don't render anything for non-admins (they'll be redirected)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header Section */}
        <div className="bg-card border rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage NYSC submissions, support messages, and user accounts</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button onClick={() => navigate("/submissions")} variant="outline" size="sm">
                My Submissions
              </Button>
              <Button onClick={handleLogout} variant="destructive" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold">{submissions.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verified Payments</p>
                  <p className="text-2xl font-bold">{submissions.filter(s => s.payment_verified).length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Support Messages</p>
                  <p className="text-2xl font-bold">{supportMessages.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="submissions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6">
            <TabsTrigger value="submissions" className="text-xs sm:text-sm">NYSC Submissions</TabsTrigger>
            <TabsTrigger value="support" className="text-xs sm:text-sm">Support Messages</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions">
            <Card>
              <CardHeader className="p-4 md:p-6 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-lg md:text-xl mb-1">All NYSC Submissions</CardTitle>
                    <p className="text-sm text-muted-foreground">Manage and review all NYSC application submissions</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search submissions..."
                      value={submissionsSearch}
                      onChange={(e) => setSubmissionsSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 md:p-6">
                <ScrollArea className="w-full h-[calc(100vh-350px)]">
                  <div className="min-w-[1600px]">
                    <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Call Up Number</TableHead>
                      <TableHead className="font-semibold">Course</TableHead>
                      <TableHead className="font-semibold">NYSC Email</TableHead>
                      <TableHead className="font-semibold">NYSC Password</TableHead>
                      <TableHead className="font-semibold">Service Type</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">State of Origin</TableHead>
                      <TableHead className="font-semibold">State of Choice</TableHead>
                       <TableHead className="font-semibold">Payment</TableHead>
                       <TableHead className="font-semibold">Proof</TableHead>
                       <TableHead className="font-semibold">Status</TableHead>
                       <TableHead className="font-semibold">Remarks</TableHead>
                      <TableHead className="font-semibold">Submitted Date</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{submission.name}</TableCell>
                        <TableCell className="font-mono text-sm">{submission.call_up}</TableCell>
                        <TableCell>{submission.course}</TableCell>
                        <TableCell className="text-sm">{submission.nysc_email || '-'}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {submission.nysc_password ? '••••••••' : '-'}
                        </TableCell>
                        <TableCell className="capitalize">
                          <Badge variant="outline" className="font-normal">
                            {submission.service_type?.replace('_', ' ') || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
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
                           {submission.payment_proof_url ? (
                             <a 
                               href={submission.payment_proof_url} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="text-primary hover:underline text-sm"
                             >
                               View
                             </a>
                           ) : (
                             <span className="text-muted-foreground text-sm">No proof</span>
                           )}
                         </TableCell>
                         <TableCell>
                           <Badge className={getStatusColor(submission.status)}>
                             {submission.status}
                           </Badge>
                         </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {submission.remarks || "-"}
                        </TableCell>
                        <TableCell>
                          {new Date(submission.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button onClick={() => openEditDialog(submission)} size="sm">
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader className="pb-4 border-b">
                                <DialogTitle className="text-xl">Update Submission - {submission.name}</DialogTitle>
                                <DialogDescription>
                                  Review and manage NYSC submission details, payment verification, and status updates.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6 py-4">
                                {/* Personal Information Section */}
                                <div className="space-y-3">
                                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary"></span>
                                    Personal Information
                                  </h3>
                                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border">
                                    <div>
                                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Full Name</Label>
                                      <p className="text-sm font-medium mt-1">{submission.name}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Call Up Number</Label>
                                      <p className="text-sm font-mono font-medium mt-1">{submission.call_up}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Course of Study</Label>
                                      <p className="text-sm font-medium mt-1">{submission.course}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Service Type</Label>
                                      <p className="text-sm font-medium capitalize mt-1">
                                        <Badge variant="outline">{submission.service_type?.replace('_', ' ') || '-'}</Badge>
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">State of Origin</Label>
                                      <p className="text-sm font-medium mt-1">{submission.state_of_origin}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">State of Choice</Label>
                                      <p className="text-sm font-medium mt-1">{submission.state_of_choices}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* NYSC Credentials Section */}
                                <div className="space-y-3">
                                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary"></span>
                                    NYSC Portal Credentials
                                  </h3>
                                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border">
                                    <div>
                                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">NYSC Email</Label>
                                      <p className="text-sm font-medium mt-1 break-all">{submission.nysc_email || '-'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">NYSC Password</Label>
                                      <p className="text-sm font-mono mt-1">{submission.nysc_password || '-'}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Payment Information Section */}
                                <div className="space-y-3">
                                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary"></span>
                                    Payment Information
                                  </h3>
                                  <div className="p-4 bg-muted/50 rounded-lg border">
                                    <div className="flex items-center justify-between mb-2">
                                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Calculated Amount</Label>
                                      <p className="text-lg font-bold text-primary">
                                        {submission.calculated_amount ? `₦${submission.calculated_amount.toLocaleString()}` : '-'}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Status Management Section */}
                                <div className="space-y-3 pt-2 border-t">
                                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary"></span>
                                    Status Management
                                  </h3>
                                  <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="status">Application Status</Label>
                                  <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="payment">Payment Verification</Label>
                                      <Select 
                                        value={paymentVerified ? "verified" : "pending"} 
                                        onValueChange={(val) => setPaymentVerified(val === "verified")}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select payment status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Pending Verification</SelectItem>
                                          <SelectItem value="verified">Verified</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>

                                {/* Payment Proof Section */}
                                {submission.payment_proof_url && (
                                  <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                      <span className="h-1 w-1 rounded-full bg-primary"></span>
                                      Payment Proof
                                    </h3>
                                    <div className="border rounded-lg p-4 bg-background">
                                      <img 
                                        src={submission.payment_proof_url} 
                                        alt="Payment proof" 
                                        className="max-w-full h-auto rounded-md shadow-sm"
                                        onError={(e) => {
                                          e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" dy=".3em">Unable to load image</text></svg>';
                                        }}
                                      />
                                      <a 
                                        href={submission.payment_proof_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline mt-3 inline-flex items-center gap-1"
                                      >
                                        Open in new tab →
                                      </a>
                                    </div>
                                  </div>
                                )}

                                {/* Notes Section */}
                                <div className="space-y-3 pt-2 border-t">
                                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary"></span>
                                    Notes & Remarks
                                  </h3>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="remarks" className="text-sm font-medium">
                                        User Remarks 
                                        <span className="text-xs text-muted-foreground font-normal ml-1">(Visible to user)</span>
                                      </Label>
                                      <Textarea
                                        id="remarks"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="Enter remarks that will be visible to the user..."
                                        rows={3}
                                        className="resize-none"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="adminNotes" className="text-sm font-medium">
                                        Internal Admin Notes 
                                        <span className="text-xs text-muted-foreground font-normal ml-1">(Private - Admin only)</span>
                                      </Label>
                                      <Textarea
                                        id="adminNotes"
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Internal notes for admin reference only..."
                                        rows={3}
                                        className="resize-none"
                                      />
                                    </div>
                                  </div>
                                </div>

                                 <Button onClick={handleUpdateSubmission} className="w-full h-11 text-base font-medium">
                                   Save Changes
                                 </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support">
            <Card>
              <CardHeader className="p-4 md:p-6 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-lg md:text-xl mb-1">Support Messages</CardTitle>
                    <p className="text-sm text-muted-foreground">Manage and respond to user support requests</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search messages..."
                      value={messagesSearch}
                      onChange={(e) => setMessagesSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 md:p-6">
                <ScrollArea className="w-full h-[calc(100vh-350px)]">
                  <div className="min-w-[1000px]">
                    <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Subject</TableHead>
                      <TableHead className="font-semibold">Message Preview</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Admin Response</TableHead>
                      <TableHead className="font-semibold">Date Submitted</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMessages.map((msg) => (
                      <TableRow key={msg.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{msg.subject}</TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate text-sm text-muted-foreground">{msg.message}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(msg.status)}>
                            {msg.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate text-sm text-muted-foreground">
                            {msg.admin_response || "No response yet"}
                          </p>
                        </TableCell>
                        <TableCell>
                          {new Date(msg.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button onClick={() => openMessageDialog(msg)} size="sm">
                                Respond
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader className="pb-4 border-b">
                                <DialogTitle className="text-xl">Support Message Response</DialogTitle>
                                <DialogDescription>
                                  Review the user's support request and provide a detailed response.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6 py-4">
                                {/* Message Information */}
                                <div className="space-y-3">
                                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary"></span>
                                    Message Details
                                  </h3>
                                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                                    <div>
                                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Subject</Label>
                                      <p className="text-sm font-semibold mt-1">{msg.subject}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">User Message</Label>
                                      <p className="text-sm p-3 bg-background rounded-md mt-1 whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Submitted On</Label>
                                      <p className="text-sm mt-1">
                                        {new Date(msg.created_at).toLocaleDateString('en-US', { 
                                          year: 'numeric', 
                                          month: 'long', 
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Status Management */}
                                <div className="space-y-3 pt-2 border-t">
                                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary"></span>
                                    Status & Response
                                  </h3>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="messageStatus">Message Status</Label>
                                      <Select value={messageStatus} onValueChange={setMessageStatus}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="open">Open - New Request</SelectItem>
                                          <SelectItem value="in_progress">In Progress - Being Reviewed</SelectItem>
                                          <SelectItem value="resolved">Resolved - Issue Fixed</SelectItem>
                                          <SelectItem value="closed">Closed - No Further Action</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="messageResponse" className="text-sm font-medium">
                                        Admin Response
                                      </Label>
                                      <Textarea
                                        id="messageResponse"
                                        value={messageResponse}
                                        onChange={(e) => setMessageResponse(e.target.value)}
                                        placeholder="Type your detailed response to the user's inquiry..."
                                        rows={6}
                                        className="resize-none"
                                      />
                                      <p className="text-xs text-muted-foreground">This response will be visible to the user</p>
                                    </div>
                                  </div>
                                </div>

                                <Button onClick={handleUpdateMessage} className="w-full h-11 text-base font-medium">
                                  Send Response & Update Status
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader className="p-4 md:p-6 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-lg md:text-xl mb-1">Registered Users</CardTitle>
                    <p className="text-sm text-muted-foreground">View and manage all registered users in the system</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      value={usersSearch}
                      onChange={(e) => setUsersSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 md:p-6">
                <ScrollArea className="w-full h-[calc(100vh-350px)]">
                  <div className="min-w-[900px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Email Address</TableHead>
                          <TableHead className="font-semibold">Full Name</TableHead>
                          <TableHead className="font-semibold">Role</TableHead>
                          <TableHead className="font-semibold">Registration Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{user.email || '-'}</TableCell>
                            <TableCell>{user.full_name || 'Not provided'}</TableCell>
                            <TableCell>
                              <Badge className={user.role === 'admin' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-blue-500 hover:bg-blue-600'}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
