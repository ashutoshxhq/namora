// import { getAxiosClient } from "@/axios";

// export const getTeam = async ({
//   accessToken,
//   teamId,
// }: {
//   accessToken: string;
//   teamId: string;
// }) => {
//   try {
//     if (!accessToken && !teamId) return null;
//     const response = await getAxiosClient(accessToken).get(
//       `/api/teams/${teamId}`
//     );
//     return response?.data ?? [];
//   } catch (err) {
//     throw err;
//   }
// };

// export const getUsersOfTeam = async ({
//   accessToken,
//   teamId,
// }: {
//   accessToken: string;
//   teamId: string;
// }) => {
//   try {
//     if (!accessToken && !teamId) return null;
//     const response = await getAxiosClient(accessToken).get(
//       `api/teams/${teamId}/users`
//     );
//     return response?.data ?? [];
//   } catch (err) {
//     throw err;
//   }
// };

export {};
