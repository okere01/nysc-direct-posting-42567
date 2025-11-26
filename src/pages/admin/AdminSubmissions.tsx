import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Download, X } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV, exportToExcel } from "@/utils/exportData";
import { cn } from "@/lib/utils";

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

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [search, setSearch] = useState("");
  const [remarks, setRemarks] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState("");
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          status,
          payment_verified: paymentVerified,
          remarks,
          admin_notes: adminNotes,
        })
        .eq("id", selectedSubmission.id);

      if (error) throw error;

      toast.success("Submission updated successfully");
      fetchSubmissions();
      setShowDetailPanel(false);
      setSelectedSubmission(null);
    } catch (error) {
      console.error("Error updating submission:", error);
      toast.error("Failed to update submission");
    }
  };

  const handleSelectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setStatus(submission.status);
    setPaymentVerified(submission.payment_verified);
    setRemarks(submission.remarks || "");
    setAdminNotes(submission.admin_notes || "");
    setShowDetailPanel(true);
  };

  const handleExportCSV = () => {
    const exportData = filteredSubmissions.map(s => ({
      Name: s.name,
      Course: s.course,
      "Call Up Number": s.call_up,
      "State of Origin": s.state_of_origin,
      "State of Choices": s.state_of_choices,
      "Service Type": s.service_type || "N/A",
      Amount: s.calculated_amount || 0,
      Status: s.status,
      "Payment Verified": s.payment_verified ? "Yes" : "No",
      "NYSC Email": s.nysc_email || "N/A",
      Remarks: s.remarks || "",
      "Created At": new Date(s.created_at).toLocaleDateString(),
    }));
    exportToCSV(exportData, "submissions");
    toast.success("Exported to CSV");
  };

  const handleExportExcel = () => {
    const exportData = filteredSubmissions.map(s => ({
      Name: s.name,
      Course: s.course,
      "Call Up Number": s.call_up,
      "State of Origin": s.state_of_origin,
      "State of Choices": s.state_of_choices,
      "Service Type": s.service_type || "N/A",
      Amount: s.calculated_amount || 0,
      Status: s.status,
      "Payment Verified": s.payment_verified ? "Yes" : "No",
      "NYSC Email": s.nysc_email || "N/A",
      Remarks: s.remarks || "",
      "Created At": new Date(s.created_at).toLocaleDateString(),
    }));
    exportToExcel(exportData, "submissions");
    toast.success("Exported to Excel");
  };

  const filteredSubmissions = submissions.filter(
    (sub) =>
      sub.name.toLowerCase().includes(search.toLowerCase()) ||
      sub.call_up.toLowerCase().includes(search.toLowerCase()) ||
      sub.course.toLowerCase().includes(search.toLowerCase()) ||
      sub.nysc_email?.toLowerCase().includes(search.toLowerCase()) ||
      sub.state_of_origin.toLowerCase().includes(search.toLowerCase()) ||
      sub.state_of_choices.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="h-screen flex">
      {/* Submissions List */}
      <div className={cn("flex-1 flex flex-col", showDetailPanel && "border-r")}>
        <div className="p-8 border-b">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">NYSC Submissions</h1>
              <p className="text-muted-foreground mt-1">
                Manage and review all submissions
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button onClick={handleExportExcel} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, call up, course, email, or state..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary" className="text-sm">
              {filteredSubmissions.length} Total
            </Badge>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <Card className="m-8 mt-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Course</TableHead>
                    <TableHead className="font-semibold">Call Up</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Payment</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow 
                      key={submission.id} 
                      className={cn(
                        "cursor-pointer hover:bg-muted/30",
                        selectedSubmission?.id === submission.id && "bg-muted/50"
                      )}
                      onClick={() => handleSelectSubmission(submission)}
                    >
                      <TableCell className="font-medium">{submission.name}</TableCell>
                      <TableCell>{submission.course}</TableCell>
                      <TableCell>{submission.call_up}</TableCell>
                      <TableCell>
                        <Badge variant={submission.status === "approved" ? "default" : "secondary"}>
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={submission.payment_verified ? "default" : "destructive"}>
                          {submission.payment_verified ? "Verified" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>₦{submission.calculated_amount?.toLocaleString() || "0"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </ScrollArea>
      </div>

      {/* Detail Panel */}
      {showDetailPanel && selectedSubmission && (
        <div className="w-[500px] flex flex-col bg-card">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">Submission Details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowDetailPanel(false);
                setSelectedSubmission(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
                <div className="space-y-3 bg-muted/50 rounded-lg border p-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Full Name</Label>
                    <p className="font-medium">{selectedSubmission.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Course</Label>
                    <p className="font-medium">{selectedSubmission.course}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Call Up Number</Label>
                    <p className="font-medium">{selectedSubmission.call_up}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Service Type</Label>
                    <p className="font-medium">{selectedSubmission.service_type || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">State of Origin</Label>
                    <p className="font-medium">{selectedSubmission.state_of_origin}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">State of Choices</Label>
                    <p className="font-medium">{selectedSubmission.state_of_choices}</p>
                  </div>
                </div>
              </div>

              {/* NYSC Portal Credentials */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">NYSC Portal Credentials</h3>
                <div className="space-y-3 bg-muted/50 rounded-lg border p-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">NYSC Email</Label>
                    <p className="font-medium break-all">{selectedSubmission.nysc_email || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">NYSC Password</Label>
                    <p className="font-medium">{selectedSubmission.nysc_password || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Payment Information</h3>
                <div className="bg-muted/50 rounded-lg border p-4 space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Calculated Amount</Label>
                    <p className="font-medium text-xl">
                      ₦{selectedSubmission.calculated_amount?.toLocaleString() || "0"}
                    </p>
                  </div>
                  {selectedSubmission.payment_proof_url && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Payment Proof</Label>
                      <a
                        href={selectedSubmission.payment_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline block mt-1"
                      >
                        View Payment Proof
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Management */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Status Management</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="payment-verified"
                      checked={paymentVerified}
                      onChange={(e) => setPaymentVerified(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="payment-verified">Payment Verified</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Remarks (Visible to User)</Label>
                    <Textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add remarks for the user..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Admin Notes (Internal Only)</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 border-t">
            <Button onClick={handleUpdateSubmission} className="w-full">
              Update Submission
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
