export const linkVesselCRMTokenFetcher = async (
  baseURL: string,
  teamId: string,
  accessToken: string
) => {
  try {
    const linkTokenRes = await fetch(
      `${baseURL}/teams/${teamId}/integrations/crm/link-token`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    ).then((res) => res.json());
    return linkTokenRes;
  } catch (error) {
    throw error;
  }
};

export const exchangeVesselCRMTokenFetcher = async (
  baseURL: string,
  teamId: string,
  accessToken: string,
  publicToken: string
) => {
  try {
    const res = await fetch(
      `${baseURL}/teams/${teamId}/integrations/crm/exchange-token`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ public_token: publicToken }),
      }
    );
    const linkTokenRes = await res.json();
    return linkTokenRes;
  } catch (error) {
    throw error;
  }
};

export const vesselCRMConnectionStatusFetcher = async (
  baseURL: string,
  teamId: string,
  connectionId: string,
  accessToken: string
) => {
  const encodedConnectionId = connectionId
    ? encodeURIComponent(connectionId)
    : "";

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
  connectionId: string,
  accessToken: string
) => {
  const encodedConnectionId = connectionId
    ? encodeURIComponent(connectionId)
    : "";

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
