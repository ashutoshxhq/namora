import { API_URL } from "../config/contants";

export const getTeams = async (team_id: string) => {
    const response = await fetch(`${API_URL}/teams/${team_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
    });

    return response.json();
}