"use strict";
/**
 * Moderation Sentinel: Real-time content flagging and review
 * Powered by OpenAI Moderation API + custom rules
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderateText = moderateText;
exports.moderateMedia = moderateMedia;
exports.reviewFlag = reviewFlag;
exports.getPendingFlags = getPendingFlags;
const supabase_js_1 = require("@supabase/supabase-js");
const openai_1 = __importDefault(require("openai"));
const artifactLogger_1 = require("./artifactLogger");
const policy_1 = require("./policy");
const policyOverrides_1 = require("./policyOverrides");
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
/**
 * Moderate text content (posts, comments, messages)
 */
async function moderateText(text, contentId, contentType) {
    try {
        // Check authority
        const permission = await (0, policy_1.canPerformAction)('moderation_sentinel', 'flag_content');
        if (!permission.allowed) {
            console.warn('Moderation sentinel lacks authority:', permission.reason);
            return { flagged: false, confidence: 0, autoAction: 'none' };
        }
        // Call OpenAI Moderation API
        const moderation = await openai.moderations.create({ input: text });
        const result = moderation.results[0];
        // Check thresholds from database (with override support)
        const thresholds = await getThresholds(contentType);
        // Check priority lanes
        const priorityLane = await (0, policyOverrides_1.checkPriorityLane)({
            flagType: undefined, // Will be set after detection
            confidence: 0,
        });
        let flagged = false;
        let reason;
        let severity = 'low';
        let confidence = 0;
        let autoAction = 'none';
        // Check each category
        if (result.categories.sexual_minors || result.categories['sexual/minors']) {
            flagged = true;
            reason = 'csam';
            severity = 'critical';
            confidence = Math.max(result.category_scores.sexual_minors || 0, result.category_scores['sexual/minors'] || 0);
            autoAction = 'remove'; // Always remove CSAM immediately
            // Log to artifact system
            await (0, artifactLogger_1.logArtifact)({
                agentType: 'moderation_sentinel',
                action: 'flag_csam',
                entityType: contentType,
                entityId: contentId,
                context: { text: text.substring(0, 100) },
                result: { flagged, confidence, autoAction },
                authorityLevel: (await (0, policy_1.getAuthority)('moderation_sentinel')).authorityLevel,
            });
            // Create flag immediately
            await createFlag({
                contentId,
                contentType,
                reason,
                severity,
                confidence,
                autoAction,
                metadata: { openai_result: result },
            });
            // Execute auto-action if allowed
            if (autoAction !== 'none') {
                await executeAutoAction(contentId, contentType, autoAction);
            }
            return { flagged, reason, severity, confidence, autoAction };
        }
        if (result.categories.violence && result.category_scores.violence > 0.7) {
            const threshold = await (0, policyOverrides_1.getModerationThreshold)(contentType, 'violence');
            if (result.category_scores.violence >= threshold) {
                flagged = true;
                reason = 'violence';
                severity = result.category_scores.violence > 0.9 ? 'high' : 'medium';
                confidence = result.category_scores.violence;
                autoAction = thresholds.find((t) => t.flag_type === 'violence')?.auto_action || 'blur';
            }
        }
        if (result.categories.hate && result.category_scores.hate > 0.7) {
            const threshold = await (0, policyOverrides_1.getModerationThreshold)(contentType, 'hate_speech');
            if (result.category_scores.hate >= threshold) {
                flagged = true;
                reason = 'hate_speech';
                severity = result.category_scores.hate > 0.9 ? 'high' : 'medium';
                confidence = result.category_scores.hate;
                autoAction = thresholds.find((t) => t.flag_type === 'hate_speech')?.auto_action || 'hide';
            }
        }
        if (result.categories.harassment && result.category_scores.harassment > 0.7) {
            const threshold = await (0, policyOverrides_1.getModerationThreshold)(contentType, 'harassment');
            if (result.category_scores.harassment >= threshold) {
                flagged = true;
                reason = 'harassment';
                severity = 'medium';
                confidence = result.category_scores.harassment;
                autoAction = thresholds.find((t) => t.flag_type === 'harassment')?.auto_action || 'hide';
            }
        }
        // If flagged, log and create flag
        if (flagged && reason) {
            await (0, artifactLogger_1.logArtifact)({
                agentType: 'moderation_sentinel',
                action: `flag_${reason}`,
                entityType: contentType,
                entityId: contentId,
                context: { text: text.substring(0, 100) },
                result: { flagged, confidence, autoAction },
                authorityLevel: (await (0, policy_1.getAuthority)('moderation_sentinel')).authorityLevel,
            });
            await createFlag({
                contentId,
                contentType,
                reason,
                severity,
                confidence,
                autoAction,
                metadata: { openai_result: result },
            });
            // Execute auto-action if authority allows
            const policy = await (0, policy_1.getAuthority)('moderation_sentinel');
            if (autoAction !== 'none' &&
                ['act', 'enforce'].includes(policy.authorityLevel)) {
                await executeAutoAction(contentId, contentType, autoAction);
            }
        }
        return { flagged, reason, severity, confidence, autoAction };
    }
    catch (error) {
        console.error('Moderation failed:', error);
        throw error;
    }
}
/**
 * Moderate media content (images, videos)
 */
async function moderateMedia(mediaUrl, contentId, contentType) {
    try {
        // Use existing imageContentScanner
        const { detectCSAM } = await Promise.resolve().then(() => __importStar(require('../utils/imageContentScanner.js')));
        const csamResult = await detectCSAM(mediaUrl);
        if (csamResult.isCSAM) {
            const reason = 'csam';
            const severity = 'critical';
            const confidence = csamResult.confidence;
            const autoAction = 'remove';
            await (0, artifactLogger_1.logArtifact)({
                agentType: 'moderation_sentinel',
                action: 'flag_csam_media',
                entityType: contentType,
                entityId: contentId,
                context: { mediaUrl },
                result: { flagged: true, confidence, autoAction },
                authorityLevel: (await (0, policy_1.getAuthority)('moderation_sentinel')).authorityLevel,
            });
            await createFlag({
                contentId,
                contentType,
                reason,
                severity,
                confidence,
                autoAction,
                metadata: { csam_result: csamResult },
            });
            await executeAutoAction(contentId, contentType, autoAction);
            // Report to NCMEC
            const { reportToNCMEC } = await Promise.resolve().then(() => __importStar(require('../utils/ncmecReporting.js')));
            await reportToNCMEC({
                contentId,
                contentType: 'media',
                evidence: { mediaUrl, scanResult: csamResult },
            });
            return {
                flagged: true,
                reason,
                severity,
                confidence,
                autoAction,
            };
        }
        // Check for violence/gore with OpenAI Vision
        const visionResult = await openai.chat.completions.create({
            model: 'gpt-4-vision-preview',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Analyze this image for: violence, gore, extreme content. Return JSON with {violence: boolean, confidence: number, description: string}',
                        },
                        { type: 'image_url', image_url: { url: mediaUrl } },
                    ],
                },
            ],
            max_tokens: 200,
        });
        const analysis = JSON.parse(visionResult.choices[0].message.content || '{}');
        if (analysis.violence && analysis.confidence > 0.7) {
            const threshold = (await getThresholds(contentType)).find((t) => t.flag_type === 'violence')
                ?.threshold || 0.7;
            if (analysis.confidence >= threshold) {
                const reason = 'violence';
                const severity = analysis.confidence > 0.9 ? 'high' : 'medium';
                const autoAction = 'blur';
                await (0, artifactLogger_1.logArtifact)({
                    agentType: 'moderation_sentinel',
                    action: 'flag_violence_media',
                    entityType: contentType,
                    entityId: contentId,
                    context: { mediaUrl },
                    result: { flagged: true, confidence: analysis.confidence, autoAction },
                    authorityLevel: (await (0, policy_1.getAuthority)('moderation_sentinel')).authorityLevel,
                });
                await createFlag({
                    contentId,
                    contentType,
                    reason,
                    severity,
                    confidence: analysis.confidence,
                    autoAction,
                    metadata: { vision_result: analysis },
                });
                const policy = await (0, policy_1.getAuthority)('moderation_sentinel');
                if (['act', 'enforce'].includes(policy.authorityLevel)) {
                    await executeAutoAction(contentId, contentType, autoAction);
                }
                return {
                    flagged: true,
                    reason,
                    severity,
                    confidence: analysis.confidence,
                    autoAction,
                };
            }
        }
        return { flagged: false, confidence: 0, autoAction: 'none' };
    }
    catch (error) {
        console.error('Media moderation failed:', error);
        throw error;
    }
}
/**
 * Get moderation thresholds from database
 */
async function getThresholds(contentType) {
    const { data, error } = await supabase
        .from('moderation_thresholds')
        .select('*')
        .eq('content_type', contentType)
        .eq('enabled', true);
    if (error) {
        console.error('Failed to fetch thresholds:', error);
        return [];
    }
    return data || [];
}
/**
 * Create moderation flag in database
 */
async function createFlag(flag) {
    const { error } = await supabase.from('moderation_flags').insert({
        content_id: flag.contentId,
        content_type: flag.contentType,
        flag_reason: flag.reason,
        severity: flag.severity,
        confidence: flag.confidence,
        auto_action: flag.autoAction,
        status: 'pending',
        metadata: flag.metadata || {},
    });
    if (error) {
        console.error('Failed to create flag:', error);
        throw new Error(`Flag creation failed: ${error.message}`);
    }
}
/**
 * Execute auto-action (blur, hide, remove)
 */
async function executeAutoAction(contentId, contentType, action) {
    if (action === 'none')
        return;
    const permission = await (0, policy_1.canPerformAction)('moderation_sentinel', `${action}_content`);
    if (!permission.allowed) {
        console.warn(`Cannot execute auto-action ${action}: ${permission.reason}`);
        return;
    }
    // Update content status based on action
    // This would integrate with your content table
    console.log(`🚨 AUTO-ACTION: ${action} on ${contentType} ${contentId}`);
    // Log the action
    await (0, artifactLogger_1.logArtifact)({
        agentType: 'moderation_sentinel',
        action: `auto_${action}`,
        entityType: contentType,
        entityId: contentId,
        result: { action, automated: true },
        authorityLevel: (await (0, policy_1.getAuthority)('moderation_sentinel')).authorityLevel,
    });
    // TODO: Emit event for UI updates
    // await emit('moderation.action', { contentId, contentType, action });
}
/**
 * Review flag (human moderator action)
 */
async function reviewFlag(flagId, moderatorId, decision, notes) {
    const { error } = await supabase
        .from('moderation_flags')
        .update({
        status: decision,
        reviewed_by: moderatorId,
        reviewed_at: new Date().toISOString(),
        notes,
    })
        .eq('id', flagId);
    if (error) {
        throw new Error(`Flag review failed: ${error.message}`);
    }
    await (0, artifactLogger_1.logArtifact)({
        agentType: 'moderation_sentinel',
        action: 'human_review',
        entityType: 'moderation_flag',
        entityId: flagId,
        context: { moderatorId, decision, notes },
        authorityLevel: 'read',
    });
}
/**
 * Get pending flags for moderation queue
 */
async function getPendingFlags(limit = 50) {
    const { data, error } = await supabase
        .from('moderation_flags')
        .select('*')
        .eq('status', 'pending')
        .order('severity', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(limit);
    if (error) {
        throw new Error(`Failed to fetch pending flags: ${error.message}`);
    }
    return data;
}
exports.default = {
    moderateText,
    moderateMedia,
    reviewFlag,
    getPendingFlags,
};
//# sourceMappingURL=moderationService.js.map