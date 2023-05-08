import { getAxiosClient } from "@/axios";

export const linkVesselCRMToken = async ({
  accessToken,
  teamId,
}: {
  accessToken: string;
  teamId: string;
}) => {
  try {
    if (!accessToken) return null;
    const response = await getAxiosClient(accessToken).post(
      `https://engine.svc.api.namora.ai/teams/${teamId}/integrations/crm/link-token`
    );
    return response?.data;
  } catch (err) {
    throw err;
  }
};

export const exchangeVesselCRMToken = async ({
  publicToken,
  accessToken,
  teamId,
}: {
  publicToken: string;
  accessToken: string;
  teamId: string;
}) => {
  try {
    if (!accessToken && !publicToken) return null;
    const response = await getAxiosClient(accessToken).post(
      `https://engine.svc.api.namora.ai/teams/${teamId}/integrations/crm/exchange-token`,
      {
        public_token: publicToken,
      }
    );
    return response?.data;
  } catch (err) {
    throw err;
  }
};

export const getVesselCRMConnectionStatus = async ({
  connectionId,
  accessToken,
  teamId,
}: {
  connectionId: string;
  accessToken: string;
  teamId: string;
}) => {
  try {
    if (!accessToken && !connectionId) return null;
    const response = await getAxiosClient(accessToken).get(
      `https://engine.svc.api.namora.ai/teams/${teamId}/integrations/crm/connections/${connectionId}`
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const disconnectVesselCRMConnection = async ({
  accessToken,
  teamId,
  connectionId,
}: {
  accessToken: string;
  teamId: string;
  connectionId: string;
}) => {
  try {
    if (!accessToken) return null;
    const response = await getAxiosClient(accessToken).delete(
      `https://engine.svc.api.namora.ai/teams/${teamId}/integrations/crm/connections/${connectionId}`
    );
    return response?.data;
  } catch (error) {
    throw error;
  }
};
