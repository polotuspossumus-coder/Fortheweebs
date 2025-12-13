/**
 * Partnership Platform API - Phase 4
 * Brand deals, sponsorships, affiliate programs
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * GET /api/partnerships/opportunities
 * Browse available partnership opportunities
 */
router.get('/opportunities', async (req, res) => {
    try {
        const { type, minBudget, category, page = 1, limit = 20 } = req.query;

        let query = supabase
            .from('partnership_opportunities')
            .select('*, brand:brand_id(name, logo_url, verified), application_count')
            .eq('status', 'open')
            .order('created_at', { ascending: false });

        if (type) {
            query = query.eq('type', type);
        }

        if (minBudget) {
            query = query.gte('budget_min', parseFloat(minBudget) * 100);
        }

        if (category) {
            query = query.contains('categories', [category]);
        }

        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;
        if (error) throw error;

        res.json({
            opportunities: data,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('Opportunities error:', error);
        res.status(500).json({ error: 'Failed to fetch opportunities', details: error.message });
    }
});

/**
 * POST /api/partnerships/apply
 * Apply for a partnership opportunity
 */
router.post('/apply', async (req, res) => {
    try {
        const { opportunityId, creatorId, pitch, portfolio, metrics, desiredCompensation } = req.body;

        if (!opportunityId || !creatorId || !pitch) {
            return res.status(400).json({ error: 'opportunityId, creatorId, and pitch required' });
        }

        // Check if already applied
        const { data: existing } = await supabase
            .from('partnership_applications')
            .select('id')
            .eq('opportunity_id', opportunityId)
            .eq('creator_id', creatorId)
            .single();

        if (existing) {
            return res.status(400).json({ error: 'Already applied to this opportunity' });
        }

        const { data, error } = await supabase
            .from('partnership_applications')
            .insert({
                opportunity_id: opportunityId,
                creator_id: creatorId,
                pitch,
                portfolio: portfolio || [],
                metrics,
                desired_compensation: desiredCompensation,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        // Increment application count
        await supabase.rpc('increment_opportunity_applications', { opportunity_id: opportunityId });

        res.json({
            application: data,
            message: 'Application submitted successfully'
        });

    } catch (error) {
        console.error('Apply error:', error);
        res.status(500).json({ error: 'Failed to submit application', details: error.message });
    }
});

/**
 * GET /api/partnerships/my-deals/:creatorId
 * Get creator's active partnerships
 */
router.get('/my-deals/:creatorId', async (req, res) => {
    try {
        const { creatorId } = req.params;
        const { status = 'active' } = req.query;

        const { data, error } = await supabase
            .from('partnerships')
            .select(`
                *,
                brand:brand_id(name, logo_url),
                campaign:campaign_id(name, start_date, end_date)
            `)
            .eq('creator_id', creatorId)
            .eq('status', status)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            partnerships: data
        });

    } catch (error) {
        console.error('My deals error:', error);
        res.status(500).json({ error: 'Failed to fetch partnerships', details: error.message });
    }
});

/**
 * POST /api/partnerships/campaign/deliverable
 * Submit a campaign deliverable
 */
router.post('/campaign/deliverable', async (req, res) => {
    try {
        const { partnershipId, creatorId, deliverableType, contentUrl, metrics } = req.body;

        if (!partnershipId || !creatorId || !deliverableType || !contentUrl) {
            return res.status(400).json({ error: 'All fields required' });
        }

        // Verify partnership exists and is active
        const { data: partnership, error: partnershipError } = await supabase
            .from('partnerships')
            .select('id, deliverables_required, deliverables_submitted')
            .eq('id', partnershipId)
            .eq('creator_id', creatorId)
            .eq('status', 'active')
            .single();

        if (partnershipError || !partnership) {
            return res.status(403).json({ error: 'No active partnership found' });
        }

        const { data, error } = await supabase
            .from('partnership_deliverables')
            .insert({
                partnership_id: partnershipId,
                creator_id: creatorId,
                deliverable_type: deliverableType,
                content_url: contentUrl,
                metrics,
                status: 'pending_review',
                submitted_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        // Update partnership deliverables count
        await supabase
            .from('partnerships')
            .update({
                deliverables_submitted: partnership.deliverables_submitted + 1
            })
            .eq('id', partnershipId);

        res.json({
            deliverable: data,
            message: 'Deliverable submitted for review'
        });

    } catch (error) {
        console.error('Deliverable error:', error);
        res.status(500).json({ error: 'Failed to submit deliverable', details: error.message });
    }
});

/**
 * GET /api/partnerships/affiliates
 * Get affiliate programs available for creators
 */
router.get('/affiliates', async (req, res) => {
    try {
        const { category, minCommission, page = 1, limit = 20 } = req.query;

        let query = supabase
            .from('affiliate_programs')
            .select('*, merchant:merchant_id(name, logo_url, verified)')
            .eq('status', 'active')
            .order('commission_rate', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        if (minCommission) {
            query = query.gte('commission_rate', parseFloat(minCommission));
        }

        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;
        if (error) throw error;

        res.json({
            programs: data,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('Affiliates error:', error);
        res.status(500).json({ error: 'Failed to fetch affiliate programs', details: error.message });
    }
});

/**
 * POST /api/partnerships/affiliates/join
 * Join an affiliate program
 */
router.post('/affiliates/join', async (req, res) => {
    try {
        const { programId, creatorId } = req.body;

        if (!programId || !creatorId) {
            return res.status(400).json({ error: 'programId and creatorId required' });
        }

        // Check if already joined
        const { data: existing } = await supabase
            .from('affiliate_memberships')
            .select('id, status')
            .eq('program_id', programId)
            .eq('creator_id', creatorId)
            .single();

        if (existing) {
            if (existing.status === 'active') {
                return res.status(400).json({ error: 'Already a member of this program' });
            } else if (existing.status === 'pending') {
                return res.status(400).json({ error: 'Application pending approval' });
            }
        }

        // Generate unique affiliate code
        const affiliateCode = `${creatorId.substring(0, 8)}_${programId.substring(0, 4)}`.toUpperCase();

        const { data, error } = await supabase
            .from('affiliate_memberships')
            .insert({
                program_id: programId,
                creator_id: creatorId,
                affiliate_code: affiliateCode,
                status: 'pending',
                clicks: 0,
                conversions: 0,
                earnings: 0
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            membership: data,
            affiliateCode,
            message: 'Application submitted. Await merchant approval'
        });

    } catch (error) {
        console.error('Join affiliate error:', error);
        res.status(500).json({ error: 'Failed to join program', details: error.message });
    }
});

/**
 * GET /api/partnerships/affiliates/my-earnings/:creatorId
 * Get affiliate earnings for a creator
 */
router.get('/affiliates/my-earnings/:creatorId', async (req, res) => {
    try {
        const { creatorId } = req.params;
        const { timeframe = '30d' } = req.query;

        // Calculate date range
        const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
        const days = daysMap[timeframe] || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('affiliate_memberships')
            .select(`
                *,
                program:program_id(name, commission_rate, merchant:merchant_id(name, logo_url)),
                conversions:affiliate_conversions(amount, created_at)
            `)
            .eq('creator_id', creatorId)
            .eq('status', 'active');

        if (error) throw error;

        // Calculate totals
        let totalClicks = 0;
        let totalConversions = 0;
        let totalEarnings = 0;

        data.forEach(membership => {
            totalClicks += membership.clicks || 0;
            totalConversions += membership.conversions?.length || 0;
            totalEarnings += membership.earnings || 0;
        });

        res.json({
            memberships: data,
            summary: {
                totalClicks,
                totalConversions,
                totalEarnings: totalEarnings / 100,
                conversionRate: totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0
            },
            timeframe
        });

    } catch (error) {
        console.error('Earnings error:', error);
        res.status(500).json({ error: 'Failed to fetch earnings', details: error.message });
    }
});

/**
 * POST /api/partnerships/sponsor-request
 * Request sponsorship from brands
 */
router.post('/sponsor-request', async (req, res) => {
    try {
        const { creatorId, brandId, proposedContent, audience, desiredCompensation, timeline } = req.body;

        if (!creatorId || !brandId || !proposedContent) {
            return res.status(400).json({ error: 'creatorId, brandId, and proposedContent required' });
        }

        const { data, error } = await supabase
            .from('sponsorship_requests')
            .insert({
                creator_id: creatorId,
                brand_id: brandId,
                proposed_content: proposedContent,
                audience_metrics: audience,
                desired_compensation: desiredCompensation,
                timeline,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            request: data,
            message: 'Sponsorship request sent to brand'
        });

    } catch (error) {
        console.error('Sponsor request error:', error);
        res.status(500).json({ error: 'Failed to send sponsorship request', details: error.message });
    }
});

/**
 * GET /api/partnerships/stats/:creatorId
 * Get partnership statistics for creator
 */
router.get('/stats/:creatorId', async (req, res) => {
    try {
        const { creatorId } = req.params;

        const [
            { data: activeDeals },
            { data: completedDeals },
            { data: affiliateEarnings },
            { data: pendingApplications }
        ] = await Promise.all([
            supabase.from('partnerships').select('compensation').eq('creator_id', creatorId).eq('status', 'active'),
            supabase.from('partnerships').select('compensation').eq('creator_id', creatorId).eq('status', 'completed'),
            supabase.from('affiliate_memberships').select('earnings').eq('creator_id', creatorId).eq('status', 'active'),
            supabase.from('partnership_applications').select('id').eq('creator_id', creatorId).eq('status', 'pending')
        ]);

        const totalActiveCompensation = activeDeals?.reduce((sum, deal) => sum + (deal.compensation || 0), 0) || 0;
        const totalCompletedCompensation = completedDeals?.reduce((sum, deal) => sum + (deal.compensation || 0), 0) || 0;
        const totalAffiliateEarnings = affiliateEarnings?.reduce((sum, aff) => sum + (aff.earnings || 0), 0) || 0;

        res.json({
            activePartnerships: activeDeals?.length || 0,
            completedPartnerships: completedDeals?.length || 0,
            pendingApplications: pendingApplications?.length || 0,
            totalEarnings: {
                partnerships: (totalActiveCompensation + totalCompletedCompensation) / 100,
                affiliates: totalAffiliateEarnings / 100,
                total: (totalActiveCompensation + totalCompletedCompensation + totalAffiliateEarnings) / 100
            }
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
    }
});

module.exports = router;
