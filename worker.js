export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
        }
      });
    }

    try {
      const body = await request.json();
      
      // Validate required fields
      if (!body.message) {
        return new Response(JSON.stringify({ error: 'Message is required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
          }
        });
      }

      // Call Cohere API with your secure key
      const cohereResponse = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.COHERE_API_KEY}`, // = Secure server-side only!
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: body.model || 'command-r-plus',
          message: body.message,
          chat_history: body.chat_history || [],
          preamble: body.preamble || '',
          max_tokens: Math.min(body.max_tokens || 100, 150), // Cap at 150 for safety
        })
      });

      if (!cohereResponse.ok) {
        const errorText = await cohereResponse.text();
        console.error('Cohere API error:', errorText);
        
        return new Response(JSON.stringify({ 
          error: 'AI service temporarily unavailable',
          details: cohereResponse.status === 429 ? 'Rate limit exceeded' : 'Service error'
        }), {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
          }
        });
      }

      const data = await cohereResponse.json();
      
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
        }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error' 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
        }
      });
    }
  }
}