
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json();
    
    // Replace with your Name.com API credentials
    const NAMECOM_TOKEN = process.env.NAMECOM_TOKEN;
    const NAMECOM_USERNAME = process.env.NAMECOM_USERNAME;
    
    if (!NAMECOM_TOKEN || !NAMECOM_USERNAME) {
      console.error('Name.com API credentials not configured');
      return NextResponse.json({ 
        domain,
        available: false,
        price: null,
        error: 'API credentials not configured'
      });
    }

    const response = await fetch(`https://api.name.com/v4/domains:checkAvailability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${NAMECOM_USERNAME}:${NAMECOM_TOKEN}`).toString('base64')}`
      },
      body: JSON.stringify({
        domainNames: [domain]
      })
    });

    if (!response.ok) {
      console.error('Name.com API error:', response.status, response.statusText);
      return NextResponse.json({ 
        domain,
        available: false,
        price: null,
        error: 'API request failed'
      });
    }

    const data = await response.json();
 
    return NextResponse.json({
      domain,
      available: data.results?.[0]?.purchasable || false,
      price: data.results?.[0]?.purchasePrice || 12.99
    });
  } catch (error) {
    console.error('Name.com API error:', error);

    // Try to extract the domain from the request body if possible
    let domain = null;
    try {
      const body = await request.json();
      domain = body?.domain || null;
    } catch {
      // Ignore JSON parse errors here
    }

    return NextResponse.json({ 
      domain,
      available: false,
      price: null,
      error: 'Failed to check domain availability'
    }, { status: 500 });
  }
}