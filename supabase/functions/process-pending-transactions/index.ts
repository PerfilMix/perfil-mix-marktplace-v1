
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    console.log("=== PROCESSING PENDING TRANSACTIONS ===");

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Find pending transactions
    const { data: pendingTransactions, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching pending transactions:", fetchError);
      return new Response("Error fetching transactions", { status: 500 });
    }

    console.log(`Found ${pendingTransactions?.length || 0} pending transactions`);

    let processedCount = 0;
    let errorCount = 0;

    for (const transaction of pendingTransactions || []) {
      try {
        console.log(`Processing transaction: ${transaction.id}`);

        // Check the session status in Stripe
        const session = await stripe.checkout.sessions.retrieve(transaction.stripe_session_id);
        
        console.log(`Session ${session.id} status: ${session.payment_status}`);

        if (session.payment_status === "paid") {
          // Process this transaction
          const accountId = session.metadata?.account_id;
          const userId = session.metadata?.user_id;

          if (accountId && userId) {
            // Update the account
            const { error: updateError } = await supabase
              .from("accounts")
              .update({
                comprada_por: userId,
                status: "vendido",
              })
              .eq("id", accountId)
              .eq("status", "disponível"); // Only update if still available

            if (updateError) {
              console.error(`Error updating account ${accountId}:`, updateError);
              errorCount++;
              continue;
            }

            // Update transaction status
            const { error: transactionUpdateError } = await supabase
              .from("transactions")
              .update({ status: "paid" })
              .eq("id", transaction.id);

            if (transactionUpdateError) {
              console.error(`Error updating transaction ${transaction.id}:`, transactionUpdateError);
              errorCount++;
              continue;
            }

            console.log(`✅ Processed transaction: ${transaction.id}`);
            processedCount++;
          } else {
            console.error(`Missing metadata for session ${session.id}`);
            errorCount++;
          }
        } else if (session.payment_status === "unpaid") {
          // Mark as failed
          await supabase
            .from("transactions")
            .update({ status: "failed" })
            .eq("id", transaction.id);
          
          console.log(`❌ Marked transaction as failed: ${transaction.id}`);
          processedCount++;
        }
      } catch (error) {
        console.error(`Error processing transaction ${transaction.id}:`, error);
        errorCount++;
      }
    }

    console.log(`=== PROCESSING COMPLETE ===`);
    console.log(`Processed: ${processedCount}, Errors: ${errorCount}`);

    return new Response(JSON.stringify({
      success: true,
      processed: processedCount,
      errors: errorCount,
      total: pendingTransactions?.length || 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in process-pending-transactions:", error);
    return new Response("Internal server error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
