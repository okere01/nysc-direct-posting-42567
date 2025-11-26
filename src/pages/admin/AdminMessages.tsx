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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Download } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV, exportToExcel } from "@/utils/exportData";
import { cn } from "@/lib/utils";
import { useActivityLog } from "@/hooks/useActivityLog";
import { z } from "zod";

interface SupportMessage {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
}

const responseSchema = z.object({
  response: z.string().trim().min(10, "Response must be at least 10 characters").max(2000, "Response must be less than 2000 characters"),
  status: z.enum(["open", "closed"], { required_error: "Status is required" }),
});

export default function AdminMessages() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [search, setSearch] = useState("");
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("");
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const { logActivity } = useActivityLog();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("support_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (messagesError) throw messagesError;

      // Fetch all user profiles
      const userIds = [...new Set(messagesData?.map(msg => msg.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Create a map of user profiles
      const profilesMap = new Map(
        profilesData?.map(profile => [profile.id, profile]) || []
      );

      // Join messages with user info
      const messagesWithUserInfo = (messagesData || []).map(msg => ({
        ...msg,
        user_email: profilesMap.get(msg.user_id)?.email || "Unknown",
        user_name: profilesMap.get(msg.user_id)?.full_name || "Unknown User",
      }));
      
      setMessages(messagesWithUserInfo);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToMessage = async () => {
    if (!selectedMessage) return;

    // Validate input
    try {
      responseSchema.parse({ response, status });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    const oldStatus = selectedMessage.status;

    try {
      // Update database
      const { error: updateError } = await supabase
        .from("support_messages")
        .update({
          admin_response: response,
          status,
        })
        .eq("id", selectedMessage.id);

      if (updateError) throw updateError;

      // Send email notification
      if (selectedMessage.user_email) {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-notification-email', {
            body: {
              to: selectedMessage.user_email,
              subject: "Response to Your Support Request",
              messageSubject: selectedMessage.subject,
              userMessage: selectedMessage.message,
              adminResponse: response,
              userName: selectedMessage.user_name,
            },
          });

          if (emailError) {
            console.error("Email notification error:", emailError);
            // Don't fail the whole operation if email fails
            toast.warning("Response saved but email notification failed");
          }
        } catch (emailError) {
          console.error("Email notification error:", emailError);
          toast.warning("Response saved but email notification failed");
        }
      }

      // Log activity
      await logActivity({
        actionType: "message_response",
        entityType: "message",
        entityId: selectedMessage.id,
        details: `Responded to message: "${selectedMessage.subject}" (status: ${oldStatus} → ${status})`,
      });

      toast.success("Response sent successfully with email notification");
      fetchMessages();
      setShowDetailPanel(false);
      setSelectedMessage(null);
      setResponse("");
      setStatus("");
    } catch (error) {
      console.error("Error responding to message:", error);
      toast.error("Failed to send response");
    }
  };

  const handleSelectMessage = (message: SupportMessage) => {
    setSelectedMessage(message);
    setResponse(message.admin_response || "");
    setStatus(message.status);
    setShowDetailPanel(true);
  };

  const handleExportCSV = () => {
    const exportData = filteredMessages.map(m => ({
      Subject: m.subject,
      Message: m.message,
      Status: m.status,
      "Admin Response": m.admin_response || "No response yet",
      "Created At": new Date(m.created_at).toLocaleDateString(),
    }));
    exportToCSV(exportData, "support_messages");
    toast.success("Exported to CSV");
  };

  const handleExportExcel = () => {
    const exportData = filteredMessages.map(m => ({
      Subject: m.subject,
      Message: m.message,
      Status: m.status,
      "Admin Response": m.admin_response || "No response yet",
      "Created At": new Date(m.created_at).toLocaleDateString(),
    }));
    exportToExcel(exportData, "support_messages");
    toast.success("Exported to Excel");
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.subject.toLowerCase().includes(search.toLowerCase()) ||
      msg.message.toLowerCase().includes(search.toLowerCase()) ||
      msg.admin_response?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Messages List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-8 border-b">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Support Messages</h1>
              <p className="text-muted-foreground mt-1">
                Respond to user inquiries and support requests
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
                placeholder="Search by subject, message, or response..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary" className="text-sm">
              {filteredMessages.length} Total
            </Badge>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <Card className="m-8 mt-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Subject</TableHead>
                    <TableHead className="font-semibold">Message Preview</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow 
                      key={message.id} 
                      className={cn(
                        "cursor-pointer hover:bg-muted/30",
                        selectedMessage?.id === message.id && "bg-muted/50"
                      )}
                      onClick={() => handleSelectMessage(message)}
                    >
                      <TableCell className="font-medium whitespace-nowrap">{message.subject}</TableCell>
                      <TableCell className="max-w-md truncate whitespace-nowrap">{message.message}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={message.status === "closed" ? "default" : "secondary"}>
                          {message.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{new Date(message.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          </Card>
        </ScrollArea>
      </div>

      {/* Detail Sheet - Mobile Friendly */}
      <Sheet open={showDetailPanel} onOpenChange={setShowDetailPanel}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Message Details</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {selectedMessage && (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Message Details</h3>
                  <div className="bg-muted/50 rounded-lg border p-4 space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Subject</Label>
                      <p className="font-medium text-lg">{selectedMessage.subject}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">User Message</Label>
                      <p className="text-sm whitespace-pre-wrap mt-2 p-3 bg-background rounded border">
                        {selectedMessage.message}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Submitted: {new Date(selectedMessage.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Status & Response</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Admin Response</Label>
                      <Textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Type your response here..."
                        rows={8}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleRespondToMessage} className="w-full">
                    Send Response
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
