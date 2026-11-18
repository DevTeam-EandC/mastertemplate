
import api from "./api";

import type {
    ClientProfile,
    ClientProfileOptions,
    ClientLookup,
    ProjectProfile,
    SaveClient,
    SaveProject,
} from "./clientProfile.types";

// OPTIONS
export async function getClientProfileOptions(): Promise<ClientProfileOptions> {
    const response = await api.get<ClientProfileOptions>(
        "/ClientProfiles/options"
    );

    return response.data;
}

// CLIENTS
export async function listMyClientProfiles(): Promise<ClientProfile[]> {
    const response = await api.get<ClientProfile[]>(
        "/ClientProfiles/clients/mine"
    );

    return response.data;
}

export async function getClientProfile(
    clientId: string
): Promise<ClientProfile> {
    const response = await api.get<ClientProfile>(
        `/ClientProfiles/clients/${clientId}`
    );

    return response.data;
}

export async function lookupClient(email: string): Promise<ClientLookup> {
    const response = await api.get<ClientLookup>(
        "/ClientProfiles/clients/lookup",
        { params: { email } }
    );

    return response.data;
}

export async function createClientProfile(
    body: SaveClient
): Promise<ClientProfile> {
    const response = await api.post<ClientProfile>(
        "/ClientProfiles/clients",
        body
    );

    return response.data;
}

export async function updateClient(
    clientId: string,
    body: SaveClient
): Promise<ClientProfile> {
    const response = await api.put<ClientProfile>(
        `/ClientProfiles/clients/${clientId}`,
        body
    );

    return response.data;
}

// PROJECTS
export async function addProject(
    clientId: string,
    body: SaveProject
): Promise<ProjectProfile> {
    const response = await api.post<ProjectProfile>(
        `/ClientProfiles/clients/${clientId}/projects`,
        body
    );

    return response.data;
}

export async function getProject(
    projectId: string
): Promise<ProjectProfile> {
    const response = await api.get<ProjectProfile>(
        `/ClientProfiles/projects/${projectId}`
    );

    return response.data;
}

export async function updateProject(
    projectId: string,
    body: SaveProject
): Promise<ProjectProfile> {
    const response = await api.put<ProjectProfile>(
        `/ClientProfiles/projects/${projectId}`,
        body
    );

    return response.data;
}

export async function sendClientProfileToDesign(
    projectId: string
): Promise<ProjectProfile> {
    const response = await api.post<ProjectProfile>(
        `/ClientProfiles/projects/${projectId}/send-to-design`
    );

    return response.data;
}

export async function listClientProfilesForDesign(): Promise<ProjectProfile[]> {
    const response = await api.get<ProjectProfile[]>(
        "/ClientProfiles/for-design"
    );

    return response.data;
}
