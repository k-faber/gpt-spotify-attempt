require('dotenv').config();

const spotifyAuth = require('./src/spotifyAuth.js');
const spotifyNode = require('spotify-web-api-node');

var spotifyApi = new spotifyNode({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: 'localhost:8080'
});

async function main() { // main made async so that i can get access token :)

  const accessToken = await spotifyAuth.getAccessToken(); // get access code
  spotifyApi.setAccessToken(accessToken);  // send to spotify API

  // Get Muse's albums
  spotifyApi.getArtistAlbums('12Chz98pHFMPJEknJQMWvI').then(
    function(data) {
      console.log('Artist albums', data.body);
    },
    function(err) {
      console.error(err);
    }
  );

}

main();

// WHAT TO DO:

// find way to bring data from spotifyAuth
// get GPT stuff set up
// Fix prompts up to get data
// Find way to make playlist of result