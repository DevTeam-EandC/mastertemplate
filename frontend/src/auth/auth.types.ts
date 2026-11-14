
export interface LoginUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface DashboardAssignment {
    departmentId: string;
    departmentCode: string;
    departmentName: string;
    positionId: string;
    positionName: string;
    dashboardKey: string;
    isPrimary: boolean;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    expiresAtUtc: string;
    user: LoginUser;
    dashboards: DashboardAssignment[];
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthContextType {
    user: LoginUser | null;
    dashboards: DashboardAssignment[];
    activeDashboard: DashboardAssignment | null;
    loading: boolean;
    login: (
        email: string,
        password: string
    ) => Promise<LoginResponse>;
    switchDashboard: (
        dashboard: DashboardAssignment
    ) => boolean;
    logout: () => void;
}
