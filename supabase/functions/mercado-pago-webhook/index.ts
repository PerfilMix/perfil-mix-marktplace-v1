import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== MERCADO PAGO WEBHOOK ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  try {
    // Log headers for debugging
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('Headers:', headers);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get webhook data
    const webhookData = await req.json()
    console.log('Webhook data received:', JSON.stringify(webhookData, null, 2))

    // Mercado Pago webhook structure
    if (webhookData.type === 'payment' && webhookData.data?.id) {
      const paymentId = webhookData.data.id
      console.log('Processing payment webhook for payment ID:', paymentId)

      // Get payment details from Mercado Pago
      const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')
      if (!accessToken) {
        console.error('MERCADO_PAGO_ACCESS_TOKEN not found')
        return new Response('Access token not configured', { status: 500 })
      }

      try {
        console.log('Fetching payment details from Mercado Pago...')
        const mpResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (!mpResponse.ok) {
          console.error('Error fetching payment from MP:', mpResponse.status)
          return new Response('Error fetching payment', { status: 400 })
        }

        const paymentData = await mpResponse.json()
        console.log('Payment data from MP:', JSON.stringify(paymentData, null, 2))

        // Find transaction by payment ID
        const { data: transaction, error: findError } = await supabase
          .from('transactions')
          .select('*')
          .eq('mercado_pago_payment_id', paymentId.toString())
          .single()

        if (findError || !transaction) {
          console.error('Transaction not found for payment ID:', paymentId, findError)
          return new Response('Transaction not found', { status: 404 })
        }

        console.log('Found transaction:', transaction.id)

        // Map payment status
        let newStatus = 'pending'
        let shouldUpdateAccount = false

        switch (paymentData.status) {
          case 'approved':
            newStatus = 'completed'
            shouldUpdateAccount = true
            console.log('Payment approved - will mark as completed')
            break
          case 'rejected':
          case 'cancelled':
            newStatus = 'failed'
            console.log('Payment rejected/cancelled - will mark as failed')
            break
          case 'pending':
          case 'in_process':
          case 'in_mediation':
            newStatus = 'pending'
            console.log('Payment still pending')
            break
          default:
            console.log('Unknown payment status:', paymentData.status)
        }

        // Update transaction
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: newStatus,
            mercado_pago_payment_status: paymentData.status,
            updated_at: new Date().toISOString(),
            webhook_processed: true
          })
          .eq('id', transaction.id)

        if (updateError) {
          console.error('Error updating transaction:', updateError)
          return new Response('Error updating transaction', { status: 500 })
        }

        console.log('Transaction updated successfully')

        // If payment approved, mark account as sold
        if (shouldUpdateAccount && transaction.account_id) {
          console.log('Marking account as sold...')
          
          const { error: accountError } = await supabase
            .from('accounts')
            .update({
              status: 'vendido',
              comprada_por: transaction.user_id
            })
            .eq('id', transaction.account_id)

          if (accountError) {
            console.error('Error updating account:', accountError)
          } else {
            console.log('Account marked as sold successfully')
          }
        }

        return new Response('OK', { status: 200 })

      } catch (mpError) {
        console.error('Error processing Mercado Pago webhook:', mpError)
        return new Response('Error processing webhook', { status: 500 })
      }
    }

    // For other types of webhooks or unrecognized structure
    console.log('Webhook not processed - unknown type or structure')
    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('Error in webhook function:', error)
    return new Response('Internal server error', { status: 500 })
  }
})