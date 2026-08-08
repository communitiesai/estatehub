import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Verify the caller is authenticated
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Confirm caller is an admin with an agency
    const { data: callerProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("agency_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !callerProfile?.agency_id) {
      return new Response(JSON.stringify({ error: "No agency found for user" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (callerProfile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Only admins can invite team members" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { email, fullName, role, title, phone, password } = body as {
      email?: string; fullName?: string; role?: string;
      title?: string; phone?: string; password?: string;
    };

    if (!email || !fullName) {
      return new Response(JSON.stringify({ error: "Email and full name are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validRoles = ["admin", "agent", "client"];
    const memberRole = validRoles.includes(role) ? role : "agent";
    const tempPassword = password || "EstateHub2026!";

    // Create the auth user via Admin API
    const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        agency_name: null,
        invited: true,
      },
    });

    if (createError) {
      const msg = createError.message;
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("registered")) {
        return new Response(JSON.stringify({ error: "A user with this email already exists" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Failed to create user: ${msg}`);
    }

    if (!userData?.user) {
      throw new Error("Failed to create user: no user returned");
    }

    // Link the new user to the caller's agency with the requested role.
    // The signup trigger may have auto-created a profile + standalone agency;
    // upsert the profile with the correct agency_id and role.
    const { error: upsertError } = await adminClient
      .from("profiles")
      .upsert({
        user_id: userData.user.id,
        agency_id: callerProfile.agency_id,
        full_name: fullName,
        role: memberRole,
        title: title ?? null,
        phone: phone ?? null,
        active: true,
      }, { onConflict: "user_id" });

    if (upsertError) {
      throw new Error(`Failed to create profile: ${upsertError.message}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Team member invited successfully",
      email,
      tempPassword,
      userId: userData.user.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
