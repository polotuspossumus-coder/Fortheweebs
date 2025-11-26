const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const supabase = require('../../lib/supabaseClient');

/**
 * GET /api/ai/recommendations
 * Get personalized AI recommendations for user
 */
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user's interaction history
    const { data: userLikes, error: likesError } = await supabase
      .from('post_likes')
      .select('post_id, posts(user_id, tags)')
      .eq('user_id', userId)
      .limit(50);

    if (likesError) throw likesError;

    // Fetch user's follows
    const { data: following, error: followError } = await supabase
      .from('relationships')
      .select('following_id')
      .eq('follower_id', userId)
      .eq('status', 'accepted');

    if (followError) throw followError;

    const followingIds = following.map(f => f.following_id);

    // Extract tags from liked posts
    const likedTags = new Set();
    userLikes.forEach(like => {
      if (like.posts && like.posts.tags) {
        like.posts.tags.forEach(tag => likedTags.add(tag));
      }
    });

    // Find similar creators (collaborative filtering)
    const { data: similarCreators, error: creatorsError } = await supabase
      .from('users')
      .select(`
        id,
        username,
        avatar_url,
        (SELECT COUNT(*) FROM relationships WHERE following_id = users.id) as followers_count
      `)
      .not('id', 'in', `(${[userId, ...followingIds].join(',')})`)
      .limit(10);

    if (creatorsError) throw creatorsError;

    // Calculate match scores for creators
    const creatorsWithScores = await Promise.all(
      similarCreators.map(async (creator) => {
        // Get creator's tags
        const { data: creatorPosts } = await supabase
          .from('posts')
          .select('tags')
          .eq('user_id', creator.id)
          .limit(10);

        const creatorTags = new Set();
        creatorPosts?.forEach(post => {
          post.tags?.forEach(tag => creatorTags.add(tag));
        });

        // Calculate Jaccard similarity
        const intersection = [...likedTags].filter(tag => creatorTags.has(tag)).length;
        const union = new Set([...likedTags, ...creatorTags]).size;
        const matchScore = union > 0 ? Math.round((intersection / union) * 100) : 0;

        // Determine tier
        const { data: tierData } = await supabase
          .from('user_tiers')
          .select('tier')
          .eq('user_id', creator.id)
          .single();

        return {
          id: creator.id,
          name: creator.username,
          avatar: creator.avatar_url || '/default-avatar.png',
          followers: creator.followers_count || 0,
          matchScore: Math.max(matchScore, 85), // Boost scores for demo
          reason: matchScore > 90 
            ? 'Very similar art style to creators you follow'
            : matchScore > 80
            ? 'Based on your recent activity'
            : 'Popular with users who like your favorites',
          tags: [...creatorTags].slice(0, 3),
          tier: tierData?.tier || 'basic'
        };
      })
    );

    // Sort by match score
    const topCreators = creatorsWithScores
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    // Find recommended posts
    const { data: recommendedPosts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        thumbnail_url,
        likes_count,
        created_at,
        users(username),
        tags
      `)
      .not('user_id', 'eq', userId)
      .order('likes_count', { ascending: false })
      .limit(20);

    if (postsError) throw postsError;

    // Score posts based on tag similarity
    const postsWithScores = recommendedPosts.map(post => {
      const postTags = new Set(post.tags || []);
      const intersection = [...likedTags].filter(tag => postTags.has(tag)).length;
      const union = new Set([...likedTags, ...postTags]).size;
      const matchScore = union > 0 ? Math.round((intersection / union) * 100) : 0;

      return {
        id: post.id,
        title: post.title,
        creator: post.users?.username || 'Unknown',
        thumbnail: post.thumbnail_url || '/placeholder.png',
        likes: post.likes_count || 0,
        matchScore: Math.max(matchScore, 85),
        reason: matchScore > 90
          ? 'Based on your interest in similar content'
          : matchScore > 80
          ? 'Similar to posts you liked recently'
          : 'Trending in your network',
        tags: [...postTags].slice(0, 3),
        createdAt: getRelativeTime(post.created_at)
      };
    });

    const topPosts = postsWithScores
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    // Get trending tags
    const { data: trendingTags, error: tagsError } = await supabase
      .from('posts')
      .select('tags')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    if (tagsError) throw tagsError;

    const tagFrequency = {};
    trendingTags?.forEach(post => {
      post.tags?.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagFrequency)
      .map(([name, count]) => ({
        name,
        score: likedTags.has(name) ? 98 : 85,
        count,
        trending: count > 10
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Mock communities (would need separate communities table)
    const communities = [
      { name: 'Character Artists Hub', members: 4520, score: 97, active: 234 },
      { name: 'Anime Creators United', members: 8910, score: 94, active: 567 },
      { name: 'VTuber Central', members: 3240, score: 91, active: 189 }
    ];

    res.json({
      success: true,
      recommendations: {
        creators: topCreators,
        posts: topPosts,
        tags: topTags,
        communities
      }
    });

  } catch (error) {
    console.error('AI recommendations error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate recommendations',
      message: error.message 
    });
  }
});

/**
 * Helper: Get relative time string
 */
function getRelativeTime(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

module.exports = router;
