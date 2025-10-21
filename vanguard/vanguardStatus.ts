export type StatusFlag = "online" | "offline";

export interface VanguardSlab {
  id: string;
  role: "creator" | "influencer" | "tech_crew";
  status: StatusFlag;
  lastUpdated: Date;
  triggerSource: "manual" | "automated" | "council_vote";
  linkedArtifacts: string[];
}

const ledger: Array<{
  slabId: string;
  status: StatusFlag;
  timestamp: Date;
  triggerSource: string;
  ritualMessage: string;
}> = [];

export function toggleStatus(slab: VanguardSlab, newStatus: StatusFlag) {
  slab.status = newStatus;
  slab.lastUpdated = new Date();
  propagateStatus(slab);
  logTransition(slab);
}

function propagateStatus(slab: VanguardSlab) {
  slab.linkedArtifacts.forEach((artifactId: string) => {
    updateArtifactStatus(artifactId, slab.status);
  });

  switch (slab.role) {
    case "creator":
      sealOrActivateGraveyard(slab.id, slab.status);
      syncFanSignals(slab.id, slab.status);
      break;
    case "tech_crew":
      enforceAccessChains(slab.id, slab.status);
      break;
    case "influencer":
      togglePRCampaigns(slab.id, slab.status);
      break;
  }
}

function logTransition(slab: VanguardSlab) {
  ledger.push({
    slabId: slab.id,
    status: slab.status,
    timestamp: slab.lastUpdated,
    triggerSource: slab.triggerSource,
    ritualMessage: slab.status === "offline"
      ? `Slab ${slab.id} sealed—cooldown initiated`
      : `Slab ${slab.id} reawakened—sovereign access restored`
  });
}

// Stubs for external functions
function updateArtifactStatus(artifactId: string, status: StatusFlag) {}
function sealOrActivateGraveyard(id: string, status: StatusFlag) {}
function syncFanSignals(id: string, status: StatusFlag) {}
function enforceAccessChains(id: string, status: StatusFlag) {}
function togglePRCampaigns(id: string, status: StatusFlag) {}
