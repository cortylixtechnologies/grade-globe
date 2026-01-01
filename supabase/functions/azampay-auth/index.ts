import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Token cache
let cachedToken: { token: string; expiresAt: number } | null = null;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const appName = Deno.env.get('AZAMPAY_APP_NAME');
    const clientId = Deno.env.get('AZAMPAY_CLIENT_ID');
    const clientSecret = Deno.env.get('AZAMPAY_CLIENT_SECRET');

    if (!appName || !clientId || !clientSecret) {
      console.error('Missing AzamPay credentials');
      throw new Error('AzamPay credentials not configured');
    }

    // Check if we have a valid cached token
    const now = Date.now();
    if (cachedToken && cachedToken.expiresAt > now) {
      console.log('Returning cached token');
      return new Response(JSON.stringify({ 
        accessToken: cachedToken.token,
        cached: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use sandbox URL for testing
    const authUrl = 'https://authenticator-sandbox.azampay.co.tz/AppRegistration/GenerateToken';
    
    console.log('Requesting new token from AzamPay...');
    
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appName: appName,
        clientId: clientId,
        clientSecret: clientSecret,
      }),
    });

    const responseText = await response.text();
    console.log('AzamPay auth response status:', response.status);
    console.log('AzamPay auth response:', responseText);

    if (!response.ok) {
      throw new Error(`AzamPay auth failed: ${response.status} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    
    if (!data.data?.accessToken) {
      throw new Error('No access token in response');
    }

    // Cache token for 50 minutes (tokens typically expire in 1 hour)
    cachedToken = {
      token: data.data.accessToken,
      expiresAt: now + (50 * 60 * 1000),
    };

    console.log('Token obtained and cached successfully');

    return new Response(JSON.stringify({ 
      accessToken: data.data.accessToken,
      cached: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in azampay-auth:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
