import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ActionType = 
  | "status_change" 
  | "payment_verification" 
  | "message_response" 
  | "bulk_approve" 
  | "bulk_reject" 
  | "bulk_payment_verify"
  | "user_message_sent"
  | "submission_updated";

type EntityType = "submission" | "message" | "user" | "bulk_action";

interface LogActivityParams {
  actionType: ActionType;
  entityType: EntityType;
  entityId?: string;
  details: string;
}

export const useActivityLog = () => {
  const logActivity = async ({
    actionType,
    entityType,
    entityId,
    details,
  }: LogActivityParams) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .single();

      await supabase.from("activity_logs").insert({
        admin_id: user.id,
        admin_email: profile?.email || user.email,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        details,
      });
    } catch (error) {
      console.error("Error logging activity:", error);
      // Don't show error to user, logging should be silent
    }
  };

  return { logActivity };
};
