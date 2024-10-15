// pages/api/auth/token.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code, redirect_uri, client_id, client_secret, auth_url, tenant } = req.body;
  const tokenUrl = `${auth_url}/auth/realms/${tenant}/protocol/openid-connect/token`;

  try {
    const tokenResponse = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        client_id,
        client_secret,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return res.status(200).json(tokenResponse.data);
  } catch (error) {
    console.error('Error al intercambiar el código por token:', error.response?.data || error.message);
    return res.status(500).json({ message: 'Error al obtener access_token' });
  }
}
