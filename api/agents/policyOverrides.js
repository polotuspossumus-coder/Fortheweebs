"use strict";
/**
 * Policy Overrides: Runtime governance controls for Mico
 * Allows live adjustment of thresholds, caps, and priority lanes without redeploy
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setOverride = setOverride;
exports.getOverride = getOverride;
exports.getAllOverrides = getAllOverrides;
exports.deactivateOverride = deactivateOverride;
exports.getModerationThreshold = getModerationThreshold;
exports.setModerationThreshold = setModerationThreshold;
exports.getPriorityLanes = getPriorityLanes;
exports.checkPriorityLane = checkPriorityLane;
exports.pausePriorityLane = pausePriorityLane;
exports.resumePriorityLane = resumePriorityLane;
exports.checkAdminCap = checkAdminCap;
const supabase_js_1 = require("@supabase/supabase-js");
const governanceNotary_1 = require("./governanceNotary");
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
/**
 * Set a policy override
 */
async function setOverride(override) {
    const beforeState = await getOverride(override.overrideKey);
    const { data, error } = await supabase
        .from('policy_overrides')
        .upsert({
        override_key: override.overrideKey,
        override_type: override.overrideType,
        override_value: override.overrideValue,
        active: override.active ?? true,
        expires_at: override.expiresAt?.toISOString(),
        set_by: override.setBy || 'mico',
        reason: override.reason,
        metadata: override.metadata || {},
        updated_at: new Date().toISOString(),
    })
        .select('id')
        .single();
    if (error) {
        console.error('Failed to set policy override:', error);
        throw new Error(`Policy override failed: ${error.message}`);
    }
    // Inscribe governance decision
    await (0, governanceNotary_1.inscribeDecision)({
        actionType: 'threshold_override',
        entityType: 'policy_override',
        entityId: data.id,
        beforeState: beforeState || undefined,
        afterState: override.overrideValue,
        justification: override.reason || `Set ${override.overrideKey} via policy override`,
        authorizedBy: override.setBy || 'mico',
    });
    console.log(`⚙️ OVERRIDE: ${override.overrideKey} set to ${JSON.stringify(override.overrideValue)}`);
    return data.id;
}
/**
 * Get a specific override
 */
async function getOverride(overrideKey) {
    const { data, error } = await supabase
        .from('policy_overrides')
        .select('*')
        .eq('override_key', overrideKey)
        .eq('active', true)
        .maybeSingle();
    if (error) {
        console.error('Failed to get policy override:', error);
        return null;
    }
    if (!data)
        return null;
    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
        await deactivateOverride(overrideKey, 'expired');
        return null;
    }
    return {
        overrideKey: data.override_key,
        overrideType: data.override_type,
        overrideValue: data.override_value,
        active: data.active,
        expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
        setBy: data.set_by,
        reason: data.reason,
        metadata: data.metadata,
    };
}
/**
 * Get all active overrides
 */
async function getAllOverrides() {
    const { data, error } = await supabase
        .from('policy_overrides')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Failed to get policy overrides:', error);
        return [];
    }
    // Filter out expired
    const now = new Date();
    const activeOverrides = data.filter((d) => {
        if (!d.expires_at)
            return true;
        return new Date(d.expires_at) > now;
    });
    return activeOverrides.map((d) => ({
        overrideKey: d.override_key,
        overrideType: d.override_type,
        overrideValue: d.override_value,
        active: d.active,
        expiresAt: d.expires_at ? new Date(d.expires_at) : undefined,
        setBy: d.set_by,
        reason: d.reason,
        metadata: d.metadata,
    }));
}
/**
 * Deactivate an override
 */
async function deactivateOverride(overrideKey, reason) {
    const { error } = await supabase
        .from('policy_overrides')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('override_key', overrideKey);
    if (error) {
        throw new Error(`Failed to deactivate override: ${error.message}`);
    }
    await (0, governanceNotary_1.inscribeDecision)({
        actionType: 'policy_escalation',
        entityType: 'policy_override',
        justification: `Deactivated ${overrideKey}: ${reason}`,
    });
    console.log(`⚙️ OVERRIDE DEACTIVATED: ${overrideKey} - ${reason}`);
}
/**
 * Get moderation threshold (with override support)
 */
async function getModerationThreshold(contentType, flagType) {
    // Check for override first
    const overrideKey = `moderation_threshold_${contentType}_${flagType}`;
    const override = await getOverride(overrideKey);
    if (override?.overrideValue?.threshold !== undefined) {
        return override.overrideValue.threshold;
    }
    // Fall back to database threshold
    const { data, error } = await supabase
        .from('moderation_thresholds')
        .select('threshold')
        .eq('content_type', contentType)
        .eq('flag_type', flagType)
        .eq('enabled', true)
        .maybeSingle();
    if (error || !data) {
        console.warn(`No threshold found for ${contentType}/${flagType}, using default`);
        return 0.75; // Default fallback
    }
    return data.threshold;
}
/**
 * Set moderation threshold (runtime override)
 */
async function setModerationThreshold(contentType, flagType, threshold, reason, setBy = 'mico') {
    const overrideKey = `moderation_threshold_${contentType}_${flagType}`;
    await setOverride({
        overrideKey,
        overrideType: 'moderation_threshold',
        overrideValue: { threshold, contentType, flagType },
        reason,
        setBy,
    });
}
/**
 * Priority Lanes
 */
/**
 * Get active priority lanes
 */
async function getPriorityLanes() {
    const { data, error } = await supabase
        .from('priority_lanes')
        .select('*')
        .eq('active', true)
        .order('priority_level', { ascending: false });
    if (error) {
        console.error('Failed to get priority lanes:', error);
        return [];
    }
    return data.map((d) => ({
        laneName: d.lane_name,
        priorityLevel: d.priority_level,
        conditions: d.conditions,
        processingRules: d.processing_rules,
        active: d.active,
    }));
}
/**
 * Check if content matches priority lane
 */
async function checkPriorityLane(content) {
    const lanes = await getPriorityLanes();
    for (const lane of lanes) {
        const conditions = lane.conditions;
        // Check flag_types
        if (conditions.flag_types && content.flagType) {
            if (conditions.flag_types.includes(content.flagType)) {
                const minConf = conditions.min_confidence || 0;
                if ((content.confidence || 0) >= minConf) {
                    return lane;
                }
            }
        }
        // Check creator_tier
        if (conditions.creator_tier && content.creatorTier) {
            if (content.creatorTier === conditions.creator_tier) {
                return lane;
            }
        }
        // Check account age
        if (conditions.account_age_hours && content.accountAgeHours !== undefined) {
            const ageCheck = conditions.account_age_hours;
            if (ageCheck.$lt && content.accountAgeHours < ageCheck.$lt) {
                return lane;
            }
        }
    }
    return null;
}
/**
 * Pause a priority lane
 */
async function pausePriorityLane(laneName, reason) {
    const { error } = await supabase
        .from('priority_lanes')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('lane_name', laneName);
    if (error) {
        throw new Error(`Failed to pause priority lane: ${error.message}`);
    }
    await (0, governanceNotary_1.inscribeDecision)({
        actionType: 'policy_escalation',
        entityType: 'priority_lane',
        justification: `Paused lane ${laneName}: ${reason}`,
    });
    console.log(`🚦 LANE PAUSED: ${laneName} - ${reason}`);
}
/**
 * Resume a priority lane
 */
async function resumePriorityLane(laneName) {
    const { error } = await supabase
        .from('priority_lanes')
        .update({ active: true, updated_at: new Date().toISOString() })
        .eq('lane_name', laneName);
    if (error) {
        throw new Error(`Failed to resume priority lane: ${error.message}`);
    }
    console.log(`🚦 LANE RESUMED: ${laneName}`);
}
/**
 * Admin Caps
 */
/**
 * Check if admin can perform capability
 */
async function checkAdminCap(adminId, capability) {
    const { data, error } = await supabase
        .from('admin_caps')
        .select('*')
        .eq('admin_id', adminId)
        .eq('capability', capability)
        .eq('active', true)
        .maybeSingle();
    if (error || !data) {
        // No cap defined = allowed
        return { allowed: true };
    }
    // Check hourly limit
    if (data.max_per_hour !== null) {
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const { count } = await supabase
            .from('governance_notary')
            .select('id', { count: 'exact', head: true })
            .eq('authorized_by', adminId)
            .eq('action_type', 'emergency_action')
            .gte('timestamp', hourAgo.toISOString());
        if (count && count >= data.max_per_hour) {
            return {
                allowed: false,
                reason: `Hourly limit exceeded: ${count}/${data.max_per_hour}`,
            };
        }
    }
    // Check daily limit
    if (data.max_per_day !== null) {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const { count } = await supabase
            .from('governance_notary')
            .select('id', { count: 'exact', head: true })
            .eq('authorized_by', adminId)
            .eq('action_type', 'emergency_action')
            .gte('timestamp', dayAgo.toISOString());
        if (count && count >= data.max_per_day) {
            return {
                allowed: false,
                reason: `Daily limit exceeded: ${count}/${data.max_per_day}`,
            };
        }
    }
    return {
        allowed: true,
        requiresJustification: data.requires_justification,
    };
}
exports.default = {
    setOverride,
    getOverride,
    getAllOverrides,
    deactivateOverride,
    getModerationThreshold,
    setModerationThreshold,
    getPriorityLanes,
    checkPriorityLane,
    pausePriorityLane,
    resumePriorityLane,
    checkAdminCap,
};
//# sourceMappingURL=policyOverrides.js.map