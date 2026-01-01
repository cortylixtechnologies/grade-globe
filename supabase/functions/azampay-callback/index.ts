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
    const callbackData = await req.json();
    console.log('AzamPay callback received:', JSON.stringify(callbackData));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract relevant fields from callback
    // AzamPay callback typically includes: transactionId, externalId, status, message
    const { 
      externalId, 
      transactionId,
      transactionstatus,
      message,
      mnoreference,
      operator,
      amount,
      utilityref,
      status
    } = callbackData;

    // Determine the actual status (AzamPay uses different field names)
    const paymentStatus = transactionstatus || status;
    const reference = transactionId || mnoreference;

    console.log('Processing callback for externalId:', externalId, 'status:', paymentStatus);

    if (!externalId) {
      console.error('No externalId in callback');
      return new Response(JSON.stringify({ success: false, error: 'Missing externalId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find the payment record
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('external_id', externalId)
      .maybeSingle();

    if (findError || !payment) {
      console.error('Payment not found:', findError);
      return new Response(JSON.stringify({ success: false, error: 'Payment not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine final status
    let finalStatus = 'pending';
    if (paymentStatus?.toLowerCase() === 'success' || paymentStatus?.toLowerCase() === 'successful') {
      finalStatus = 'success';
    } else if (paymentStatus?.toLowerCase() === 'failed' || paymentStatus?.toLowerCase() === 'failure') {
      finalStatus = 'failed';
    }

    console.log('Updating payment status to:', finalStatus);

    // Update payment record
    const updateData: Record<string, unknown> = {
      status: finalStatus,
      azampay_reference: reference || payment.azampay_reference,
      callback_data: callbackData,
    };

    // If payment successful, assign an access code
    if (finalStatus === 'success' && payment.material_id && !payment.access_code_id) {
      // Find an unused access code for this material
      const { data: accessCode, error: codeError } = await supabase
        .from('access_codes')
        .select('*')
        .eq('material_id', payment.material_id)
        .eq('used', false)
        .limit(1)
        .maybeSingle();

      if (accessCode && !codeError) {
        // Mark the code as used
        await supabase
          .from('access_codes')
          .update({
            used: true,
            used_at: new Date().toISOString(),
            used_by: payment.user_phone,
          })
          .eq('id', accessCode.id);

        updateData.access_code_id = accessCode.id;
        console.log('Access code assigned:', accessCode.code);
      } else {
        console.log('No available access code for material:', payment.material_id);
      }
    }

    // Update the payment
    const { error: updateError } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', payment.id);

    if (updateError) {
      console.error('Failed to update payment:', updateError);
      throw updateError;
    }

    console.log('Payment updated successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Callback processed successfully',
      paymentId: payment.id,
      status: finalStatus,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in azampay-callback:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
