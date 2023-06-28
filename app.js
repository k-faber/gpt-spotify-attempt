const express = require('express');
const spotifyNode = require('spotify-web-api-node');
const { Chatbot, ChatGPTInput } = require('intellinode');

// Load environment variables from .env file
require('dotenv').config();

// Create an instance of the Express web server
const app = express();

// Configure Spotify API credentials
const spotifyApi = new spotifyNode({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Define the route for handling the Spotify authorization callback
app.get('/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange the authorization code for an access token
    const authResponse = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = authResponse.body;

    // Set the access token on the Spotify API instance
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    // Redirect the user to the desired route or perform any other actions
    res.redirect('/top-tracks');
  } catch (error) {
    console.error('Error during authorization:', error);
    res.status(500).send('Authorization error');
  }
});



// Define a route for retrieving the user's top tracks
app.get('/top-tracks', async (req, res) => {
  try {
    // Retrieve the user's top tracks from the Spotify API
    const response = await spotifyApi.getMyTopTracks({ limit: 10 });

    // process tracks, store them as list of objects
    const tracks = response.body.items.map((track) => ({
      name: track.name,
      artist: track.artists.map((artist) => artist.name),
      album: track.album.name,
    }));
    console.log(tracks);

    // setup chatGPT integration through intellinode (can be changed to different library)
    const chatbot = new Chatbot(process.env.OPENAI_API_KEY, 'openai');
    const prompt = new ChatGPTInput('Summarize my top tracks that I will paste at the end of this prompt. Also ' +
                                    'make a list of 10 songs similar to these songs.\n' + tracks);
    const responses = await chatbot.chat(prompt);

    res.send(`
    
    <!DOCTYPE html>

    <html>
      <body>
        <p>"${responses}"</p>
      </body>
    </html>
    
    `);
  } catch (error) {
    console.error('error:', error);
    res.status(500).send('error: check console');
  }
});

// Define a route for the root URL
app.get('/', (req, res) => {
  const authorizeURL = spotifyApi.createAuthorizeURL(['user-top-read']);

  // HTML template with the login button
  const html = `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Welcome to this experiment<h1>
        <p>Please log in with Spotify:</p>
        <a href="${authorizeURL}">
          <button>Log In with Spotify</button>
        </a>
      </body>
    </html>
  `;

  res.send(html);
});

// Start the server
const port = process.env.PORT || 8888;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
