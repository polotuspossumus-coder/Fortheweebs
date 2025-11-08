import { verify } from 'jsonwebtoken';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    try {
      verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // TODO: Query database for user's payment tier
    // For now, return FREE as default
    // Replace this with actual database query:
    //   const user = await db.users.findOne({ userId });
    //   const tier = user.paymentTier || 'FREE';

    const tier = 'FREE'; // Default tier

    return new Response(JSON.stringify({
      tier,
      userId,
      features: getTierFeatures(tier)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('User tier check error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

function getTierFeatures(tier) {
  const features = {
    FREE: ['View content', 'Basic features'],
    CREATOR: ['100% profit', 'AR/VR tools', 'Cloud upload', '3D viewer', 'VR galleries'],
    SUPER_ADMIN: ['Everything in CREATOR', 'AI content generator', 'View all content free', 'Super admin access']
  };
  return features[tier] || features.FREE;
}
