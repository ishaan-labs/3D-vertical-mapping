export interface PropertyUnit {
  unitId: string;
  floorNumber: number;
  unitCode: string;
  useType: "RESIDENTIAL" | "COMMERCIAL" | "RETAIL" | "ADMINISTRATIVE" | "AIR_RIGHTS";
  elevationRange: string;
  zMin: number;
  zMax: number;
  carpetAreaSqm: number;
  volumeM3: number;
  ulpin3D: string;
  ownerName: string;
  mortgageBank?: string;
  udsShareSqft: number;
  status: "REGISTERED" | "DISPUTED" | "CLEAR";
}

export interface BuildingRecord {
  id: string;
  name: string;
  ulpin2D: string;
  ulpin3D: string;
  buildingId: string;
  parcelId: string;
  address: string;
  floorsCount: number;
  heightM: number;
  footprintAreaSqm: number;
  totalBuiltupSqm: number;
  sanctionedFsi: number;
  actualFsi: number;
  ghostFloorsCount: number;
  coordinates: [number, number];
  units: PropertyUnit[];
}

export interface SubsurfaceAsset {
  id: string;
  name: string;
  category: "METRO" | "WATER" | "GAS" | "TELECOM" | "SEWER" | "ROOT_ZONE";
  depthRange: string;
  zMin: number;
  zMax: number;
  owner: string;
  ulpin3D: string;
  hazardClass?: string;
  clearanceBufferM: number;
  details: string;
}

export interface ParcelZone {
  id: string;
  name: string;
  surveyNumber: string;
  wardName: string;
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  buildings: BuildingRecord[];
  subsurfaceUtilities: SubsurfaceAsset[];
}

export interface CityData {
  id: string;
  name: string;
  state: string;
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  parcels: ParcelZone[];
}

export const INDIA_CADASTRE_HIERARCHY: CityData[] = [
  {
    id: "CHENNAI",
    name: "Chennai",
    state: "Tamil Nadu",
    center: [80.2520, 13.0610],
    zoom: 12.5,
    pitch: 45,
    bearing: -15,
    parcels: [
      {
        id: "PAR-10294",
        name: "T. Nagar Commercial & Transit Zone",
        surveyNumber: "TS-842/2026",
        wardName: "Ward 114 - Anna Salai Corridor",
        center: [80.2520, 13.0610],
        zoom: 16.5,
        pitch: 62,
        bearing: -25,
        buildings: [
          {
            id: "BLD-00421",
            name: "Ganga Heights Commercial Complex",
            ulpin2D: "IND802194812901",
            ulpin3D: "IND802194812901-V000380-B1",
            buildingId: "BLD-00421",
            parcelId: "PAR-10294",
            address: "42 Anna Salai, T. Nagar, Chennai",
            floorsCount: 12,
            heightM: 38,
            footprintAreaSqm: 620.0,
            totalBuiltupSqm: 7440.0,
            sanctionedFsi: 2.5,
            actualFsi: 3.3,
            ghostFloorsCount: 2,
            coordinates: [80.2520, 13.0610],
            units: [
              { unitId: "U-1204", floorNumber: 12, unitCode: "Penthouse Suite P-12", useType: "RESIDENTIAL", elevationRange: "+35.0m to +38.0m MSL", zMin: 35.0, zMax: 38.0, carpetAreaSqm: 185.0, volumeM3: 555.0, ulpin3D: "IND802194812901-V035038-P12", ownerName: "Ishaan Srivastava", mortgageBank: "SBI", udsShareSqft: 1850.0, status: "REGISTERED" },
              { unitId: "U-1102", floorNumber: 11, unitCode: "Executive Office Suite 11B", useType: "COMMERCIAL", elevationRange: "+32.0m to +35.0m MSL", zMin: 32.0, zMax: 35.0, carpetAreaSqm: 240.0, volumeM3: 720.0, ulpin3D: "IND802194812901-V032035-E11", ownerName: "Southern Tech Labs Ltd", mortgageBank: "HDFC", udsShareSqft: 2400.0, status: "REGISTERED" },
              { unitId: "U-0601", floorNumber: 6, unitCode: "Commercial Studio 6A", useType: "COMMERCIAL", elevationRange: "+18.0m to +21.0m MSL", zMin: 18.0, zMax: 21.0, carpetAreaSqm: 210.0, volumeM3: 630.0, ulpin3D: "IND802194812901-V018021-C6", ownerName: "Plug & Pray Solutions Ltd", udsShareSqft: 2100.0, status: "REGISTERED" },
              { unitId: "U-0101", floorNumber: 1, unitCode: "Ground Floor Retail Arcade", useType: "RETAIL", elevationRange: "+0.0m to +3.5m MSL", zMin: 0.0, zMax: 3.5, carpetAreaSqm: 450.0, volumeM3: 1575.0, ulpin3D: "IND802194812901-S000003-R1", ownerName: "State Retail Development Board", udsShareSqft: 4500.0, status: "REGISTERED" }
            ]
          },
          {
            id: "BLD-00422",
            name: "DoLR State Cadastral Headquarters",
            ulpin2D: "IND338421049280",
            ulpin3D: "IND338421049280-V000720-B2",
            buildingId: "BLD-00422",
            parcelId: "PAR-10294",
            address: "18 Survey Bhavan, T. Nagar, Chennai",
            floorsCount: 8,
            heightM: 26,
            footprintAreaSqm: 850.0,
            totalBuiltupSqm: 6800.0,
            sanctionedFsi: 2.5,
            actualFsi: 2.5,
            ghostFloorsCount: 0,
            coordinates: [80.2535, 13.0615],
            units: [
              { unitId: "U-HQ-01", floorNumber: 8, unitCode: "Director General Chambers", useType: "ADMINISTRATIVE", elevationRange: "+22.5m to +26.0m MSL", zMin: 22.5, zMax: 26.0, carpetAreaSqm: 350.0, volumeM3: 1225.0, ulpin3D: "IND338421049280-V022026-D8", ownerName: "Department of Land Resources (DoLR)", udsShareSqft: 3500.0, status: "REGISTERED" }
            ]
          }
        ],
        subsurfaceUtilities: [
          { id: "SUB-MTR", name: "CMRL Metro Line 2 Underground Tunnel", category: "METRO", depthRange: "-8.5m to -12.0m MSL", zMin: -12.0, zMax: -8.5, owner: "Chennai Metro Rail Ltd (CMRL)", ulpin3D: "IND338421049280-U085120-M2", clearanceBufferM: 15.0, details: "Subterranean rapid transit box. Piling strictly restricted within 15m buffer." },
          { id: "SUB-GAS", name: "GAIL High-Pressure Natural Gas Conduit", category: "GAS", depthRange: "-5.2m to -5.6m MSL", zMin: -5.6, zMax: -5.2, owner: "GAIL (India) Limited", ulpin3D: "IND338421049280-U052056-G9", hazardClass: "CLASS-1 HIGH PRESSURE", clearanceBufferM: 3.0, details: "19 Bar pressurized conduit. Trenching strictly forbidden without clearance." },
          { id: "SUB-WTR", name: "Municipal 500mm Water Trunk Main", category: "WATER", depthRange: "-3.4m to -3.8m MSL", zMin: -3.8, zMax: -3.4, owner: "Chennai MetroWater Board (CMWSSB)", ulpin3D: "IND338421049280-U034038-W4", clearanceBufferM: 2.0, details: "Potable pressurized distribution main." },
          { id: "SUB-TEL", name: "BSNL Gigabit Optic Fiber Backbone", category: "TELECOM", depthRange: "-1.8m to -2.2m MSL", zMin: -2.2, zMax: -1.8, owner: "Bharat Sanchar Nigam Ltd", ulpin3D: "IND338421049280-U018022-T1", clearanceBufferM: 1.5, details: "Core national optic corridor." },
          { id: "SUB-TREE", name: "Heritage Neem Root Exclusion Shield", category: "ROOT_ZONE", depthRange: "0.0m to -2.8m Subsurface", zMin: -2.8, zMax: 0.0, owner: "Ward 114 Urban Forestry Council", ulpin3D: "IND338421049280-ECO0042", clearanceBufferM: 3.5, details: "Statutory 3.5m radius root exclusion zone protecting 45-year-old Azadirachta indica." }
        ]
      }
    ]
  },
  {
    id: "MUMBAI",
    name: "Mumbai",
    state: "Maharashtra",
    center: [72.8685, 19.0665],
    zoom: 12.5,
    pitch: 45,
    bearing: -30,
    parcels: [
      {
        id: "PAR-MUM-01",
        name: "Bandra-Kurla Complex (BKC) G-Block",
        surveyNumber: "MH-BKC-920/2026",
        wardName: "Ward H/East - Financial Hub",
        center: [72.8685, 19.0665],
        zoom: 16.5,
        pitch: 62,
        bearing: -30,
        buildings: [
          {
            id: "BLD-MUM-01",
            name: "BKC International Financial Tower",
            ulpin2D: "IND270051098220",
            ulpin3D: "IND270051098220-V000840-X1",
            buildingId: "BLD-MUM-01",
            parcelId: "PAR-MUM-01",
            address: "Plot C-24, G-Block, BKC, Mumbai",
            floorsCount: 28,
            heightM: 84,
            footprintAreaSqm: 1200.0,
            totalBuiltupSqm: 33600.0,
            sanctionedFsi: 4.0,
            actualFsi: 4.0,
            ghostFloorsCount: 0,
            coordinates: [72.8685, 19.0665],
            units: [
              { unitId: "U-MUM-28", floorNumber: 28, unitCode: "Global Trading Floor", useType: "COMMERCIAL", elevationRange: "+80.0m to +84.0m MSL", zMin: 80.0, zMax: 84.0, carpetAreaSqm: 950.0, volumeM3: 3800.0, ulpin3D: "IND270051098220-V080084-T28", ownerName: "National Exchange Consortium", udsShareSqft: 9500.0, status: "REGISTERED" }
            ]
          }
        ],
        subsurfaceUtilities: [
          { id: "SUB-MUM-MTR", name: "Mumbai Metro Line 3 Underground Corridor", category: "METRO", depthRange: "-12.0m to -18.0m MSL", zMin: -18.0, zMax: -12.0, owner: "MMRC Mumbai", ulpin3D: "IND270051098220-U120180-M3", clearanceBufferM: 15.0, details: "Underground rapid transit corridor." }
        ]
      }
    ]
  },
  {
    id: "DELHI",
    name: "New Delhi",
    state: "Delhi NCT",
    center: [77.2185, 28.6315],
    zoom: 12.5,
    pitch: 45,
    bearing: 30,
    parcels: [
      {
        id: "PAR-DEL-01",
        name: "Connaught Place Financial Circle",
        surveyNumber: "DL-CP-140/2026",
        wardName: "Ward 42 - Connaught Zone",
        center: [77.2185, 28.6315],
        zoom: 16.5,
        pitch: 58,
        bearing: 35,
        buildings: [
          {
            id: "BLD-DEL-01",
            name: "Statesman Commercial Tower",
            ulpin2D: "IND110001048120",
            ulpin3D: "IND110001048120-V000620-A1",
            buildingId: "BLD-DEL-01",
            parcelId: "PAR-DEL-01",
            address: "Plot 14, Barakhamba Road, Connaught Place",
            floorsCount: 20,
            heightM: 62,
            footprintAreaSqm: 900.0,
            totalBuiltupSqm: 18000.0,
            sanctionedFsi: 3.0,
            actualFsi: 3.0,
            ghostFloorsCount: 0,
            coordinates: [77.2185, 28.6315],
            units: [
              { unitId: "U-DEL-18", floorNumber: 18, unitCode: "Central Board Administration", useType: "ADMINISTRATIVE", elevationRange: "+54.0m to +57.0m MSL", zMin: 54.0, zMax: 57.0, carpetAreaSqm: 680.0, volumeM3: 2040.0, ulpin3D: "IND110001048120-V054057-C18", ownerName: "Govt of Delhi NCT", udsShareSqft: 6800.0, status: "REGISTERED" }
            ]
          }
        ],
        subsurfaceUtilities: [
          { id: "SUB-DEL-MTR", name: "DMRC Yellow Line Underground Tunnel", category: "METRO", depthRange: "-9.5m to -14.0m MSL", zMin: -14.0, zMax: -9.5, owner: "Delhi Metro Rail Corp", ulpin3D: "IND110001048120-U095140-D9", clearanceBufferM: 15.0, details: "Underground rapid transit tunnel." }
        ]
      }
    ]
  }
];
