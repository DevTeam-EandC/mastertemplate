
export interface ElevatorDetail {
    elevatorType: string;
    ratedCapacity: string;
    numberOfFloors: number;
    numberOfStops: number;
    numberOfOpenings: number;
    machineRoomType: string;
    typeOfDoor: string;
    elevatorControlSystem: string;
    shaftExisting: boolean;
}

export interface SalesOfficerOption {
    userId: string;
    fullName: string;
}

export interface ClientProfileOptions {
    salesOfficers: SalesOfficerOption[];
    leadSources: string[];
    quotationTypes: string[];
    doorTypes: string[];
    controlSystems: string[];
    elevatorTypes: string[];
    machineRoomTypes: string[];
    projectType: string;
    defaultTypeOfUnit: string;
}

// Client-level information.
// One client can have multiple projects.
export interface ClientProfile {
    id: string;
    clientName: string;
    contactNumber: string;
    emailAddress: string;
    leadSource: string;
    referralBy: string | null;
    accountManagerUserId: string;
    accountManagerName: string;
    createdAtUtc: string;
    updatedAtUtc: string;
    projects: ProjectProfile[];
}

// Project-level information.
// Each project belongs to one client.
export interface ProjectProfile {
    id: string;
    clientId: string;
    clientName: string;
    contactNumber: string;
    emailAddress: string;
    leadSource: string;
    referralBy: string | null;
    accountManagerName: string;
    buildingType: string;
    projectType: string;
    salesOfficerUserId: string;
    salesOfficerName: string;
    typeOfUnit: string;
    quotationType: string;
    specialInstructions: string | null;
    numberOfElevators: number;
    isSentToDesign: boolean;
    sentToDesignAtUtc: string | null;
    createdAtUtc: string;
    updatedAtUtc: string;
    elevators: ElevatorDetail[];
}

// Client create/update request.
export interface SaveClient {
    clientName: string;
    contactNumber: string;
    emailAddress: string;
    leadSource: string;
    referralBy: string | null;
}

// Project create/update request.
export interface SaveProject {
    buildingType: string;
    salesOfficerUserId: string;
    quotationType: string;
    specialInstructions: string | null;
    numberOfElevators: number;
    elevators: ElevatorDetail[];
}

// Creating a new client and its first project.
export interface CreateClientProfile {
    client: SaveClient;
    project: SaveProject;
}
