const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Middleware to verify authentication
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Get user points and tier
router.get('/status', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // Create record if doesn't exist
    if (!data) {
      const { data: newRecord, error: insertError } = await supabase
        .from('user_points')
        .insert({
          user_id: req.user.id,
          points: 0,
          tier: 'Bronze',
          total_earned: 0,
          total_spent: 0
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return res.json({ status: newRecord });
    }

    res.json({ status: data });
  } catch (error) {
    console.error('Error fetching points:', error);
    res.status(500).json({ error: 'Failed to fetch points status' });
  }
});

// Get points history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('points_history')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      history: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch points history' });
  }
});

// Award points (internal use or admin)
router.post('/award', requireAuth, async (req, res) => {
  try {
    const { user_id, points, reason, type } = req.body;
    const targetUserId = user_id || req.user.id;

    if (!points || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get current points
    let { data: userPoints } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    // Create if doesn't exist
    if (!userPoints) {
      const { data: newRecord } = await supabase
        .from('user_points')
        .insert({
          user_id: targetUserId,
          points: 0,
          tier: 'Bronze',
          total_earned: 0,
          total_spent: 0
        })
        .select()
        .single();
      userPoints = newRecord;
    }

    const newPoints = userPoints.points + points;
    const newTotalEarned = userPoints.total_earned + points;

    // Calculate new tier based on total earned
    let newTier = 'Bronze';
    if (newTotalEarned >= 15000) newTier = 'Diamond';
    else if (newTotalEarned >= 7000) newTier = 'Platinum';
    else if (newTotalEarned >= 3000) newTier = 'Gold';
    else if (newTotalEarned >= 1000) newTier = 'Silver';

    // Update points
    const { data: updated, error: updateError } = await supabase
      .from('user_points')
      .update({
        points: newPoints,
        total_earned: newTotalEarned,
        tier: newTier
      })
      .eq('user_id', targetUserId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Add to history
    await supabase
      .from('points_history')
      .insert({
        user_id: targetUserId,
        points,
        type: type || 'earned',
        reason
      });

    res.json({ status: updated, points_awarded: points });
  } catch (error) {
    console.error('Error awarding points:', error);
    res.status(500).json({ error: 'Failed to award points' });
  }
});

// Get achievements
router.get('/achievements', requireAuth, async (req, res) => {
  try {
    const { data: allAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .order('points', { ascending: true });

    if (achievementsError) throw achievementsError;

    const { data: unlockedAchievements, error: unlockedError } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', req.user.id);

    if (unlockedError) throw unlockedError;

    const unlockedIds = new Set(unlockedAchievements.map(a => a.achievement_id));

    const achievements = allAchievements.map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
      unlocked_at: unlockedAchievements.find(u => u.achievement_id === achievement.id)?.unlocked_at
    }));

    res.json({ achievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Unlock achievement (internal or triggered by actions)
router.post('/achievements/unlock', requireAuth, async (req, res) => {
  try {
    const { achievement_id } = req.body;

    if (!achievement_id) {
      return res.status(400).json({ error: 'Missing achievement_id' });
    }

    // Check if already unlocked
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('achievement_id', achievement_id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Achievement already unlocked' });
    }

    // Get achievement details
    const { data: achievement, error: achievementError } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', achievement_id)
      .single();

    if (achievementError) throw achievementError;

    // Unlock achievement
    const { error: unlockError } = await supabase
      .from('user_achievements')
      .insert({
        user_id: req.user.id,
        achievement_id
      });

    if (unlockError) throw unlockError;

    // Award points
    await fetch(`${req.protocol}://${req.get('host')}/api/rewards/award`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization
      },
      body: JSON.stringify({
        points: achievement.points,
        reason: `Unlocked achievement: ${achievement.name}`,
        type: 'achievement'
      })
    });

    res.json({
      message: 'Achievement unlocked!',
      achievement,
      points_awarded: achievement.points
    });
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    res.status(500).json({ error: 'Failed to unlock achievement' });
  }
});

// Get rewards shop
router.get('/shop', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rewards_shop')
      .select('*')
      .eq('active', true)
      .order('cost', { ascending: true });

    if (error) throw error;

    res.json({ rewards: data });
  } catch (error) {
    console.error('Error fetching shop:', error);
    res.status(500).json({ error: 'Failed to fetch rewards shop' });
  }
});

// Redeem reward
router.post('/redeem', requireAuth, async (req, res) => {
  try {
    const { reward_id } = req.body;

    if (!reward_id) {
      return res.status(400).json({ error: 'Missing reward_id' });
    }

    // Get reward details
    const { data: reward, error: rewardError } = await supabase
      .from('rewards_shop')
      .select('*')
      .eq('id', reward_id)
      .single();

    if (rewardError) throw rewardError;

    if (!reward.active) {
      return res.status(400).json({ error: 'Reward not available' });
    }

    // Get user points
    const { data: userPoints, error: pointsError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (pointsError) throw pointsError;

    // Check if user has enough points
    if (userPoints.points < reward.cost) {
      return res.status(400).json({ error: 'Insufficient points' });
    }

    // Deduct points
    const newPoints = userPoints.points - reward.cost;
    const newTotalSpent = userPoints.total_spent + reward.cost;

    const { error: updateError } = await supabase
      .from('user_points')
      .update({
        points: newPoints,
        total_spent: newTotalSpent
      })
      .eq('user_id', req.user.id);

    if (updateError) throw updateError;

    // Record redemption
    const { data: redemption, error: redemptionError } = await supabase
      .from('reward_redemptions')
      .insert({
        user_id: req.user.id,
        reward_id,
        cost: reward.cost,
        status: 'pending'
      })
      .select()
      .single();

    if (redemptionError) throw redemptionError;

    // Add to history
    await supabase
      .from('points_history')
      .insert({
        user_id: req.user.id,
        points: -reward.cost,
        type: 'spent',
        reason: `Redeemed: ${reward.name}`
      });

    res.json({
      message: 'Reward redeemed successfully!',
      redemption,
      new_balance: newPoints
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    res.status(500).json({ error: 'Failed to redeem reward' });
  }
});

// Get user's redemptions
router.get('/redemptions', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('reward_redemptions')
      .select('*, reward:rewards_shop(*)', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('redeemed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      redemptions: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching redemptions:', error);
    res.status(500).json({ error: 'Failed to fetch redemptions' });
  }
});

module.exports = router;
