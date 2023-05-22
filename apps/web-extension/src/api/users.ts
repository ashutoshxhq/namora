import { API_URL } from "../config/contants";

export const getUsers = async (team_id: string, user_id: string) => {
    const response = await fetch(`${API_URL}/teams/${team_id}/users/${user_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
    });

    return response.json();
}