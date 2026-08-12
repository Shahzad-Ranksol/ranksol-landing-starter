export type Availability = "available" | "reserved" | "sold";

export type Unit = {
  id: string;
  number: string;
  floorId: string;
  floorLabel: string;
  tierLabel: string;
  sizeSqm: number;
  bedrooms: number;
  bathrooms: number;
  view: string;
  price: number;
  availability: Availability;
};

export const units: Unit[] = [
  {
    id: "u-1201",
    number: "PH-1201",
    floorId: "l12",
    floorLabel: "L12",
    tierLabel: "Summit Collection",
    sizeSqm: 312,
    bedrooms: 4,
    bathrooms: 4.5,
    view: "360° panoramic bay & skyline",
    price: 5800000,
    availability: "available",
  },
  {
    id: "u-1101",
    number: "PH-1101",
    floorId: "l11",
    floorLabel: "L11",
    tierLabel: "Summit Collection",
    sizeSqm: 268,
    bedrooms: 3,
    bathrooms: 3.5,
    view: "North bay & marina",
    price: 4300000,
    availability: "reserved",
  },
  {
    id: "u-901",
    number: "SM-901",
    floorId: "l9",
    floorLabel: "L9",
    tierLabel: "Summit Collection",
    sizeSqm: 214,
    bedrooms: 3,
    bathrooms: 3,
    view: "South skyline",
    price: 3450000,
    availability: "available",
  },
  {
    id: "u-701",
    number: "CR-701",
    floorId: "l7",
    floorLabel: "L7",
    tierLabel: "Crown Collection",
    sizeSqm: 168,
    bedrooms: 2,
    bathrooms: 2.5,
    view: "East gardens",
    price: 2180000,
    availability: "available",
  },
  {
    id: "u-604",
    number: "CR-604",
    floorId: "l6",
    floorLabel: "L6",
    tierLabel: "Crown Collection",
    sizeSqm: 152,
    bedrooms: 2,
    bathrooms: 2,
    view: "West sunset",
    price: 1950000,
    availability: "sold",
  },
  {
    id: "u-502",
    number: "CR-502",
    floorId: "l5",
    floorLabel: "L5",
    tierLabel: "Crown Collection",
    sizeSqm: 141,
    bedrooms: 2,
    bathrooms: 2,
    view: "North atrium",
    price: 1780000,
    availability: "available",
  },
  {
    id: "u-303",
    number: "FN-303",
    floorId: "l3",
    floorLabel: "L3",
    tierLabel: "Foundation Collection",
    sizeSqm: 98,
    bedrooms: 1,
    bathrooms: 1.5,
    view: "Garden courtyard",
    price: 1120000,
    availability: "available",
  },
  {
    id: "u-105",
    number: "FN-105",
    floorId: "l1",
    floorLabel: "L1",
    tierLabel: "Foundation Collection",
    sizeSqm: 84,
    bedrooms: 1,
    bathrooms: 1,
    view: "Private garden entry",
    price: 890000,
    availability: "available",
  },
];

export function getFloorSummary(floorId: string) {
  const floorUnits = units.filter((u) => u.floorId === floorId);
  const available = floorUnits.filter((u) => u.availability === "available").length;
  const prices = floorUnits.map((u) => u.price);
  return {
    unitCount: floorUnits.length,
    available,
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
  };
}
