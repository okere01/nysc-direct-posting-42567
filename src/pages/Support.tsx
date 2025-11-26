import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, MessageCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUserNotifications } from "@/hooks/useUserNotifications";

const messageSchema = z.object({
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(200, "Subject too long"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message too long"),
});

interface Message {
  id: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

const Support = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { notifications } = useUserNotifications();

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  useEffect(() => {
    checkAuth();
    fetchMessages();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof messageSchema>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("support_messages")
        .insert({
          user_id: user.id,
          subject: values.subject,
          message: values.message,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your message has been sent to support",
      });

      form.reset();
      fetchMessages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleReply = async (messageId: string) => {
    if (!replyText.trim() || replyText.trim().length < 10) {
      toast({
        title: "Error",
        description: "Reply must be at least 10 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const originalMessage = messages.find(m => m.id === messageId);
      const newSubject = `Re: ${originalMessage?.subject || ""}`;

      const { error } = await supabase
        .from("support_messages")
        .insert({
          user_id: user.id,
          subject: newSubject,
          message: replyText,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your reply has been sent",
      });

      setReplyText("");
      setReplyingTo(null);
      fetchMessages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-500";
      case "in_progress":
        return "bg-blue-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const messagesWithResponses = messages.filter(m => m.admin_response);
  const unreadResponses = messagesWithResponses.filter(m => m.status !== "closed");

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-foreground">Support & Contact</h1>
            {unreadResponses.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                <Bell className="h-3 w-3 mr-1" />
                {unreadResponses.length} New Response{unreadResponses.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="space-x-4">
            <Button 
              onClick={() => navigate("/submissions")} 
              variant="outline"
              className="relative"
            >
              My Submissions
              {(notifications.pendingSubmissions > 0 || notifications.unverifiedPayments > 0) && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                >
                  {notifications.pendingSubmissions + notifications.unverifiedPayments}
                </Badge>
              )}
            </Button>
            <Button onClick={() => navigate("/")} variant="outline">
              Home
            </Button>
          </div>
        </div>

        {unreadResponses.length > 0 && (
          <Alert className="mb-6 border-green-500/50 bg-green-500/10">
            <Bell className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-600">New Admin Responses!</AlertTitle>
            <AlertDescription className="text-green-600">
              You have {unreadResponses.length} message{unreadResponses.length > 1 ? 's' : ''} with admin responses. Check your messages below.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* New Message Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter subject..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your issue or question..." 
                            rows={6}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Message History */}
          <Card>
            <CardHeader>
              <CardTitle>Your Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No messages yet. Send your first message!
                </p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`border rounded-lg p-4 space-y-2 ${
                        msg.admin_response && msg.status !== "closed" 
                          ? "border-green-500 bg-green-500/5" 
                          : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{msg.subject}</h3>
                          {msg.admin_response && msg.status !== "closed" && (
                            <Badge variant="outline" className="bg-green-500 text-white border-green-500 text-xs">
                              <Bell className="h-3 w-3 mr-1" />
                              New Response
                            </Badge>
                          )}
                        </div>
                        <Badge className={getStatusColor(msg.status)}>
                          {msg.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{msg.message}</p>
                      {msg.admin_response && (
                        <div className="mt-3 p-3 bg-muted rounded-md border-l-4 border-primary">
                          <p className="text-xs font-semibold text-primary mb-1">Admin Response:</p>
                          <p className="text-sm">{msg.admin_response}</p>
                          {msg.status !== "closed" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="mt-3"
                                  onClick={() => setReplyingTo(msg)}
                                >
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  Reply
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reply to: {msg.subject}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 mt-4">
                                  <div className="p-3 bg-muted rounded-md">
                                    <p className="text-xs font-semibold mb-1">Admin's Response:</p>
                                    <p className="text-sm">{msg.admin_response}</p>
                                  </div>
                                  <div>
                                    <Label>Your Reply</Label>
                                    <Textarea
                                      placeholder="Type your reply..."
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      rows={5}
                                      className="mt-2"
                                    />
                                  </div>
                                  <Button 
                                    onClick={() => handleReply(msg.id)}
                                    className="w-full"
                                  >
                                    Send Reply
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;
