import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CheckPaymentRequest {
  transaction_id: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== CHECK PAYMENT STATUS FUNCTION ===');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { transaction_id }: CheckPaymentRequest = await req.json()
    
    console.log('Checking payment status for transaction:', transaction_id)

    // Get transaction from database
    const { data: transaction, error: dbError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transaction_id)
      .single()

    if (dbError || !transaction) {
      console.error('Transaction not found:', dbError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Transação não encontrada',
          status: 'not_found'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Transaction found:', {
      id: transaction.id,
      status: transaction.status,
      mercado_pago_payment_id: transaction.mercado_pago_payment_id,
      mercado_pago_payment_status: transaction.mercado_pago_payment_status
    })

    // If already completed/failed in our DB, return that status
    if (transaction.status === 'completed') {
      console.log('Transaction already completed in database')
      return new Response(
        JSON.stringify({
          success: true,
          status: 'completed',
          transaction_id: transaction.id,
          account_id: transaction.account_id,
          payment_method: transaction.mercado_pago_payment_method || 'pix'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (transaction.status === 'failed') {
      console.log('Transaction already failed in database')
      return new Response(
        JSON.stringify({
          success: true,
          status: 'failed',
          transaction_id: transaction.id,
          account_id: transaction.account_id
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check with Mercado Pago API if we have a payment ID
    if (transaction.mercado_pago_payment_id) {
      const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')
      if (!accessToken) {
        console.error('MERCADO_PAGO_ACCESS_TOKEN not found')
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Configuração de pagamento não encontrada',
            status: 'config_error'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Checking payment status with Mercado Pago API...')
      
      try {
        const mpResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${transaction.mercado_pago_payment_id}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (mpResponse.ok) {
          const mpData = await mpResponse.json()
          console.log('Mercado Pago payment status:', mpData.status)
          
          // Map Mercado Pago status to our status
          let newStatus = transaction.status
          let isCompleted = false
          
          switch (mpData.status) {
            case 'approved':
              newStatus = 'completed'
              isCompleted = true
              break
            case 'rejected':
            case 'cancelled':
              newStatus = 'failed'
              break
            case 'pending':
            case 'in_process':
            case 'in_mediation':
              newStatus = 'pending'
              break
            default:
              console.log('Unknown payment status:', mpData.status)
              newStatus = 'pending'
          }

          // Update transaction status if it changed
          if (newStatus !== transaction.status) {
            console.log(`Updating transaction status from ${transaction.status} to ${newStatus}`)
            
            const { error: updateError } = await supabase
              .from('transactions')
              .update({ 
                status: newStatus,
                mercado_pago_payment_status: mpData.status,
                updated_at: new Date().toISOString()
              })
              .eq('id', transaction.id)

            if (updateError) {
              console.error('Error updating transaction status:', updateError)
            }

            // If payment is completed, mark account as sold
            if (isCompleted && transaction.account_id) {
              console.log('Payment completed, marking account as sold')
              
              const { error: accountError } = await supabase
                .from('accounts')
                .update({ 
                  status: 'vendido',
                  comprada_por: transaction.user_id
                })
                .eq('id', transaction.account_id)

              if (accountError) {
                console.error('Error updating account status:', accountError)
              } else {
                console.log('Account marked as sold successfully')
              }
            }
          }

          return new Response(
            JSON.stringify({
              success: true,
              status: newStatus,
              transaction_id: transaction.id,
              account_id: transaction.account_id,
              payment_method: transaction.mercado_pago_payment_method || 'pix',
              mercado_pago_status: mpData.status
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        } else {
          console.error('Error checking Mercado Pago status:', mpResponse.status)
        }
      } catch (mpError) {
        console.error('Error calling Mercado Pago API:', mpError)
      }
    }

    // If we couldn't check with MP or there's no payment ID, return current status
    console.log('Returning current database status:', transaction.status)
    
    return new Response(
      JSON.stringify({
        success: true,
        status: transaction.status,
        transaction_id: transaction.id,
        account_id: transaction.account_id,
        payment_method: transaction.mercado_pago_payment_method || 'pix'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in check payment status function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor',
        status: 'server_error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})