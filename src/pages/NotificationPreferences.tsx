import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Mail, MessageSquare, CheckCircle } from "lucide-react";

interface NotificationSettings {
  email_submission_updates: boolean;
  email_payment_verified: boolean;
  email_admin_response: boolean;
  push_submission_updates: boolean;
  push_payment_verified: boolean;
  push_admin_response: boolean;
  sound_enabled: boolean;
}

export default function NotificationPreferences() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email_submission_updates: true,
    email_payment_verified: true,
    email_admin_response: true,
    push_submission_updates: true,
    push_payment_verified: true,
    push_admin_response: true,
    sound_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = localStorage.getItem("notification_preferences");
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem("notification_preferences", JSON.stringify(settings));
      toast.success("Notification preferences saved successfully");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const requestBrowserPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast.success("Browser notifications enabled");
      } else {
        toast.error("Browser notifications denied");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notification Preferences</h1>
          <p className="text-muted-foreground">
            Customize how and when you receive notifications
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle>Email Notifications</CardTitle>
              </div>
              <CardDescription>
                Receive updates via email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-submission" className="flex-1">
                  <div>
                    <p className="font-medium">Submission Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when your submission status changes
                    </p>
                  </div>
                </Label>
                <Switch
                  id="email-submission"
                  checked={settings.email_submission_updates}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, email_submission_updates: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email-payment" className="flex-1">
                  <div>
                    <p className="font-medium">Payment Verification</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when your payment is verified
                    </p>
                  </div>
                </Label>
                <Switch
                  id="email-payment"
                  checked={settings.email_payment_verified}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, email_payment_verified: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email-response" className="flex-1">
                  <div>
                    <p className="font-medium">Admin Responses</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when admin responds to your support messages
                    </p>
                  </div>
                </Label>
                <Switch
                  id="email-response"
                  checked={settings.email_admin_response}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, email_admin_response: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Push Notifications</CardTitle>
              </div>
              <CardDescription>
                Receive instant browser notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Notification.permission !== "granted" && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm mb-3">
                    Browser notifications are currently disabled. Enable them to receive instant alerts.
                  </p>
                  <Button onClick={requestBrowserPermission} size="sm">
                    Enable Browser Notifications
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="push-submission" className="flex-1">
                  <div>
                    <p className="font-medium">Submission Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Instant alerts for submission status changes
                    </p>
                  </div>
                </Label>
                <Switch
                  id="push-submission"
                  checked={settings.push_submission_updates}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, push_submission_updates: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="push-payment" className="flex-1">
                  <div>
                    <p className="font-medium">Payment Verification</p>
                    <p className="text-sm text-muted-foreground">
                      Instant alerts when payment is verified
                    </p>
                  </div>
                </Label>
                <Switch
                  id="push-payment"
                  checked={settings.push_payment_verified}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, push_payment_verified: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="push-response" className="flex-1">
                  <div>
                    <p className="font-medium">Admin Responses</p>
                    <p className="text-sm text-muted-foreground">
                      Instant alerts for new admin responses
                    </p>
                  </div>
                </Label>
                <Switch
                  id="push-response"
                  checked={settings.push_admin_response}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, push_admin_response: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle>Sound & In-App</CardTitle>
              </div>
              <CardDescription>
                Customize in-app notification behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="sound" className="flex-1">
                  <div>
                    <p className="font-medium">Sound Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Play a sound when receiving notifications
                    </p>
                  </div>
                </Label>
                <Switch
                  id="sound"
                  checked={settings.sound_enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, sound_enabled: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
