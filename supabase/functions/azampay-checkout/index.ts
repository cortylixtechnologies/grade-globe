import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, amount, provider, materialId, materialTitle } = await req.json();

    console.log('Checkout request:', { phoneNumber, amount, provider, materialId, materialTitle });

    // Validate inputs
    if (!phoneNumber || !amount || !provider || !materialId) {
      throw new Error('Missing required fields: phoneNumber, amount, provider, materialId');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate unique external ID
    const externalId = `TASSA-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // First, get auth token
    const authResponse = await fetch(`${supabaseUrl}/functions/v1/azampay-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!authResponse.ok) {
      const authError = await authResponse.text();
      console.error('Auth failed:', authError);
      throw new Error('Failed to authenticate with AzamPay');
    }

    const { accessToken } = await authResponse.json();
    console.log('Got access token');

    // Create payment record in database
    const { data: payment, error: insertError } = await supabase
      .from('payments')
      .insert({
        user_phone: phoneNumber,
        amount: amount,
        currency: 'TZS',
        provider: provider,
        external_id: externalId,
        status: 'pending',
        material_id: materialId,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create payment record:', insertError);
      throw new Error('Failed to create payment record');
    }

    console.log('Payment record created:', payment.id);

    // Map provider to AzamPay accountProvider
    const providerMap: Record<string, string> = {
      'mpesa': 'Mpesa',
      'tigopesa': 'Tigo',
      'airtelmoney': 'Airtel',
      'halopesa': 'Halopesa',
    };

    const accountProvider = providerMap[provider.toLowerCase()] || provider;

    // Make MNO Checkout request
    const checkoutUrl = 'https://sandbox.azampay.co.tz/azampay/mno/checkout';
    
    const checkoutPayload = {
      accountNumber: phoneNumber,
      amount: amount.toString(),
      currency: 'TZS',
      externalId: externalId,
      provider: accountProvider,
      additionalProperties: {
        materialId: materialId,
        materialTitle: materialTitle || 'Geography Material',
      },
    };

    console.log('Sending checkout request:', JSON.stringify(checkoutPayload));

    const checkoutResponse = await fetch(checkoutUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(checkoutPayload),
    });

    const checkoutText = await checkoutResponse.text();
    console.log('Checkout response status:', checkoutResponse.status);
    console.log('Checkout response:', checkoutText);

    if (!checkoutResponse.ok) {
      // Update payment status to failed
      await supabase
        .from('payments')
        .update({ status: 'failed', callback_data: { error: checkoutText } })
        .eq('id', payment.id);

      throw new Error(`Checkout failed: ${checkoutText}`);
    }

    const checkoutData = JSON.parse(checkoutText);

    // Update payment with AzamPay reference
    if (checkoutData.transactionId) {
      await supabase
        .from('payments')
        .update({ azampay_reference: checkoutData.transactionId })
        .eq('id', payment.id);
    }

    return new Response(JSON.stringify({
      success: true,
      paymentId: payment.id,
      externalId: externalId,
      message: 'Payment initiated. Please check your phone to complete the transaction.',
      azampayResponse: checkoutData,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in azampay-checkout:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
