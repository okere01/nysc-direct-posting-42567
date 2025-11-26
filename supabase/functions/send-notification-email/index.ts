import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const resend_api_key = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  to: string;
  subject: string;
  messageSubject: string;
  userMessage: string;
  adminResponse: string;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, messageSubject, userMessage, adminResponse, userName }: NotificationEmailRequest = await req.json();

    console.log("Sending notification email to:", to);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resend_api_key}`,
      },
      body: JSON.stringify({
        from: "NYSC Support <onboarding@resend.dev>",
        to: [to],
        subject: subject || "Response to Your Support Request",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                .content { padding: 30px; }
                .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #333; }
                .message-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px 20px; margin: 20px 0; border-radius: 4px; }
                .message-box strong { color: #667eea; display: block; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
                .message-box p { margin: 0; color: #555; }
                .response-box { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px 20px; margin: 20px 0; border-radius: 4px; }
                .response-box strong { color: #4caf50; display: block; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
                .response-box p { margin: 0; color: #333; white-space: pre-wrap; }
                .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e0e0e0; }
                .footer p { margin: 5px 0; }
                .divider { height: 1px; background: #e0e0e0; margin: 25px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📬 Support Response</h1>
                </div>
                <div class="content">
                  <div class="greeting">
                    Hello${userName ? ` ${userName}` : ''},
                  </div>
                  <p>We have reviewed your support request and are pleased to provide you with a response.</p>
                  
                  <div class="divider"></div>
                  
                  <div class="message-box">
                    <strong>📝 Your Original Message</strong>
                    <p><strong>Subject:</strong> ${messageSubject}</p>
                    <p style="margin-top: 10px;">${userMessage}</p>
                  </div>
                  
                  <div class="response-box">
                    <strong>✅ Our Response</strong>
                    <p>${adminResponse}</p>
                  </div>
                  
                  <div class="divider"></div>
                  
                  <p style="margin-top: 20px;">If you have any further questions or need additional assistance, please don't hesitate to reach out to us again.</p>
                  <p style="margin-top: 15px; font-weight: 500;">Best regards,<br>NYSC Support Team</p>
                </div>
                <div class="footer">
                  <p>This is an automated message from NYSC Support System</p>
                  <p>Please do not reply directly to this email</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Resend API error: ${emailResponse.status} ${errorData}`);
    }

    const emailData = await emailResponse.json();

    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
