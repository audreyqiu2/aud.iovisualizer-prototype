// imports
var SpotifyWebApi = require('spotify-web-api-node')
const express = require("express");
const jwt = require('jsonwebtoken');
// const decodedToken = jwt.decode(access_token)
const axios = require('axios');
const request = require("request");
const { text } = require('express');
const app = express();
app.use(express.json());

const port = 4000;

// Developer codes
var spotifyApi = new SpotifyWebApi({
  clientId: '9d94f606e5f14c6e9d25d87b2ed63cfb',
  clientSecret: '2598aa227a584e9e8ca50b0ff559d01c',
  redirectUri: 'http://localhost:4000/callback'
});
const scopes = [
  'streaming',
  'user-read-email',
  'user-library-read',
  'playlist-read-private',
  'user-modify-playback-state'
];

var CLIENT_ID = '9d94f606e5f14c6e9d25d87b2ed63cfb';
var CLIENT_SECRET = '2598aa227a584e9e8ca50b0ff559d01c';
var REDIRECT_URI = 'http://localhost:4000/callback';

// Base URL for making calls to Spotify API once logged in
const BASE_URL = "https://api.spotify.com/v1";

// access code + token
let code = "";
let access_token = "";
let refresh_token = "";
let expires_at = null;

// static files
app.use(express.static("public"));
app.use("/styles.css", express.static(__dirname + "/public/styles.css"));
app.use("/index.js", express.static(__dirname + "/public/index.js"));
app.use("/index.html", express.static(__dirname + "/public/index.html"));

// Request access token and refresh token from Spotify API
app.get('/callback', (req, res) => {
  const code = req.query.code;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: 'http://localhost:4000/callback',
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
    },
    json: true
  };

  request.post(authOptions, (error, response, body) => {
    access_token = body.access_token;
    refresh_token = body.refresh_token;
    console.log('access token', access_token);
    console.log('refresh token', refresh_token);

    res.json({ access_token });
    // res.sendFile(__dirname + "/public/index.html");
  });
});

// Gets basic current user information
app.get('/get-me', (req, res) => {
  const authOptions = {
    url: BASE_URL + '/me',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`
    }
  };

  axios.get(authOptions.url, { headers: authOptions.headers })
    .then(response => {
      // console.log(response.data);
      res.status(200).send(response.data);
    })
    .catch(error => {
      console.error(error);
      res.type(text);
      res.status(500).send('Error getting user info');
    })
});

// Gets current user's top playlists
app.get('/get-my-playlists', (req, res) => {
  const authOptions = {
    url: BASE_URL + '/me/playlists?limit=10',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`
    }
  };

  axios.get(authOptions.url, { headers: authOptions.headers })
    .then(response => {
      // console.log(response.data);
      res.status(200).send(response.data);
    })
    .catch(error => {
      console.error(error);
      res.type(text);
      res.status(500).send('Error getting users playlists');
    })
});

// Start Spotify playback
app.put('/playback/start', async (req, res) => {
  const playlistUri = req.body.playlist_uri;
  console.log(playlistUri);
  let url = BASE_URL + "/me/player/play";
  // console.log(url);
  // let filter = "fields=tracks.items(added_at)";

  try {
    const response = await axios.put(url,
    {
      context_uri: playlistUri
    },
    {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    res.status(200).send('Playback started successfully');
  } catch (error) {
    console.log(error);
    res.status(500).send('Something went wrong');
  }
});

// Get more playlist info
app.post('/get-playlist-info', async (req, res) => {
  const playlistUrl = req.body.playlist_url;
  console.log(playlistUrl);
  let url = BASE_URL + "/me/player/play";
  url += "";
  // console.log(url);
  // let filter = "fields=tracks.items(added_at)";

  try {
    const response = await axios.put(url, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    res.json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).send('Something went wrong!');
  }
});

// Uses the refresh token to ask for a new access token
app.get('/refresh_token', function(req, res) {
  console.log('refresh token:', refresh_token);
  const decodedToken = jwt.decode(access_token);
  if (decodedToken.exp < Date.now() / 1000) {
    console.log("access code expired");
  } else {
    console.log("access code not expired");
  }

  // const data = {
  //   grant_type: 'refresh_token',
  //   refresh_token: refresh_token,
  //   client_id: CLIENT_ID,
  //   client_secret: CLIENT_SECRET,
  // };

  // const response = await axios.post('https://accounts.spotify.com/api/token', data);
  // const { access_token, expires_in } = response.data;

  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token;
      console.log('refreshed access token:', access_token);
      res.send({
        'access_token': access_token
      });
    }
  });
})

// function getMyData() {
//   const spotifyApi = new SpotifyWebApi({
//     clientId: '9d94f606e5f14c6e9d25d87b2ed63cfb',
//     clientSecret: '2598aa227a584e9e8ca50b0ff559d01c',
//     redirectUri: 'http://localhost:4000/callback',
//     accessToken: token
//   });
//   // spotifyApi.setAccessToken(token);

//   console.log('in getmydata');
//   (async () => {
//     console.log('in asyn');
//     spotifyApi.getMe()
//       .then(function(data) {
//         console.log("user info:", data.body);
//       })
//     // const me = await spotifyApi.getMe();
//     // console.log(me.body);
//     // getUserPlaylists(me.body.id);
//   })().catch(e => {
//     console.error(e);
//   });
// }

// async function getUserPlaylists(userName) {
//   const data = await spotifyApi.getUserPlaylists(userName);

//   console.log("-----------------____");
//   let playlists = [];

//   for (let playlist of data.body.items) {
//     console.log(playlist.name + " " + playlist.id);

//     // let tracks = await getPlaylistTracks(playlist.id, playlist.name);
//     // console.log(tracks);

//     // const tracksJSON = { tracks };
//     // let data = JSON.stringify(tracksJSON);
//   }
// }

// // After the user is authenticated through Spotify OAuth login
// app.get('/callback', async function(req, res) {
//   code = req.query.code;
//   console.log(code);

//   res.sendFile(__dirname + "/public/index.html");

//   console.log("test");
//   spotifyApi.setAccessToken('<your_access_token>');
//   spotifyApi
//     .authorizationCodeGrant(code)
//     .then( data => {
//       // console.log("in the callback spotifyapi");

//       console.log(data.body);

//       // const access_token = data.body['access_token'];
//       // const refresh_token = data.body['refresh_token'];
//       // const expires_in = data.body['expires_in']

//       // console.log("access_token", access_token);
//       // console.log("refresh_token", refresh_token);

//       // token = access_token;
//       // // console.log("token:", token);

//       // spotifyApi.setAccessToken(access_token);
//       // // console.log("set acces token");
//       // spotifyApi.setRefreshToken(refresh_token);


//       // console.log('succesfuly retrieved access token. expires in ' + expires_in);
//       // res.send('Success! Close the window');

//       // setInterval(async() => {
//       //   const data = await spotifyApi.refreshAccessToken();
//       //   const access_token = data.body['access_token'];

//       //   console.log("The access token has been refreshed");
//       //   spotifyApi.setAccessToken(access_token)
//       // }, expires_in / 2 * 1000);
//     })
//     .catch(error => {
//       console.error("Error getting Tokens:", error);
//       res.send("Error getting Tokens: ${error");
//     });

//     getMyData();

//   // res.sendFile(__dirname + "/public/index.html");

//   });




// app.get('/get-access-token', (req, res) => {
//   var code = req.query.code || null;

//   // console.log(code);

//   var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: {
//       'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
//     },
//     form: {
//       grant_type: 'client_credentials'
//     },
//     json: true
//   };

//   request.post(authOptions, function(error, response, body) {
//     if (!error && response.statusCode === 200) {

//       // console.log(body.access_token);

//       token = body.access_token;
//     }
//   });
// })

// app.get('/get-playlists', async (req, res) => {

//   console.log('in get-playlists endpoint')
//   var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: {
//       'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
//     },
//     form: {
//       grant_type: 'client_credentials'
//     },
//     json: true
//   };

//   request.post(authOptions, function(error, response, body) {
//     if (!error && response.statusCode === 200) {

//       // console.log(body.access_token);

//       token = body.access_token;

//       let url = baseURL + "/me/playlists?limit=10";
//       console.log(url);
//       const options = {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       }
//       console.log(options);
//       // console.log(res);
//       res.redirect(url);
//     }
//   });

//   // console.log(token);


//   // let url = baseURL + "/me/playlists?limit=10";
//   // const options = {
//   //   headers: {
//   //     'Authorization': `Bearer ${token}`,
//   //     'Content-Type': 'application/json'
//   //   }
//   // }
//   // console.log(options);
//   // // console.log(res);
//   // res.redirect(url);
// });

// function generateRandomString(length) {
//   let text = "";
//   const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   for (let i = 0; i < length; i++) {
//     text += possible.charAt(Math.floor(Math.random() * possible.length));
//   }
//   return text;
// }


app.listen(port, () => console.info("listening on port ${port}"));