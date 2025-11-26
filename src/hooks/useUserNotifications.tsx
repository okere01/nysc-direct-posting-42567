import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserNotifications() {
  const [notifications, setNotifications] = useState({
    pendingSubmissions: 0,
    unverifiedPayments: 0,
    unreadMessages: 0,
    totalAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscriptions
    const submissionsChannel = supabase
      .channel('submissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'submissions'
        },
        () => fetchNotifications()
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_messages'
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(submissionsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch user's submissions
      const { data: submissions } = await supabase
        .from("submissions")
        .select("status, payment_verified")
        .eq("user_id", user.id);

      // Fetch user's support messages
      const { data: messages } = await supabase
        .from("support_messages")
        .select("admin_response, status")
        .eq("user_id", user.id);

      const pendingSubmissions = submissions?.filter(s => s.status === "pending").length || 0;
      const unverifiedPayments = submissions?.filter(s => !s.payment_verified).length || 0;
      const unreadMessages = messages?.filter(m => m.admin_response && m.status !== "closed").length || 0;

      const totalAlerts = pendingSubmissions + unverifiedPayments + unreadMessages;

      setNotifications({
        pendingSubmissions,
        unverifiedPayments,
        unreadMessages,
        totalAlerts,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  return { notifications, loading, refetch: fetchNotifications };
}
