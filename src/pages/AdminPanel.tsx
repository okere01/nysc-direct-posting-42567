import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const AdminPanel = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [remarks, setRemarks] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState("");
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [messageResponse, setMessageResponse] = useState("");
  const [messageStatus, setMessageStatus] = useState("");
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

  if (loading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Admin Panel</h1>
          <div className="space-x-4">
            <Button onClick={() => navigate("/submissions")} variant="outline">
              My Submissions
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="submissions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="submissions">NYSC Submissions</TabsTrigger>
            <TabsTrigger value="support">Support Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>All NYSC Submissions</CardTitle>
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
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
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Update Submission - {submission.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="status">Status</Label>
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
                                  <Label htmlFor="payment">Payment Status</Label>
                                  <Select 
                                    value={paymentVerified ? "verified" : "pending"} 
                                    onValueChange={(val) => setPaymentVerified(val === "verified")}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select payment status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="verified">Verified</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="remarks">Remarks (visible to user)</Label>
                                  <Textarea
                                    id="remarks"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter remarks for the user..."
                                    rows={3}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="adminNotes">Admin Notes (internal only)</Label>
                                  <Textarea
                                    id="adminNotes"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Internal notes for admins..."
                                    rows={3}
                                  />
                                </div>

                                <Button onClick={handleUpdateSubmission} className="w-full">
                                  Update Submission
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle>Support Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supportMessages.map((msg) => (
                      <TableRow key={msg.id}>
                        <TableCell className="font-medium">{msg.subject}</TableCell>
                        <TableCell className="max-w-xs truncate">{msg.message}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(msg.status)}>
                            {msg.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {msg.admin_response || "-"}
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
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Respond to Message</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Subject</Label>
                                  <p className="text-sm font-semibold">{msg.subject}</p>
                                </div>

                                <div className="space-y-2">
                                  <Label>User Message</Label>
                                  <p className="text-sm p-3 bg-muted rounded-md">{msg.message}</p>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="messageStatus">Status</Label>
                                  <Select value={messageStatus} onValueChange={setMessageStatus}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="open">Open</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="resolved">Resolved</SelectItem>
                                      <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="messageResponse">Admin Response</Label>
                                  <Textarea
                                    id="messageResponse"
                                    value={messageResponse}
                                    onChange={(e) => setMessageResponse(e.target.value)}
                                    placeholder="Type your response..."
                                    rows={4}
                                  />
                                </div>

                                <Button onClick={handleUpdateMessage} className="w-full">
                                  Send Response
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
