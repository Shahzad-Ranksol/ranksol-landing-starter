export type Amenity = {
  id: string;
  name: string;
  level: string;
  description: string;
  icon: "pool" | "spa" | "work" | "garden" | "kitchen" | "screen" | "garage" | "pet";
};

export const amenities: Amenity[] = [
  {
    id: "aurora-pool",
    name: "Aurora Rooftop Pool",
    level: "Level 12 · Rooftop",
    description:
      "A heated infinity pool cantilevered off the building's summit, ambient-warmed to 28°C year-round with private cabanas.",
    icon: "pool",
  },
  {
    id: "solarium-spa",
    name: "Solarium Wellness Spa",
    level: "Level 2 · Wellness Deck",
    description: "Thermal suite, cryotherapy chamber, and a glass-roofed solarium for morning recovery sessions.",
    icon: "spa",
  },
  {
    id: "sky-atrium",
    name: "Sky Atrium Garden",
    level: "Level 6 · Botanical Deck",
    description: "A three-story planted atrium threading fresh air and daylight through the building's core.",
    icon: "garden",
  },
  {
    id: "the-study",
    name: "The Study",
    level: "Level 3 · Work Suites",
    description: "Private co-working suites and soundproof call rooms, reserved through the resident app.",
    icon: "work",
  },
  {
    id: "tasting-kitchen",
    name: "Tasting Kitchen & Cellar",
    level: "Level 1 · Culinary Wing",
    description: "A chef's demonstration kitchen and temperature-controlled wine cellar for private events.",
    icon: "kitchen",
  },
  {
    id: "screening-room",
    name: "Private Screening Room",
    level: "Level 1 · Culinary Wing",
    description: "A 14-seat cinema with acoustic paneling, bookable for residents and their guests.",
    icon: "screen",
  },
];
