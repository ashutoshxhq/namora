export const linkVesselCRMTokenFetcher = async (
  baseURL: string,
  teamId: string
) => {
  try {
    const res = await fetch(
      `${baseURL}/teams/${teamId}/integrations/crm/link-token`,
      {
        method: "POST",
      }
    );
    const linkTokenRes = res.json();
    return linkTokenRes;
  } catch (error) {
    throw error;
  }
};

export const exchangeVesselCRMTokenFetcher = async (
  baseURL: string,
  teamId: string,
  publicToken: string
) => {
  try {
    const res = await fetch(
      `${baseURL}/teams/${teamId}/integrations/crm/exchange-token`,
      {
        method: "POST",
        body: JSON.stringify({ public_token: publicToken }),
      }
    );
    const linkTokenRes = await res.json();
    return linkTokenRes;
  } catch (error) {
    throw error;
  }
};

export const vesselCRMConnectionStatusFetcher = async ({
  baseURL,
  teamId,
  connectionId,
  init = {},
}: {
  baseURL: string;
  teamId: string;
  connectionId: string;
  init?: RequestInit;
}) => {
  const encodedConnectionId = connectionId
    ? encodeURIComponent(connectionId)
    : "";

  try {
    const res = await fetch(
      `${baseURL}/teams/${teamId}/integrations/crm/connections/${encodedConnectionId}`,
      init
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
  connectionId: string
) => {
  const encodedConnectionId = connectionId
    ? encodeURIComponent(connectionId)
    : "";

  try {
    const res = await fetch(
      `${baseURL}/teams/${teamId}/integrations/crm/connections/${encodedConnectionId}`,
      {
        method: "DELETE",
      }
    );
    const connectionStatus = res?.json();
    return connectionStatus;
  } catch (error) {
    throw error;
  }
};
