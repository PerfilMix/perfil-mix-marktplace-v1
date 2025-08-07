import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PIXPaymentRequest {
  amount: number
  email: string
  account_id: string
  user_id: string
  identification_type: string
  identification_number: string
  payer_name: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== PIX PAYMENT FUNCTION - OFFICIAL API ===');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestData: PIXPaymentRequest = await req.json()
    
    console.log('PIX payment request received:', {
      amount: requestData.amount,
      email: requestData.email,
      account_id: requestData.account_id,
      user_id: requestData.user_id,
      identification_type: requestData.identification_type,
      identification_number: requestData.identification_number ? 
        `***${requestData.identification_number.slice(-4)}` : 'N/A',
      payer_name: requestData.payer_name ? 
        `${requestData.payer_name.split(' ')[0]}***` : 'N/A'
    })

    // Get Mercado Pago credentials
    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')
    if (!accessToken) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN not found in environment')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configuração de pagamento não encontrada',
          error_code: 'config_error'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate unique external reference
    const externalReference = `pix-${requestData.account_id}-${requestData.user_id}-${Date.now()}`
    
    // Create payment data with official API structure
    const paymentData = {
      transaction_amount: requestData.amount,
      description: `Compra de conta TikTok - ${requestData.account_id}`,
      payment_method_id: 'pix',
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercado-pago-webhook`,
      external_reference: externalReference,
      payer: {
        email: requestData.email,
        first_name: requestData.payer_name?.split(' ')[0] || 'Cliente',
        last_name: requestData.payer_name?.split(' ').slice(1).join(' ') || 'Usuario',
        identification: {
          type: requestData.identification_type,
          number: requestData.identification_number
        }
      },
      date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    }

    console.log('Creating PIX payment with official API structure')
    console.log('PIX payment data:', JSON.stringify(paymentData, null, 2))

    // Make request to Mercado Pago API
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': externalReference
      },
      body: JSON.stringify(paymentData)
    })

    const mpData = await mpResponse.json()
    
    console.log('MercadoPago PIX response status:', mpResponse.status)
    console.log('MercadoPago PIX response:', JSON.stringify(mpData, null, 2))

    if (!mpResponse.ok) {
      console.error('MercadoPago PIX API error:', mpData)
      
      let errorMessage = 'Erro no processamento PIX'
      let errorCode = 'pix_error'
      
      // Handle specific PIX errors - Tentar novamente em vez de falhar
      if (mpData.message && mpData.message.includes('Collector user without key enabled')) {
        errorMessage = 'Conta PIX sendo configurada. Aguarde alguns segundos e tente novamente.'
        errorCode = '13253'
      } else if (mpData.cause && Array.isArray(mpData.cause)) {
        const cause = mpData.cause[0]
        if (cause.code === '13253' || cause.description?.includes('Financial Identity Use Case')) {
          errorMessage = 'Conta PIX sendo configurada. Aguarde alguns segundos e tente novamente.'
          errorCode = '13253'
        }
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          error_code: errorCode,
          error_cause: mpData.cause,
          retryable: true
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Store transaction in database
    const { data: transaction, error: dbError } = await supabase
      .from('transactions')
      .insert({
        user_id: requestData.user_id,
        account_id: requestData.account_id,
        amount: requestData.amount,
        currency: 'BRL',
        status: 'pending',
        mercado_pago_payment_id: mpData.id?.toString(),
        mercado_pago_external_reference: externalReference,
        mercado_pago_payment_status: mpData.status,
        mercado_pago_payment_method: 'pix',
        qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64,
        ticket_url: mpData.point_of_interaction?.transaction_data?.ticket_url,
        stripe_session_id: `mp_pix_${mpData.id}` // Use MP payment ID as session reference
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error storing transaction:', dbError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao salvar transação',
          error_code: 'database_error'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('PIX payment created successfully:', {
      payment_id: mpData.id,
      status: mpData.status,
      external_reference: externalReference,
      transaction_id: transaction.id
    })

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: mpData.id,
        status: mpData.status,
        qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64,
        ticket_url: mpData.point_of_interaction?.transaction_data?.ticket_url,
        transaction_id: transaction.id,
        external_reference: externalReference
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in PIX payment function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor',
        error_code: 'server_error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})