export const initialClients = [
  { id: "EC-24018", name: "Alexandra Reyes", project: "Private · New unit", officer: "Mika Santos", status: "For quotation", date: "Nov 08, 2026", elevators: 2 },
  { id: "EC-24017", name: "Miguel Dela Cruz", project: "Residential · New unit", officer: "Daniel Lim", status: "For site inspection", date: "Nov 07, 2026", elevators: 1 },
  { id: "EC-24016", name: "Sofia Villanueva", project: "Commercial · Modernization", officer: "Mika Santos", status: "In progress", date: "Nov 06, 2026", elevators: 3 },
  { id: "EC-24015", name: "Gabriel Tan", project: "Private · New unit", officer: "Paolo Garcia", status: "Completed", date: "Nov 04, 2026", elevators: 1 },
  { id: "EC-24014", name: "Isabella Lim", project: "Residential · New unit", officer: "Daniel Lim", status: "For quotation", date: "Nov 02, 2026", elevators: 2 },
];

export const STATUSES = ["For quotation", "For site inspection", "In progress", "Completed"];

export const ELEVATOR_TYPES = {
  "Passenger Lift": "PE",
  "Service / Freight Lift": "FE",
  "Panoramic / Glass Lift": "GE",
  "Hospital / Bed Elevator": "HE",
  "Residential Elevator": "RE",
  Dumbwaiter: "DW",
};

export const SO_AM = {
  "SO-001": "Maria Santos (AM)",
  "SO-002": "John Reyes (AM)",
  "SO-003": "Ana Cruz (AM)",
  "SO-004": "Carlos Mendoza (AM)",
  "SO-005": "Lisa Garcia (AM)",
};

export const HONORIFICS = ["Mr.", "Mrs.", "Ms.", "Dr.", "Engr.", "Atty."];
export const SUFFIXES = ["Jr.", "Sr.", "II", "III", "IV"];
export const LEAD_SOURCES = ["Viber", "Email", "B2B", "Ads", "Social Media", "Referral", "Walk-in"];
export const QUOTATION_TYPES = ["For Reference", "For Site Inspection"];
export const CAPACITIES = [
  "450 kg / 6 persons", "630 kg / 8 persons", "800 kg / 10 persons", "1000 kg / 13 persons",
  "1150 kg / 15 persons", "1350 kg / 18 persons", "1600 kg / 21 persons", "2000 kg / 26 persons",
  "2500 kg / 33 persons", "Custom / To be advised",
];
export const MACHINE_ROOMS = ["MRL", "Conventional Overhead", "Machine Room Below", "Machine Room Side", "Other / To be advised"];
