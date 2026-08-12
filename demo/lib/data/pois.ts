export type PoiCategory = "transit" | "school" | "shopping" | "culture" | "dining";

export type Poi = {
  id: string;
  name: string;
  category: PoiCategory;
  walkMinutes: number;
  driveMinutes: number;
  /** Relative position on the stylized location diagram, 0-100 */
  x: number;
  y: number;
};

export const poiCategoryLabel: Record<PoiCategory, string> = {
  transit: "Transit",
  school: "Education",
  shopping: "Shopping",
  culture: "Culture",
  dining: "Dining",
};

export const pois: Poi[] = [
  { id: "transit-central", name: "Meridian Central Station", category: "transit", walkMinutes: 6, driveMinutes: 2, x: 32, y: 40 },
  { id: "school-international", name: "Solmar International School", category: "school", walkMinutes: 11, driveMinutes: 4, x: 20, y: 62 },
  { id: "waterfront-promenade", name: "Waterfront Promenade", category: "culture", walkMinutes: 9, driveMinutes: 3, x: 70, y: 70 },
  { id: "gourmet-market", name: "Bay Gourmet Market", category: "shopping", walkMinutes: 4, driveMinutes: 2, x: 58, y: 28 },
  { id: "art-museum", name: "Solmar Museum of Art", category: "culture", walkMinutes: 14, driveMinutes: 5, x: 78, y: 32 },
  { id: "business-district", name: "Meridian Business District", category: "shopping", walkMinutes: 8, driveMinutes: 3, x: 42, y: 18 },
  { id: "tasting-row", name: "Tasting Row Dining District", category: "dining", walkMinutes: 5, driveMinutes: 2, x: 55, y: 58 },
];
