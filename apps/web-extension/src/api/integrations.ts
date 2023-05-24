import { API_URL } from "../config/contants";

export const getNylasIntegrationStatus = async (team_id: string) => {
    const response = await fetch(`${API_URL}/teams/${team_id}/integrations/nylas/status`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
    });

    return response.json();
}