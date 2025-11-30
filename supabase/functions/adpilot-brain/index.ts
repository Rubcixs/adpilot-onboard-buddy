import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to safely extract JSON
function cleanJson(text: string): string {
  try {
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '');
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace >= 0) {
      return cleaned.substring(firstBrace, lastBrace + 1);
    }
    return cleaned.trim();
  } catch (e) {
    return text;
  }
}

// AI System Prompt for Zero-Data Forecast
const ADPILOT_BRAIN_NO_DATA = `You are an API endpoint. 
ROLE: Ad Strategist and Forecaster.
INPUT: Business details, budget, AOV, and marketing goal.
OUTPUT: Valid JSON only. Do not wrap the JSON in markdown fences.

RESPONSE STRUCTURE:
{
  "quickVerdict": "A single, short, and compelling summary of the strategy.",
  "benchmarks": {
    "cpm": 10.5,
    "cpc": 1.2,
    "ctr": 1.5,
    "cpa": 30.0,
    "roas": 2.5
  },
  "forecast": {
    "totalBudget": 3000,
    "impressionsRange": "250,000 - 300,000",
    "clicksRange": "3,000 - 3,600",
    "conversionsRange": "100 - 120"
  },
  "structure": [
    { 
      "name": "Campaign - Prospecting (TOF)", 
      "goal": "Conversions", 
      "budgetAllocation": "50%",
      "reason": "Focus on high-quality cold traffic acquisition."
    },
    { 
      "name": "Campaign - Retargeting (BOF)", 
      "goal": "Conversions", 
      "budgetAllocation": "30%",
      "reason": "High-efficiency budget for converting existing visitors."
    }
  ],
  "roadmap": [
    { "week": "Week 1", "title": "Setup & Creative Testing", "description": "Launch 3 ad sets (2 prospecting, 1 retargeting). Test 5 video/image ad variants." },
    { "week": "Week 2", "title": "Optimization & Scaling", "description": "Pause worst-performing creatives. Reallocate 20% of budget to best-performing ad set." }
  ]
}

RULES:
1. RAW JSON ONLY. No markdown.
2. Ensure all fields in the RESPONSE STRUCTURE are present and correctly formatted.
3. Base all numbers (benchmarks, forecast) on the provided INPUT data and industry standards.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const body = await req.json();
    console.log('Received request body:', JSON.stringify(body));
    
    // Handle both direct and nested data structures
    const requestData = body.type === 'no-data' ? body.data : body;
    
    // Extract and map fields
    const goal = requestData.goal;
    const budget = requestData.budget;
    const aov = requestData.productPrice || requestData.aov; // Map productPrice to aov
    const industry = requestData.businessType || requestData.industry; // Map businessType to industry
    const description = requestData.businessName || requestData.description || '';

    console.log('Extracted data:', { goal, budget, aov, industry, description });

    if (!budget || !goal || !aov || !industry) {
      throw new Error(`Missing required inputs. Received: budget=${budget}, goal=${goal}, aov=${aov}, industry=${industry}`);
    }

    const lovableKey = Deno.env.get('LOVABLE_API_KEY')
    if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured.");
    
    const userPayload = {
      goal,
      budget,
      aov,
      industry,
      description: description || "No detailed description provided.",
    };

    console.log(`Generating zero-data forecast for: ${JSON.stringify(userPayload)}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          { 
            role: 'system', 
            content: ADPILOT_BRAIN_NO_DATA 
          },
          { 
            role: 'user', 
            content: `User Inputs: ${JSON.stringify(userPayload)}` 
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`Lovable AI failed: ${response.status}`);
    }

    const aiData = await response.json();
    console.log('AI response:', JSON.stringify(aiData));
    let forecastInsights = null;

    if (aiData.choices && aiData.choices[0]?.message?.content) {
      forecastInsights = JSON.parse(cleanJson(aiData.choices[0].message.content));
    } else {
      throw new Error("AI did not return a valid forecast structure.");
    }
    
    const finalResponse = {
      ok: true,
      inputs: userPayload,
      aiForecast: forecastInsights
    };

    return new Response(JSON.stringify(finalResponse), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    console.error('Fatal Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
