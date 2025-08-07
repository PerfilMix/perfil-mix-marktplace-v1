
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (req.method === "GET") {
    console.log("Health check requested");
    return new Response("Webhook is alive", {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    console.error("Method not allowed:", req.method);
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    console.log("=== WEBHOOK STARTED ===");
    
    // Get the raw body and signature
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    console.log("Body length:", body.length);
    console.log("Signature present:", !!signature);

    if (!signature) {
      console.error("No Stripe signature found in headers");
      return new Response("No signature", { status: 400 });
    }

    // Check environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("Environment check:", {
      hasStripeSecret: !!stripeSecretKey,
      hasWebhookSecret: !!webhookSecret,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRole: !!serviceRoleKey
    });

    if (!stripeSecretKey || !webhookSecret) {
      console.error("Missing Stripe credentials");
      return new Response("Missing credentials", { status: 500 });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Verify the webhook signature using ASYNC method
    let event;
    try {
      console.log("Verifying webhook signature...");
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      console.log("Signature verified successfully");
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response("Invalid signature", { status: 400 });
    }

    console.log("Received Stripe event:", event.type);
    console.log("Event ID:", event.id);

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(
      supabaseUrl ?? "",
      serviceRoleKey ?? "",
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log("=== PROCESSING CHECKOUT SESSION ===");
      console.log("Session ID:", session.id);
      console.log("Session metadata:", JSON.stringify(session.metadata, null, 2));
      console.log("Payment status:", session.payment_status);
      console.log("Amount total:", session.amount_total);

      const accountId = session.metadata?.account_id;
      const userId = session.metadata?.user_id;

      if (!accountId || !userId) {
        console.error("Missing required metadata:", { accountId, userId });
        console.error("Full metadata:", session.metadata);
        return new Response("Missing required metadata", { status: 400 });
      }

      console.log("Processing purchase:", { accountId, userId });

      // First, verify the account exists and is available
      console.log("Checking account availability...");
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select("id, nome, status")
        .eq("id", accountId)
        .eq("status", "disponível")
        .single();

      if (accountError) {
        console.error("Account query error:", accountError);
        return new Response("Account query failed", { status: 500 });
      }

      if (!account) {
        console.error("Account not found or already sold:", accountId);
        return new Response("Account not available", { status: 400 });
      }

      console.log("Found available account:", account.nome);

      // Update the account to mark it as sold and link to the user
      console.log("Updating account ownership...");
      const { error: updateError } = await supabase
        .from("accounts")
        .update({
          comprada_por: userId,
          status: "vendido",
        })
        .eq("id", accountId);

      if (updateError) {
        console.error("Error updating account:", updateError);
        return new Response("Failed to update account", { status: 500 });
      }

      console.log(`✅ Account ${accountId} successfully linked to user ${userId}`);

      // Create a transaction record
      console.log("Creating transaction record...");
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          account_id: accountId,
          user_id: userId,
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          amount: session.amount_total || 0,
          currency: session.currency || "brl",
          status: "paid",
        });

      if (transactionError) {
        console.error("Error creating transaction record:", transactionError);
        // Don't fail the webhook for this, the account is already updated
      } else {
        console.log("✅ Transaction record created successfully");
      }

      console.log("=== CHECKOUT SESSION PROCESSED SUCCESSFULLY ===");
      return new Response("Webhook processed successfully", {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Handle payment_intent.succeeded for additional confirmation
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("=== PAYMENT INTENT SUCCEEDED ===");
      console.log("Payment Intent ID:", paymentIntent.id);
      
      // Update transaction status to confirmed
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ status: "confirmed" })
        .eq("stripe_payment_intent_id", paymentIntent.id);

      if (updateError) {
        console.error("Error updating transaction status:", updateError);
      } else {
        console.log("✅ Transaction status updated to confirmed");
      }

      return new Response("Payment confirmed", {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Handle payment failures
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("=== PAYMENT INTENT FAILED ===");
      console.log("Payment Intent ID:", paymentIntent.id);
      console.log("Failure reason:", paymentIntent.last_payment_error?.message);
      
      // Update transaction status to failed
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ status: "failed" })
        .eq("stripe_payment_intent_id", paymentIntent.id);

      if (updateError) {
        console.error("Error updating failed transaction:", updateError);
      } else {
        console.log("✅ Transaction status updated to failed");
      }

      return new Response("Payment failure recorded", {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Handle other event types
    console.log("Unhandled event type:", event.type);
    return new Response("Event not handled", { status: 200 });

  } catch (error) {
    console.error("=== WEBHOOK ERROR ===");
    console.error("Error details:", error);
    console.error("Stack trace:", error.stack);
    return new Response("Internal server error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
