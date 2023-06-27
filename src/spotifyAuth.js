require('dotenv').config();

const axios = require('axios');

// Get an access token
async function getAccessToken() {
  try {  // fetches access token through spotify weirdness
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        grant_type: 'client_credentials',
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`, // client id and secret are mine. looking into making
                                // this work with a login.
      },
    });

    if (response.status === 200) {
      return response.data.access_token;
    }
  } catch (error) {
    console.error('Failed to obtain access token:', error.message);
  }

  return null;
}

module.exports = { getAccessToken };