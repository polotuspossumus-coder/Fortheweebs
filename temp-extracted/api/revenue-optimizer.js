/**
 * Revenue Optimization API - Phase 4
 * Forecasting, pricing recommendations, A/B testing, insights
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * GET /api/revenue-optimizer/forecast/:creatorId
 * Revenue forecasting based on historical data
 */
router.get('/forecast/:creatorId', async (req, res) => {
    try {
        const { creatorId } = req.params;
        const { months = 3 } = req.query;

        // Get historical revenue data (last 12 months)
        const { data: history, error: historyError } = await supabase
            .from('creator_earnings')
            .select('month, total_earnings, subscriptions, tips, commissions, sales')
            .eq('creator_id', creatorId)
            .order('month', { ascending: false })
            .limit(12);

        if (historyError) throw historyError;

        if (!history || history.length < 3) {
            return res.status(400).json({ error: 'Insufficient data for forecasting (need at least 3 months)' });
        }

        // Simple linear regression forecast
        const forecast = [];
        const monthlyGrowthRates = [];

        for (let i = 1; i < history.length; i++) {
            const growth = (history[i - 1].total_earnings - history[i].total_earnings) / history[i].total_earnings;
            monthlyGrowthRates.push(growth);
        }

        const avgGrowthRate = monthlyGrowthRates.reduce((sum, rate) => sum + rate, 0) / monthlyGrowthRates.length;
        let lastEarnings = history[0].total_earnings;

        for (let i = 1; i <= parseInt(months); i++) {
            const forecastedEarnings = lastEarnings * (1 + avgGrowthRate);
            const forecastDate = new Date();
            forecastDate.setMonth(forecastDate.getMonth() + i);

            forecast.push({
                month: forecastDate.toISOString().substring(0, 7),
                forecasted_earnings: Math.round(forecastedEarnings),
                confidence: Math.max(0.5, 1 - (i * 0.15)) // Confidence decreases with time
            });

            lastEarnings = forecastedEarnings;
        }

        res.json({
            historical: history.reverse(),
            forecast,
            insights: {
                avgMonthlyGrowth: (avgGrowthRate * 100).toFixed(2) + '%',
                trend: avgGrowthRate > 0 ? 'growing' : avgGrowthRate < 0 ? 'declining' : 'stable'
            }
        });

    } catch (error) {
        console.error('Forecast error:', error);
        res.status(500).json({ error: 'Failed to generate forecast', details: error.message });
    }
});

/**
 * POST /api/revenue-optimizer/pricing-recommendation
 * AI-powered pricing recommendations
 */
router.post('/pricing-recommendation', async (req, res) => {
    try {
        const { creatorId, contentType, currentPrice, metrics } = req.body;

        if (!creatorId || !contentType) {
            return res.status(400).json({ error: 'creatorId and contentType required' });
        }

        // Get creator stats
        const { data: creator, error: creatorError } = await supabase
            .from('creators')
            .select('follower_count, subscriber_count, avg_engagement_rate, niche')
            .eq('id', creatorId)
            .single();

        if (creatorError) throw creatorError;

        // Get industry benchmarks
        const { data: benchmarks, error: benchError } = await supabase
            .from('pricing_benchmarks')
            .select('avg_price, percentile_25, percentile_75')
            .eq('content_type', contentType)
            .eq('niche', creator.niche)
            .single();

        // Use AI to analyze and recommend
        const prompt = `As a revenue optimization expert, recommend optimal pricing for a creator with:
- Content Type: ${contentType}
- Current Price: $${currentPrice || 'not set'}
- Follower Count: ${creator.follower_count}
- Subscriber Count: ${creator.subscriber_count}
- Engagement Rate: ${creator.avg_engagement_rate}%
- Niche: ${creator.niche}
- Industry Average: $${benchmarks?.avg_price / 100 || 'unknown'}

Provide:
1. Recommended price
2. Reasoning
3. Expected impact on conversions
4. Alternative pricing tiers`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'You are a revenue optimization expert specializing in creator economy pricing strategies.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const recommendation = completion.choices[0].message.content;

        // Calculate suggested price algorithmically as backup
        let suggestedPrice = currentPrice || 0;

        if (benchmarks) {
            // Start with industry average
            suggestedPrice = benchmarks.avg_price;

            // Adjust based on engagement
            if (creator.avg_engagement_rate > 5) {
                suggestedPrice *= 1.2; // 20% premium for high engagement
            } else if (creator.avg_engagement_rate < 2) {
                suggestedPrice *= 0.8; // 20% discount for low engagement
            }

            // Adjust based on follower count
            if (creator.follower_count > 100000) {
                suggestedPrice *= 1.3;
            } else if (creator.follower_count < 1000) {
                suggestedPrice *= 0.7;
            }
        }

        res.json({
            recommendedPrice: Math.round(suggestedPrice) / 100,
            currentPrice: currentPrice,
            aiAnalysis: recommendation,
            benchmarks: benchmarks ? {
                average: benchmarks.avg_price / 100,
                range: {
                    low: benchmarks.percentile_25 / 100,
                    high: benchmarks.percentile_75 / 100
                }
            } : null,
            factors: {
                followerCount: creator.follower_count,
                engagementRate: creator.avg_engagement_rate,
                subscriberCount: creator.subscriber_count
            }
        });

    } catch (error) {
        console.error('Pricing recommendation error:', error);
        res.status(500).json({ error: 'Failed to generate pricing recommendation', details: error.message });
    }
});

/**
 * POST /api/revenue-optimizer/ab-test/create
 * Create an A/B test for pricing or features
 */
router.post('/ab-test/create', async (req, res) => {
    try {
        const { creatorId, testName, variantA, variantB, metric, duration } = req.body;

        if (!creatorId || !testName || !variantA || !variantB || !metric) {
            return res.status(400).json({ error: 'All fields required' });
        }

        const { data, error } = await supabase
            .from('ab_tests')
            .insert({
                creator_id: creatorId,
                test_name: testName,
                variant_a: variantA,
                variant_b: variantB,
                success_metric: metric,
                duration_days: duration || 14,
                status: 'active',
                variant_a_impressions: 0,
                variant_b_impressions: 0,
                variant_a_conversions: 0,
                variant_b_conversions: 0,
                started_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            test: data,
            message: 'A/B test created. Results will be available after sufficient data collection'
        });

    } catch (error) {
        console.error('Create A/B test error:', error);
        res.status(500).json({ error: 'Failed to create A/B test', details: error.message });
    }
});

/**
 * POST /api/revenue-optimizer/ab-test/:testId/record
 * Record A/B test impression or conversion
 */
router.post('/ab-test/:testId/record', async (req, res) => {
    try {
        const { testId } = req.params;
        const { variant, event, userId } = req.body;

        if (!variant || !event) {
            return res.status(400).json({ error: 'variant and event required' });
        }

        // Record event
        const { error: eventError } = await supabase
            .from('ab_test_events')
            .insert({
                test_id: testId,
                variant,
                event_type: event,
                user_id: userId,
                timestamp: new Date().toISOString()
            });

        if (eventError) throw eventError;

        // Update test metrics
        const column = event === 'impression' 
            ? `variant_${variant}_impressions`
            : `variant_${variant}_conversions`;

        await supabase.rpc('increment_ab_test_metric', {
            test_id: testId,
            metric_column: column
        });

        res.json({ message: 'Event recorded' });

    } catch (error) {
        console.error('Record A/B test event error:', error);
        res.status(500).json({ error: 'Failed to record event', details: error.message });
    }
});

/**
 * GET /api/revenue-optimizer/ab-test/:testId/results
 * Get A/B test results
 */
router.get('/ab-test/:testId/results', async (req, res) => {
    try {
        const { testId } = req.params;

        const { data: test, error } = await supabase
            .from('ab_tests')
            .select('*')
            .eq('id', testId)
            .single();

        if (error) throw error;

        // Calculate conversion rates
        const conversionRateA = test.variant_a_impressions > 0 
            ? (test.variant_a_conversions / test.variant_a_impressions) * 100 
            : 0;

        const conversionRateB = test.variant_b_impressions > 0 
            ? (test.variant_b_conversions / test.variant_b_impressions) * 100 
            : 0;

        // Determine statistical significance (simplified)
        const minSampleSize = 100;
        const hasSignificance = test.variant_a_impressions >= minSampleSize && 
                                test.variant_b_impressions >= minSampleSize &&
                                Math.abs(conversionRateA - conversionRateB) > 2;

        const winner = conversionRateA > conversionRateB ? 'A' : 
                       conversionRateB > conversionRateA ? 'B' : 'tie';

        const improvement = winner !== 'tie' 
            ? Math.abs(conversionRateA - conversionRateB).toFixed(2) 
            : 0;

        res.json({
            test,
            results: {
                variantA: {
                    impressions: test.variant_a_impressions,
                    conversions: test.variant_a_conversions,
                    conversionRate: conversionRateA.toFixed(2) + '%'
                },
                variantB: {
                    impressions: test.variant_b_impressions,
                    conversions: test.variant_b_conversions,
                    conversionRate: conversionRateB.toFixed(2) + '%'
                },
                winner,
                improvement: improvement + '%',
                statisticallySignificant: hasSignificance,
                recommendation: hasSignificance 
                    ? `Use variant ${winner} for ${improvement}% better performance`
                    : 'Continue test to reach statistical significance'
            }
        });

    } catch (error) {
        console.error('A/B test results error:', error);
        res.status(500).json({ error: 'Failed to fetch results', details: error.message });
    }
});

/**
 * GET /api/revenue-optimizer/insights/:creatorId
 * AI-powered revenue insights and recommendations
 */
router.get('/insights/:creatorId', async (req, res) => {
    try {
        const { creatorId } = req.params;

        // Get comprehensive creator data
        const [
            { data: earnings },
            { data: subscribers },
            { data: content },
            { data: engagement }
        ] = await Promise.all([
            supabase.from('creator_earnings').select('*').eq('creator_id', creatorId).order('month', { ascending: false }).limit(6),
            supabase.from('subscriptions').select('tier, created_at').eq('creator_id', creatorId),
            supabase.from('content').select('type, views, likes').eq('creator_id', creatorId).order('created_at', { ascending: false }).limit(20),
            supabase.from('engagement_metrics').select('*').eq('creator_id', creatorId).single()
        ]);

        // Analyze with AI
        const analysisPrompt = `Analyze this creator's revenue data and provide actionable insights:

Recent Earnings (last 6 months): ${JSON.stringify(earnings)}
Subscriber Distribution: ${subscribers?.length} total
Recent Content Performance: ${content?.length} pieces
Engagement Metrics: ${JSON.stringify(engagement)}

Provide:
1. Top 3 revenue opportunities
2. Identified weak points
3. Recommended actions
4. Expected revenue impact`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'You are a revenue optimization expert for content creators.' },
                { role: 'user', content: analysisPrompt }
            ],
            temperature: 0.7,
            max_tokens: 600
        });

        const aiInsights = completion.choices[0].message.content;

        // Calculate key metrics
        const totalRevenue = earnings?.reduce((sum, e) => sum + e.total_earnings, 0) || 0;
        const avgMonthlyRevenue = earnings?.length > 0 ? totalRevenue / earnings.length : 0;
        const revenueGrowth = earnings?.length >= 2 
            ? ((earnings[0].total_earnings - earnings[1].total_earnings) / earnings[1].total_earnings) * 100 
            : 0;

        res.json({
            aiInsights,
            keyMetrics: {
                totalRevenue: totalRevenue / 100,
                avgMonthlyRevenue: avgMonthlyRevenue / 100,
                revenueGrowth: revenueGrowth.toFixed(2) + '%',
                subscriberCount: subscribers?.length || 0,
                engagementRate: engagement?.avg_engagement_rate || 0
            },
            quickWins: [
                {
                    action: 'Launch a limited-time promotion',
                    expectedImpact: '+15-25% revenue',
                    difficulty: 'Easy'
                },
                {
                    action: 'Create a premium tier',
                    expectedImpact: '+30-40% revenue from top fans',
                    difficulty: 'Medium'
                },
                {
                    action: 'Start exclusive merchandise',
                    expectedImpact: '+20-35% additional revenue stream',
                    difficulty: 'Medium'
                }
            ]
        });

    } catch (error) {
        console.error('Insights error:', error);
        res.status(500).json({ error: 'Failed to generate insights', details: error.message });
    }
});

/**
 * GET /api/revenue-optimizer/churn-risk/:creatorId
 * Identify subscribers at risk of canceling
 */
router.get('/churn-risk/:creatorId', async (req, res) => {
    try {
        const { creatorId } = req.params;

        // Get subscribers with engagement data
        const { data: subscribers, error } = await supabase
            .from('subscriptions')
            .select(`
                id,
                user_id,
                tier,
                created_at,
                last_payment_at,
                user:user_id(last_seen_at)
            `)
            .eq('creator_id', creatorId)
            .eq('status', 'active');

        if (error) throw error;

        // Calculate churn risk score for each subscriber
        const atRisk = subscribers
            .map(sub => {
                const daysSinceLastSeen = sub.user?.last_seen_at 
                    ? Math.floor((Date.now() - new Date(sub.user.last_seen_at).getTime()) / (1000 * 60 * 60 * 24))
                    : 999;

                const daysSinceSubscribed = Math.floor((Date.now() - new Date(sub.created_at).getTime()) / (1000 * 60 * 60 * 24));

                let riskScore = 0;

                // Risk factors
                if (daysSinceLastSeen > 14) riskScore += 30;
                if (daysSinceLastSeen > 30) riskScore += 40;
                if (daysSinceSubscribed < 60) riskScore += 20; // New subscribers more likely to churn
                
                return {
                    subscriberId: sub.id,
                    userId: sub.user_id,
                    tier: sub.tier,
                    daysSinceLastSeen,
                    riskScore: Math.min(riskScore, 100),
                    riskLevel: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low'
                };
            })
            .filter(sub => sub.riskScore > 40)
            .sort((a, b) => b.riskScore - a.riskScore);

        res.json({
            totalSubscribers: subscribers.length,
            atRiskCount: atRisk.length,
            atRiskSubscribers: atRisk.slice(0, 20), // Top 20 at risk
            recommendations: [
                'Send personalized re-engagement message',
                'Offer exclusive content preview',
                'Create limited-time discount for renewal',
                'Ask for feedback via survey'
            ]
        });

    } catch (error) {
        console.error('Churn risk error:', error);
        res.status(500).json({ error: 'Failed to calculate churn risk', details: error.message });
    }
});

module.exports = router;
