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

export interface ClientProfile {
    id: string;
    clientName: string;
    contactNumber: string;
    emailAddress: string;
    buildingType: string;
    projectType: string;
    salesOfficerUserId: string;
    salesOfficerName: string;
    accountManagerUserId: string;
    accountManagerName: string;
    leadSource: string;
    typeOfUnit: string;
    referralBy: string | null;
    specialInstructions: string | null;
    quotationType: string;
    numberOfElevators: number;
    isSentToDesign: boolean;
    sentToDesignAtUtc: string | null;
    createdAtUtc: string;
    updatedAtUtc: string;
    elevators: ElevatorDetail[];
}

// Body sent to create and update. The server sets Project Type, Account
// Manager and Type of Unit, so they are not part of this request.
export interface SaveClientProfile {
    clientName: string;
    contactNumber: string;
    emailAddress: string;
    buildingType: string;
    salesOfficerUserId: string;
    leadSource: string;
    referralBy: string | null;
    specialInstructions: string | null;
    quotationType: string;
    numberOfElevators: number;
    elevators: ElevatorDetail[];
}
