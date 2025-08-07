const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Getting Mercado Pago public key');

  try {
    const publicKey = Deno.env.get('MERCADO_PAGO_PUBLIC_KEY');
    
    console.log('MERCADO_PAGO_PUBLIC_KEY exists:', !!publicKey);
    console.log('MERCADO_PAGO_PUBLIC_KEY length:', publicKey?.length || 0);

    if (!publicKey) {
      console.error('MERCADO_PAGO_PUBLIC_KEY not found in environment');
      return new Response(
        JSON.stringify({ 
          error: 'Public key not configured',
          publicKey: null
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Public key found and valid, returning to client');

    return new Response(
      JSON.stringify({ publicKey }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error getting Mercado Pago public key:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        publicKey: null
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})