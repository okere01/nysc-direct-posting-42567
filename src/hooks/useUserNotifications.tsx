import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { playNotificationSound, requestNotificationPermission, showBrowserNotification } from "@/utils/notificationSound";

export function useUserNotifications() {
  const [notifications, setNotifications] = useState({
    pendingSubmissions: 0,
    unverifiedPayments: 0,
    unreadMessages: 0,
    totalAlerts: 0,
  });
  const [loading, setLoading] = useState(true);
  const previousUnreadMessages = useRef(0);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    fetchNotifications();
    
    // Check notification permission
    if (typeof Notification !== 'undefined') {
      setNotificationPermission(Notification.permission);
    }
    
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

      // Check if there are new unread messages and trigger notifications
      if (unreadMessages > previousUnreadMessages.current && previousUnreadMessages.current !== 0) {
        playNotificationSound();
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          showBrowserNotification(
            'New Admin Response',
            'You have received a new response from the admin',
          );
        }
        
        // Log to notification history
        if (user) {
          await supabase.rpc('log_notification', {
            p_user_id: user.id,
            p_type: 'admin_response',
            p_title: 'New Admin Response',
            p_message: 'You have received a new response from the admin',
            p_metadata: { unread_count: unreadMessages }
          });
        }
      }
      
      previousUnreadMessages.current = unreadMessages;

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

  const requestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (typeof Notification !== 'undefined') {
      setNotificationPermission(Notification.permission);
    }
    return granted;
  };

  return { 
    notifications, 
    loading, 
    refetch: fetchNotifications,
    notificationPermission,
    requestPermission
  };
}
