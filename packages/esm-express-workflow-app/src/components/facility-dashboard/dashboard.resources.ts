import z from 'zod';
import { ExpressWorkflowConfig } from '../../config-schema';
import { openmrsFetch, refetchCurrentUser, restBaseUrl, Session, User } from '@openmrs/esm-framework';

export const getToken = async (
  username: string,
  password: string,
  config: ExpressWorkflowConfig['supersetDashboardConfig'],
) => {
  const supersetApiUrl = config.host + '/api/v1/security';
  const loginBody = {
    password: password,
    provider: 'db',
    refresh: true,
    username: username,
  };

  const loginResponse = await fetch(supersetApiUrl + '/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginBody),
  });

  const loginData = await loginResponse.json();
  const accessToken = loginData['access_token'];

  // Calling guest token
  const guestTokenBody = {
    resources: [
      {
        type: 'dashboard',
        id: config.dashboardId,
      },
    ],
    rls: [],
    user: {
      username: '',
      firstName: '',
      lastName: '',
    },
  };

  const guestTokenResponse = await fetch(supersetApiUrl + '/guest_token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + accessToken,
    },
    body: JSON.stringify(guestTokenBody),
  });

  const guestTokenData = await guestTokenResponse.json();
  return guestTokenData['token'];
};

export const generateToken = (payload: DashboardAuthorizationForm) => {
  return btoa(`${btoa(payload.username)}:${btoa(payload.password)}`);
};
export const decodeToken = (token: string): DashboardAuthorizationForm => {
  const [username, password] = atob(token).split(':').map(atob);
  return { username, password };
};

export const authorizeDashboard = async (user: Session['user'], payload: DashboardAuthorizationForm) => {
  const dashboardAccessToken = generateToken(payload);
  const res = await openmrsFetch<User>(`${restBaseUrl}/user/${user.uuid}`, {
    method: 'POST',
    body: { userProperties: { ...user.userProperties, dashboardAccessToken } },
    headers: {
      'Content-Type': 'application/json',
    },
  });
  await refetchCurrentUser();
  return res.data;
};

export const clearDashboardSession = async (user: Session['user']) => {
  const res = await openmrsFetch<User>(`${restBaseUrl}/user/${user.uuid}`, {
    method: 'POST',
    body: { userProperties: { ...user.userProperties, dashboardAccessToken: undefined } },
    headers: {
      'Content-Type': 'application/json',
    },
  });
  await refetchCurrentUser();
  return res.data;
};

export const DashboardAuthorizationFormSchema = z.object({
  username: z.string().min(4),
  password: z.string().min(4),
});

export type DashboardAuthorizationForm = z.infer<typeof DashboardAuthorizationFormSchema>;
