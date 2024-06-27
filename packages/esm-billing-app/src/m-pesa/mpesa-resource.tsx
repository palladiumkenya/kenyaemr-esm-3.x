import { Buffer } from 'buffer';

export const generateStkAccessToken = async (authorizationUrl: string, setNotification) => {
  try {
    const consumerKey = '';
    const consumerSecret = '';
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    };
    const response = await fetch(authorizationUrl, { method: 'GET', headers: headers });
    const { access_token } = await response.json();
    return access_token;
  } catch (error) {
    setNotification('Unable to reach the MPESA server, please try again later.');
    throw error;
  }
};

export const initiateStkPush = async (payload, initiateUrl: string, authorizationUrl: string, setNotification) => {
  try {
    const access_token = await generateStkAccessToken(authorizationUrl, setNotification);
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    };
    const response = await fetch(initiateUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });

    return await response.json();
  } catch (err) {
    setNotification('Unable to initiate Lipa Na Mpesa, please try again later.');
    throw err;
  }
};
