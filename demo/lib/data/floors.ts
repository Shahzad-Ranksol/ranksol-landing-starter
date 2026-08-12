export type Tier = "foundation" | "crown" | "summit";

export type Floor = {
  id: string;
  level: number;
  label: string;
  tier: Tier;
  tierLabel: string;
  unitCount: number;
};

export const tierInfo: Record<Tier, { label: string; blurb: string }> = {
  foundation: {
    label: "Foundation Collection",
    blurb: "Garden-level residences with private entries and dual-aspect light.",
  },
  crown: {
    label: "Crown Collection",
    blurb: "Executive floors with panoramic glazing and elevated ceiling heights.",
  },
  summit: {
    label: "Summit Collection",
    blurb: "The building's penthouse tier — full-floor residences and private terraces.",
  },
};

export const floors: Floor[] = [
  { id: "l1", level: 1, label: "L1", tier: "foundation", tierLabel: tierInfo.foundation.label, unitCount: 4 },
  { id: "l2", level: 2, label: "L2", tier: "foundation", tierLabel: tierInfo.foundation.label, unitCount: 4 },
  { id: "l3", level: 3, label: "L3", tier: "foundation", tierLabel: tierInfo.foundation.label, unitCount: 4 },
  { id: "l4", level: 4, label: "L4", tier: "crown", tierLabel: tierInfo.crown.label, unitCount: 3 },
  { id: "l5", level: 5, label: "L5", tier: "crown", tierLabel: tierInfo.crown.label, unitCount: 3 },
  { id: "l6", level: 6, label: "L6", tier: "crown", tierLabel: tierInfo.crown.label, unitCount: 3 },
  { id: "l7", level: 7, label: "L7", tier: "crown", tierLabel: tierInfo.crown.label, unitCount: 3 },
  { id: "l8", level: 8, label: "L8", tier: "crown", tierLabel: tierInfo.crown.label, unitCount: 3 },
  { id: "l9", level: 9, label: "L9", tier: "summit", tierLabel: tierInfo.summit.label, unitCount: 2 },
  { id: "l10", level: 10, label: "L10", tier: "summit", tierLabel: tierInfo.summit.label, unitCount: 2 },
  { id: "l11", level: 11, label: "L11", tier: "summit", tierLabel: tierInfo.summit.label, unitCount: 1 },
  { id: "l12", level: 12, label: "L12", tier: "summit", tierLabel: tierInfo.summit.label, unitCount: 1 },
];
