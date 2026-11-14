export interface UserDepartmentAssignment {
    id: string;
    departmentId: string;
    departmentCode: string;
    departmentName: string;
    positionId: string;
    positionName: string;
    isPrimary: boolean;
    isActive: boolean;
    assignedAtUtc: string;
}

export interface UserResponse {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    roles: string[];
    isActive: boolean;
    createdAt: string;
    departmentAssignments: UserDepartmentAssignment[];
}

export interface UserAssignmentItem {
    departmentId: string;
    positionId: string;
    isPrimary: boolean;
}

export interface CreateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roles: string[];
    assignments: UserAssignmentItem[];
}

export interface UpdateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
}

export interface UpdateUserRolesRequest {
    roles: string[];
}

export interface UpdateUserAssignmentsRequest {
    assignments: UserAssignmentItem[];
}
