export const vesselCRMConnectionStatusFetcher = async (
  baseURL: string,
  teamId: string,
  encodedConnectionId: string,
  accessToken: string
) => {
  try {
    const res = await fetch(
      `${baseURL}/teams/${teamId}/integrations/crm/connections/${encodedConnectionId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const connectionStatusRes = res?.json();
    return connectionStatusRes;
  } catch (error) {
    throw error;
  }
};

export const vesselCRMDisconnectStatusFetcher = async (
  baseURL: string,
  teamId: string,
  encodedConnectionId: string,
  accessToken: string
) => {
  try {
    const res = await fetch(
      `${baseURL}/teams/${teamId}/integrations/crm/connections/${encodedConnectionId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        method: "DELETE",
      }
    );
    const connectionStatus = res?.json();
    return connectionStatus;
  } catch (error) {
    throw error;
  }
};
