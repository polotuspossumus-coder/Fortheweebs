"use strict";
/**
 * Artifact Logger: Immutable append-only log for all AI agent actions
 * Provides audit trail, execution history, and bundle sealing at milestones
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logArtifact = logArtifact;
exports.queryArtifacts = queryArtifacts;
exports.sealBundle = sealBundle;
exports.getBundle = getBundle;
exports.streamArtifacts = streamArtifacts;
exports.getActivitySummary = getActivitySummary;
const supabase_js_1 = require("@supabase/supabase-js");
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
/**
 * Log a single artifact (agent action)
 */
async function logArtifact(entry) {
    const { data, error } = await supabase
        .from('artifact_log')
        .insert({
        agent_type: entry.agentType,
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        context: entry.context || {},
        result: entry.result || {},
        authority_level: entry.authorityLevel,
    })
        .select('id')
        .single();
    if (error) {
        console.error('Failed to log artifact:', error);
        throw new Error(`Artifact logging failed: ${error.message}`);
    }
    return data.id;
}
/**
 * Query artifacts by filters
 */
async function queryArtifacts(filters) {
    let query = supabase
        .from('artifact_log')
        .select('*')
        .order('timestamp', { ascending: false });
    if (filters.agentType) {
        query = query.eq('agent_type', filters.agentType);
    }
    if (filters.action) {
        query = query.eq('action', filters.action);
    }
    if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType);
    }
    if (filters.entityId) {
        query = query.eq('entity_id', filters.entityId);
    }
    if (filters.since) {
        query = query.gte('timestamp', filters.since.toISOString());
    }
    if (filters.limit) {
        query = query.limit(filters.limit);
    }
    const { data, error } = await query;
    if (error) {
        console.error('Failed to query artifacts:', error);
        throw new Error(`Artifact query failed: ${error.message}`);
    }
    return data;
}
/**
 * Seal a bundle of artifacts at a milestone
 * Returns shareable bundle URL
 */
async function sealBundle(bundle) {
    const { data, error } = await supabase
        .from('artifact_bundles')
        .insert({
        bundle_name: bundle.bundleName,
        event_ids: bundle.eventIds,
        metadata: bundle.metadata || {},
    })
        .select('id')
        .single();
    if (error) {
        console.error('Failed to seal bundle:', error);
        throw new Error(`Bundle sealing failed: ${error.message}`);
    }
    // Return shareable URL
    return `${process.env.APP_URL}/admin/artifacts/bundle/${data.id}`;
}
/**
 * Get bundle by ID
 */
async function getBundle(bundleId) {
    const { data: bundle, error: bundleError } = await supabase
        .from('artifact_bundles')
        .select('*')
        .eq('id', bundleId)
        .single();
    if (bundleError) {
        throw new Error(`Bundle not found: ${bundleError.message}`);
    }
    // Fetch all artifacts in the bundle
    const { data: artifacts, error: artifactsError } = await supabase
        .from('artifact_log')
        .select('*')
        .in('id', bundle.event_ids)
        .order('timestamp', { ascending: true });
    if (artifactsError) {
        throw new Error(`Failed to fetch bundle artifacts: ${artifactsError.message}`);
    }
    return {
        ...bundle,
        artifacts,
    };
}
/**
 * Stream artifacts in real-time (SSE)
 * For live execution history view
 */
async function* streamArtifacts(filters) {
    const channel = supabase
        .channel('artifact_stream')
        .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'artifact_log',
        filter: filters?.agentType
            ? `agent_type=eq.${filters.agentType}`
            : undefined,
    }, (payload) => {
        return payload.new;
    })
        .subscribe();
    // Return async generator for SSE
    // This would be implemented with actual SSE streaming in express.ts
    yield* [];
}
/**
 * Get recent activity summary
 */
async function getActivitySummary(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const { data, error } = await supabase.rpc('get_artifact_summary', {
        since_timestamp: since.toISOString(),
    });
    if (error) {
        // Fallback if RPC doesn't exist - do client-side aggregation
        const artifacts = await queryArtifacts({ since, limit: 1000 });
        const summary = {
            totalActions: artifacts.length,
            byAgent: {},
            byAuthority: {},
            topActions: [],
        };
        artifacts.forEach((artifact) => {
            summary.byAgent[artifact.agent_type] =
                (summary.byAgent[artifact.agent_type] || 0) + 1;
            if (artifact.authority_level) {
                summary.byAuthority[artifact.authority_level] =
                    (summary.byAuthority[artifact.authority_level] || 0) + 1;
            }
        });
        return summary;
    }
    return data;
}
exports.default = {
    logArtifact,
    queryArtifacts,
    sealBundle,
    getBundle,
    streamArtifacts,
    getActivitySummary,
};
//# sourceMappingURL=artifactLogger.js.map