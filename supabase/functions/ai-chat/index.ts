import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, type = "general" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const pricingInfo = `
SERVICE PRICING INFORMATION (AVAILABLE ON THIS PORTAL):

1. Link One
   - Lagos/Abuja: ₦130,000
   - Other States: ₦120,000
   - Description: Standard direct posting service

2. Link Two
   - Lagos/Abuja: ₦100,000
   - Other States: ₦90,000
   - Description: Alternative posting option

3. Medical
   - Price: ₦240,000
   - Description: Medical personnel posting

4. Origin
   - Price: ₦250,000
   - Description: State of origin posting
   - Note: Terms and conditions apply

5. Normal Relocation
   - Lagos/Abuja: ₦130,000
   - Other States: ₦120,000
   - Description: This will be approved when the next batch stream is about leaving Camp

6. Express Relocation
   - Lagos/Abuja: ₦230,000
   - Other States: ₦210,000
   - Description: This usually takes 2-5 (working days)
`;

    let systemPrompt = "";
    
    if (type === "admin") {
      systemPrompt = `You are an AI assistant for the NYSC Management Portal administrators.

CRITICAL INSTRUCTIONS:
- ONLY provide information that is available in this portal and the data provided below
- DO NOT provide general NYSC information or universal knowledge
- If asked about something not in the portal data, respond: "I don't have that information in the portal. Please contact support for assistance."
- Keep responses clear, actionable, and professional

PORTAL DATA YOU CAN USE:
${pricingInfo}

PORTAL FEATURES:
- Submission management and tracking
- User management and roles
- Payment verification
- Admin notes and remarks
- Activity logs
- Support message handling

You can help with:
- Understanding submission statistics and trends
- Providing insights on user behavior
- Answering questions about admin features
- Information about the services and pricing listed above`;
    } else {
      systemPrompt = `You are an AI assistant for the NYSC Management Portal.

CRITICAL INSTRUCTIONS:
- ONLY provide information that is available in this portal and the data provided below
- DO NOT provide general NYSC information or universal knowledge about NYSC procedures
- If asked about something not in the portal data, respond: "I don't have that information in the portal. Please contact support for assistance."
- Keep responses friendly, clear, and helpful

PORTAL DATA YOU CAN USE:
${pricingInfo}

PORTAL FEATURES:
- Submit NYSC direct posting requests
- Track submission status
- Upload payment proof
- View notification history
- Update notification preferences
- Access help center with FAQs

You can help with:
- Questions about the services and pricing listed above
- Explaining the submission process on this portal
- Guiding through portal features
- Payment verification steps`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please contact support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
