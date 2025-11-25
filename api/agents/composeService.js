"use strict";
/**
 * Content Companion: AI-powered inline content assistance
 * Captions, translations, hashtags, descriptions, alt text
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCaption = generateCaption;
exports.translateContent = translateContent;
exports.suggestHashtags = suggestHashtags;
exports.generateAltText = generateAltText;
const supabase_js_1 = require("@supabase/supabase-js");
const openai_1 = __importDefault(require("openai"));
const artifactLogger_1 = require("./artifactLogger");
const policy_1 = require("./policy");
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
/**
 * Generate caption for post
 */
async function generateCaption(request) {
    // Check entitlements
    const canUse = await checkEntitlement(request.userId, 'ai_assist_calls');
    if (!canUse.allowed) {
        throw new Error(`Entitlement limit reached: ${canUse.reason}`);
    }
    // Check policy
    const permission = await (0, policy_1.canPerformAction)('content_companion', 'generate_caption');
    if (!permission.allowed) {
        throw new Error(`Permission denied: ${permission.reason}`);
    }
    const tone = request.context?.tone || 'casual';
    const maxLength = request.context?.maxLength || 280;
    const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
            {
                role: 'system',
                content: `You are a creative content companion for ForTheWeebs, a media platform. Generate engaging ${tone} captions for user posts. Keep it under ${maxLength} characters. Be authentic and match the creator's voice.`,
            },
            {
                role: 'user',
                content: `Generate a caption for this content: "${request.content}"`,
            },
        ],
        max_tokens: 150,
        n: 3, // Generate 3 alternatives
    });
    const generatedContent = completion.choices[0].message.content || '';
    const alternatives = completion.choices
        .slice(1)
        .map((c) => c.message.content || '');
    // Log artifact
    const artifactId = await (0, artifactLogger_1.logArtifact)({
        agentType: 'content_companion',
        action: 'generate_caption',
        entityType: 'user_post',
        entityId: request.userId,
        context: { originalContent: request.content.substring(0, 100), tone },
        result: { generatedContent, alternatives },
        authorityLevel: (await (0, policy_1.getAuthority)('content_companion')).authorityLevel,
    });
    // Track usage
    await trackUsage(request.userId, 'ai_assist_calls');
    const usage = await getUsage(request.userId, 'ai_assist_calls');
    return {
        generatedContent,
        alternatives,
        artifactUrl: `${process.env.APP_URL}/admin/artifacts/${artifactId}`,
        usageCount: usage.current,
        limitRemaining: usage.remaining,
    };
}
/**
 * Translate content to target language
 */
async function translateContent(request) {
    const canUse = await checkEntitlement(request.userId, 'ai_assist_calls');
    if (!canUse.allowed) {
        throw new Error(`Entitlement limit reached: ${canUse.reason}`);
    }
    const permission = await (0, policy_1.canPerformAction)('content_companion', 'translate_content');
    if (!permission.allowed) {
        throw new Error(`Permission denied: ${permission.reason}`);
    }
    const targetLanguage = request.context?.targetLanguage || 'es';
    const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
            {
                role: 'system',
                content: `You are a translation assistant. Translate content to ${targetLanguage} while preserving tone, slang, and cultural context. Keep it natural.`,
            },
            {
                role: 'user',
                content: request.content,
            },
        ],
        max_tokens: 500,
    });
    const generatedContent = completion.choices[0].message.content || '';
    const artifactId = await (0, artifactLogger_1.logArtifact)({
        agentType: 'content_companion',
        action: 'translate_content',
        entityType: 'user_post',
        entityId: request.userId,
        context: { originalContent: request.content.substring(0, 100), targetLanguage },
        result: { generatedContent },
        authorityLevel: (await (0, policy_1.getAuthority)('content_companion')).authorityLevel,
    });
    await trackUsage(request.userId, 'ai_assist_calls');
    const usage = await getUsage(request.userId, 'ai_assist_calls');
    return {
        generatedContent,
        artifactUrl: `${process.env.APP_URL}/admin/artifacts/${artifactId}`,
        usageCount: usage.current,
        limitRemaining: usage.remaining,
    };
}
/**
 * Suggest hashtags for post
 */
async function suggestHashtags(request) {
    const canUse = await checkEntitlement(request.userId, 'ai_assist_calls');
    if (!canUse.allowed) {
        throw new Error(`Entitlement limit reached: ${canUse.reason}`);
    }
    const permission = await (0, policy_1.canPerformAction)('content_companion', 'suggest_hashtags');
    if (!permission.allowed) {
        throw new Error(`Permission denied: ${permission.reason}`);
    }
    const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
            {
                role: 'system',
                content: 'You are a social media expert. Generate 5-10 relevant, trending hashtags for content. Mix popular and niche tags. Return as comma-separated list.',
            },
            {
                role: 'user',
                content: request.content,
            },
        ],
        max_tokens: 100,
    });
    const generatedContent = completion.choices[0].message.content || '';
    const artifactId = await (0, artifactLogger_1.logArtifact)({
        agentType: 'content_companion',
        action: 'suggest_hashtags',
        entityType: 'user_post',
        entityId: request.userId,
        context: { content: request.content.substring(0, 100) },
        result: { generatedContent },
        authorityLevel: (await (0, policy_1.getAuthority)('content_companion')).authorityLevel,
    });
    await trackUsage(request.userId, 'ai_assist_calls');
    const usage = await getUsage(request.userId, 'ai_assist_calls');
    return {
        generatedContent,
        artifactUrl: `${process.env.APP_URL}/admin/artifacts/${artifactId}`,
        usageCount: usage.current,
        limitRemaining: usage.remaining,
    };
}
/**
 * Generate alt text for media
 */
async function generateAltText(request) {
    if (!request.context?.mediaUrl) {
        throw new Error('Media URL required for alt text generation');
    }
    const canUse = await checkEntitlement(request.userId, 'ai_assist_calls');
    if (!canUse.allowed) {
        throw new Error(`Entitlement limit reached: ${canUse.reason}`);
    }
    const permission = await (0, policy_1.canPerformAction)('content_companion', 'generate_alt_text');
    if (!permission.allowed) {
        throw new Error(`Permission denied: ${permission.reason}`);
    }
    const completion = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
            {
                role: 'system',
                content: 'Generate concise, descriptive alt text for accessibility. Focus on key visual elements and context. Keep under 125 characters.',
            },
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Describe this image for alt text:' },
                    { type: 'image_url', image_url: { url: request.context.mediaUrl } },
                ],
            },
        ],
        max_tokens: 100,
    });
    const generatedContent = completion.choices[0].message.content || '';
    const artifactId = await (0, artifactLogger_1.logArtifact)({
        agentType: 'content_companion',
        action: 'generate_alt_text',
        entityType: 'media',
        entityId: request.userId,
        context: { mediaUrl: request.context.mediaUrl },
        result: { generatedContent },
        authorityLevel: (await (0, policy_1.getAuthority)('content_companion')).authorityLevel,
    });
    await trackUsage(request.userId, 'ai_assist_calls');
    const usage = await getUsage(request.userId, 'ai_assist_calls');
    return {
        generatedContent,
        artifactUrl: `${process.env.APP_URL}/admin/artifacts/${artifactId}`,
        usageCount: usage.current,
        limitRemaining: usage.remaining,
    };
}
/**
 * Check user entitlement for AI assist
 */
async function checkEntitlement(userId, entitlementKey) {
    const { data: entitlement } = await supabase
        .from('user_entitlements')
        .select('*')
        .eq('user_id', userId)
        .eq('entitlement_key', entitlementKey)
        .single();
    if (!entitlement) {
        return { allowed: false, reason: 'No entitlement found' };
    }
    // Check if expired
    if (entitlement.expires_at && new Date(entitlement.expires_at) < new Date()) {
        return { allowed: false, reason: 'Entitlement expired' };
    }
    // Check usage limit
    const limit = entitlement.entitlement_value?.limit || 0;
    if (limit === -1)
        return { allowed: true }; // Unlimited
    const usage = await getUsage(userId, entitlementKey);
    if (usage.current >= limit) {
        return { allowed: false, reason: `Usage limit reached: ${usage.current}/${limit}` };
    }
    return { allowed: true };
}
/**
 * Track usage
 */
async function trackUsage(userId, metricKey) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1); // Start of month
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of month
    const { error } = await supabase.rpc('increment_usage', {
        p_user_id: userId,
        p_metric_key: metricKey,
        p_period_start: periodStart.toISOString(),
        p_period_end: periodEnd.toISOString(),
    });
    if (error) {
        // Fallback: manual upsert
        const { data: existing } = await supabase
            .from('usage_tracking')
            .select('*')
            .eq('user_id', userId)
            .eq('metric_key', metricKey)
            .eq('period_start', periodStart.toISOString())
            .single();
        if (existing) {
            await supabase
                .from('usage_tracking')
                .update({ current_value: existing.current_value + 1 })
                .eq('id', existing.id);
        }
        else {
            await supabase.from('usage_tracking').insert({
                user_id: userId,
                metric_key: metricKey,
                current_value: 1,
                period_start: periodStart.toISOString(),
                period_end: periodEnd.toISOString(),
            });
        }
    }
}
/**
 * Get current usage
 */
async function getUsage(userId, metricKey) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const { data: usage } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('metric_key', metricKey)
        .eq('period_start', periodStart.toISOString())
        .single();
    const { data: entitlement } = await supabase
        .from('user_entitlements')
        .select('*')
        .eq('user_id', userId)
        .eq('entitlement_key', metricKey)
        .single();
    const limit = entitlement?.entitlement_value?.limit || 0;
    const current = usage?.current_value || 0;
    const remaining = limit === -1 ? -1 : Math.max(0, limit - current);
    return { current, limit, remaining };
}
exports.default = {
    generateCaption,
    translateContent,
    suggestHashtags,
    generateAltText,
};
//# sourceMappingURL=composeService.js.map