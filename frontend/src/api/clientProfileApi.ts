import api from "./api";
import type {
    ClientProfile,
    ClientProfileOptions,
    SaveClientProfile,
} from "./clientProfile.types";

export async function getClientProfileOptions(): Promise<ClientProfileOptions> {
    const response = await api.get<ClientProfileOptions>(
        "/ClientProfiles/options"
    );
    return response.data;
}

export async function listMyClientProfiles(): Promise<ClientProfile[]> {
    const response = await api.get<ClientProfile[]>("/ClientProfiles/mine");
    return response.data;
}

export async function getClientProfile(id: string): Promise<ClientProfile> {
    const response = await api.get<ClientProfile>(`/ClientProfiles/${id}`);
    return response.data;
}

export async function createClientProfile(
    body: SaveClientProfile
): Promise<ClientProfile> {
    const response = await api.post<ClientProfile>("/ClientProfiles", body);
    return response.data;
}

export async function updateClientProfile(
    id: string,
    body: SaveClientProfile
): Promise<ClientProfile> {
    const response = await api.put<ClientProfile>(
        `/ClientProfiles/${id}`,
        body
    );
    return response.data;
}

export async function sendClientProfileToDesign(
    id: string
): Promise<ClientProfile> {
    const response = await api.post<ClientProfile>(
        `/ClientProfiles/${id}/send-to-design`
    );
    return response.data;
}

export async function listClientProfilesForDesign(): Promise<ClientProfile[]> {
    const response = await api.get<ClientProfile[]>(
        "/ClientProfiles/for-design"
    );
    return response.data;
}
