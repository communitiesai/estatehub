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

    // Step 1: verify the caller is a real authenticated user
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

    // Step 2: use service-role client for data operations (bypasses RLS)
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("agency_id, full_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !profile?.agency_id) {
      return new Response(JSON.stringify({ error: "No agency found for user" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const agencyId = profile.agency_id;
    const agentName = profile.full_name || "Agent";

    // Seed additional team member profiles (shadow entries linked to the same agency)
    const teamMembers = [
      { full_name: "Priya Sharma", role: "agent", title: "Senior Agent", phone: "+91 98765 43210", avatar_url: null, active: true },
      { full_name: "Raj Patel", role: "agent", title: "Field Agent", phone: "+91 98200 11223", avatar_url: null, active: true },
      { full_name: "Ananya Iyer", role: "agent", title: "Sales Agent", phone: "+91 99300 44556", avatar_url: null, active: true },
      { full_name: "Vikram Nair", role: "client", title: "Investor", phone: "+91 90090 77889", avatar_url: null, active: true },
    ];

    // These are standalone profile rows (no auth account) so the team roster looks populated.
    // Use deterministic fake UUIDs derived from the agency so re-seeding is idempotent-ish.
    const fakeUserIds = teamMembers.map((_, i) =>
      crypto.randomUUID()
    );

    const teamInserts = teamMembers.map((m, i) => ({
      user_id: fakeUserIds[i],
      agency_id: agencyId,
      full_name: m.full_name,
      role: m.role,
      title: m.title,
      phone: m.phone,
      avatar_url: m.avatar_url,
      active: m.active,
    }));

    await adminClient.from("profiles").insert(teamInserts).then(({ error }) => {
      if (error) console.warn("Team seed skipped:", error.message);
    });

    const PROPERTY_IMAGES = [
      "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=800",
    ];

    const AMENITIES = [
      ["Swimming Pool", "Gym", "Parking", "Security", "Air Conditioning", "Balcony"],
      ["Parking", "Garden", "Security", "Elevator", "Pet Friendly", "Fireplace"],
      ["Swimming Pool", "Gym", "Parking", "Concierge", "Smart Home", "Sea View"],
      ["Parking", "Elevator", "Air Conditioning", "Storage", "Solar Panels"],
      ["Garden", "Parking", "Security", "Heating", "Playground", "City View"],
    ];

    const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Pune", "Hyderabad"];
    const TYPES = ["apartment", "house", "villa", "apartment", "house"] as const;

    // Seed properties
    const propertyTitles = [
      "Modern Downtown Loft", "Suburban Family Home", "Luxury Beachfront Villa",
      "Contemporary City Apartment", "Charming Garden Cottage",
    ];
    const propertyInserts = propertyTitles.map((title, i) => ({
      agency_id: agencyId,
      created_by: user.id,
      title,
      description: `Beautiful ${TYPES[i]} located in ${CITIES[i]}. Spacious layout with modern finishes, ample natural light, and premium amenities. Perfect for comfortable living.`,
      type: TYPES[i],
      status: i === 2 ? "reserved" : "available",
      listing_type: i % 3 === 0 ? "rent" : "sale",
      price: [3200000, 8500000, 24000000, 4500000, 6200000][i],
      currency: "INR",
      bedrooms: [2, 4, 5, 3, 3][i],
      bathrooms: [2, 3, 4, 2, 2][i],
      area_sqft: [1200, 2400, 4200, 1500, 1800][i],
      plot_sqft: [null, 8000, 12000, null, 6000][i],
      location: CITIES[i],
      city: CITIES[i],
      state: ["Maharashtra", "Delhi", "Karnataka", "Maharashtra", "Telangana"][i],
      country: "India",
      amenities: AMENITIES[i],
      images: PROPERTY_IMAGES,
      year_built: [2019, 2015, 2021, 2018, 2012][i],
      parking: [1, 2, 3, 1, 2][i],
      furnished: i === 0 || i === 2,
      featured: i === 2,
      views: [342, 891, 1203, 567, 234][i],
      inquiries: [12, 28, 45, 19, 8][i],
    }));

    const { data: insertedProperties, error: propError } = await adminClient
      .from("properties")
      .insert(propertyInserts)
      .select("id, title");

    if (propError) throw new Error(`Property seed failed: ${propError.message}`);

    // Seed leads
    const leadNames = [
      "James Wilson", "Maria Garcia", "David Chen", "Sarah Johnson", "Michael Brown",
      "Emma Davis", "Robert Taylor", "Lisa Anderson", "Daniel Martinez", "Olivia Thomas",
      "Christopher Lee", "Jennifer White",
    ];
    const sources = ["portal", "social", "website", "form", "whatsapp", "referral", "portal", "social", "website", "form", "chatbot", "other"];
    const statuses = ["new", "contacted", "qualified", "nurturing", "converted", "new", "contacted", "qualified", "lost", "nurturing", "new", "contacted"];
    const scores = [85, 72, 65, 45, 92, 30, 78, 55, 20, 68, 88, 42];
    const tagsList = [["VIP", "Investor"], ["Luxury"], ["First-time Buyer"], ["Cash Buyer"], ["VIP", "Luxury"], [], ["Investor"], [], [], ["Urgent"], ["VIP"], ["Renter"]];

    const leadInserts = leadNames.map((name, i) => ({
      agency_id: agencyId,
      assigned_to: user.id,
      full_name: name,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}@email.com`,
      phone: `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`,
      source: sources[i],
      status: statuses[i],
      score: scores[i],
      tags: tagsList[i],
      budget_min: [5000000, 10000000, 3000000, 20000, 20000000, 1500000, 8000000, 4000000, 2500000, 6000000, 15000000, 30000][i],
      budget_max: [8000000, 20000000, 5000000, 40000, 30000000, 2500000, 12000000, 6000000, 4000000, 9000000, 25000000, 50000][i],
      currency: "INR",
      notes: i % 3 === 0 ? `Interested in ${CITIES[i % 5]} area. Looking for a ${TYPES[i % 5]}.` : null,
      last_contacted_at: i < 8 ? new Date(Date.now() - i * 86400000).toISOString() : null,
      interested_property_id: insertedProperties ? insertedProperties[i % insertedProperties.length]?.id : null,
    }));

    const { data: insertedLeads, error: leadError } = await adminClient
      .from("leads")
      .insert(leadInserts)
      .select("id, full_name");

    if (leadError) throw new Error(`Lead seed failed: ${leadError.message}`);

    // Seed deals for some leads
    if (insertedLeads && insertedProperties) {
      const stages = ["inquiry", "viewing", "negotiation", "offer", "closed", "inquiry", "viewing", "negotiation"];
      const dealInserts = insertedLeads.slice(0, 8).map((lead, i) => ({
        agency_id: agencyId,
        lead_id: lead.id,
        property_id: insertedProperties[i % insertedProperties.length]?.id ?? null,
        assigned_to: user.id,
        stage: stages[i],
        value: [4500000, 8500000, 12000000, 24000000, 6200000, 320000, 450000, 8500000][i],
        currency: "INR",
        close_date: stages[i] === "closed" ? new Date(Date.now() - 86400000 * 7).toISOString().slice(0, 10) : new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
        notes: i === 4 ? "Deal closed successfully. Client very satisfied." : `Following up with ${lead.full_name}.`,
      }));

      const { error: dealError } = await adminClient.from("deals").insert(dealInserts);
      if (dealError) throw new Error(`Deal seed failed: ${dealError.message}`);

      // Seed appointments
      const apptInserts = [
        { agency_id: agencyId, lead_id: insertedLeads[0]?.id, property_id: insertedProperties[0]?.id, assigned_to: user.id, title: `Property viewing with ${insertedLeads[0]?.full_name}`, start_at: new Date(Date.now() + 86400000).toISOString(), end_at: new Date(Date.now() + 86400000 + 3600000).toISOString(), type: "viewing", status: "scheduled", location: CITIES[0] },
        { agency_id: agencyId, lead_id: insertedLeads[1]?.id, property_id: insertedProperties[1]?.id, assigned_to: user.id, title: `Follow-up call with ${insertedLeads[1]?.full_name}`, start_at: new Date(Date.now() + 86400000 * 2).toISOString(), end_at: new Date(Date.now() + 86400000 * 2 + 1800000).toISOString(), type: "call", status: "scheduled" },
        { agency_id: agencyId, lead_id: insertedLeads[4]?.id, property_id: insertedProperties[2]?.id, assigned_to: user.id, title: `Office meeting with ${insertedLeads[4]?.full_name}`, start_at: new Date(Date.now() - 86400000).toISOString(), end_at: new Date(Date.now() - 86400000 + 3600000).toISOString(), type: "office_meeting", status: "completed", location: "Mumbai Office" },
      ].filter((a) => a.lead_id);

      await adminClient.from("appointments").insert(apptInserts);

      // Seed tasks
      const taskInserts = [
        { agency_id: agencyId, lead_id: insertedLeads[0]?.id, assigned_to: user.id, title: "Send property brochure to lead", priority: "high", status: "pending", due_at: new Date(Date.now() + 86400000).toISOString() },
        { agency_id: agencyId, lead_id: insertedLeads[2]?.id, assigned_to: user.id, title: "Schedule follow-up call", priority: "medium", status: "pending", due_at: new Date(Date.now() + 86400000 * 2).toISOString() },
        { agency_id: agencyId, lead_id: insertedLeads[1]?.id, assigned_to: user.id, title: "Prepare comparative market analysis", priority: "high", status: "in_progress", due_at: new Date(Date.now() - 3600000).toISOString() },
        { agency_id: agencyId, assigned_to: user.id, title: "Update property listings on portal", priority: "low", status: "completed", completed_at: new Date().toISOString() },
      ].filter((t) => true);

      await adminClient.from("tasks").insert(taskInserts);

      // Seed activities
      const activityInserts = [
        { agency_id: agencyId, lead_id: insertedLeads[0]?.id, actor_id: user.id, type: "call", description: `Called ${insertedLeads[0]?.full_name} about downtown loft` },
        { agency_id: agencyId, lead_id: insertedLeads[1]?.id, actor_id: user.id, type: "email", description: `Sent property details to ${insertedLeads[1]?.full_name}` },
        { agency_id: agencyId, lead_id: insertedLeads[4]?.id, actor_id: user.id, type: "whatsapp", description: `WhatsApp message from ${insertedLeads[4]?.full_name}` },
        { agency_id: agencyId, actor_id: user.id, type: "system", description: `${agentName} joined EstateHub` },
      ].filter((a) => true);

      await adminClient.from("activities").insert(activityInserts);

      // Seed a campaign
      await adminClient.from("campaigns").insert({
        agency_id: agencyId,
        created_by: user.id,
        name: "New Listings Newsletter — January",
        channel: "email",
        subject: "5 stunning properties just hit the market",
        content: "Hi there! We've just added 5 beautiful new properties to our portfolio. From modern downtown lofts to luxury beachfront villas, there's something for everyone. Check out our latest listings and schedule a viewing today!",
        status: "sent",
        audience: ["new", "contacted", "qualified", "nurturing"],
        sent_count: 8,
        open_count: 4,
        click_count: 2,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Demo data seeded successfully",
      counts: {
        properties: propertyInserts.length,
        leads: leadInserts.length,
        deals: insertedLeads ? Math.min(8, insertedLeads.length) : 0,
      },
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
