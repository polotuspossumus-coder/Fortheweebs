export type StatusFlag = "online" | "offline";

export interface VanguardSlab {
  id: string;
  role: "creator" | "influencer" | "tech_crew";
  status: StatusFlag;
  lastUpdated: Date;
  triggerSource: "manual" | "automated" | "council_vote";
  linkedArtifacts: string[]; // IDs of rituals, perks, campaigns
}
