import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEMO_EMAIL = "demo@estatehub.com";
const DEMO_PASSWORD = "demo123456";
const DEMO_FULL_NAME = "Demo Agent";
const DEMO_AGENCY = "EstateHub Demo Realty";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Service role key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if demo user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((u) => u.email === DEMO_EMAIL);

    if (existing) {
      return new Response(JSON.stringify({
        success: true,
        message: "Demo user already exists",
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the user via the Admin API — this generates a proper bcrypt hash
    const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: DEMO_FULL_NAME, agency_name: DEMO_AGENCY },
    });

    if (createError) throw new Error(`Failed to create demo user: ${createError.message}`);

    return new Response(JSON.stringify({
      success: true,
      message: "Demo user created successfully",
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
