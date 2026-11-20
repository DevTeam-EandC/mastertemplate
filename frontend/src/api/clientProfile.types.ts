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
    shaftDetails: string | null;
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

export interface ClientLookup {
    exists: boolean;
    client: ClientProfile | null;
}

// CLIENT RESPONSE
export interface ClientProfile {
    id: string;
    clientName: string;
    mobileNumber: string;
    emailAddress: string;
    leadSource: string;
    referralBy: string | null;
    accountManagerUserId: string;
    accountManagerName: string;
    createdAtUtc: string;
    updatedAtUtc: string;
    projects: ProjectProfile[];
}

// PROJECT RESPONSE
export interface ProjectProfile {
    id: string;
    clientId: string;
    clientName: string;
    mobileNumber: string;
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

// CLIENT CREATE / UPDATE REQUEST
// Lead source and referral are recorded per project, not per client.
export interface SaveClient {
    clientName: string;
    mobileNumber: string;
    emailAddress: string;
}

// PROJECT CREATE / UPDATE REQUEST
export interface SaveProject {
    buildingType: string;
    salesOfficerUserId: string;
    quotationType: string;
    leadSource: string;
    referralBy: string | null;
    specialInstructions: string | null;
    numberOfElevators: number;
    elevators: ElevatorDetail[];
}
