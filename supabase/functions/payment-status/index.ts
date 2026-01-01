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
    const { paymentId, externalId } = await req.json();

    if (!paymentId && !externalId) {
      throw new Error('Either paymentId or externalId is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase.from('payments').select(`
      *,
      access_codes (code),
      materials (title, drive_link)
    `);

    if (paymentId) {
      query = query.eq('id', paymentId);
    } else {
      query = query.eq('external_id', externalId);
    }

    const { data: payment, error } = await query.maybeSingle();

    if (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }

    if (!payment) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Payment not found' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        provider: payment.provider,
        createdAt: payment.created_at,
        accessCode: payment.access_codes?.code || null,
        material: payment.materials ? {
          title: payment.materials.title,
          driveLink: payment.materials.drive_link,
        } : null,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in payment-status:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
