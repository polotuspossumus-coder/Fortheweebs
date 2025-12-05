/**
 * COMMISSION CREATION API
 * Allows creators to list commissions
 */

export async function POST(request) {
  try {
    const { userId, title, description, price, turnaroundDays, slots, tags, examples } = await request.json();

    // Validation
    if (!userId || !title || !price) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: userId, title, price'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (price < 5 || price > 5000) {
      return new Response(JSON.stringify({
        error: 'Price must be between $5 and $5,000'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Create commission (TODO: Save to database)
    const commission = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      creatorId: userId,
      title,
      description: description || '',
      price,
      turnaroundDays: turnaroundDays || 7,
      slots: slots || 1,
      tags: tags || [],
      examples: examples || [],
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    console.log('Commission created:', commission);

    return new Response(JSON.stringify({
      success: true,
      commission
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Commission creation error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to create commission'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET(request) {
  try {
    // TODO: Fetch from database
    // For now, return empty array (replace mock data)
    return new Response(JSON.stringify({
      success: true,
      commissions: []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
