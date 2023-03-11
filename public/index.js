console.log("in index.js");

const port = 4000;

// Developer codes
var CLIENT_ID = '9d94f606e5f14c6e9d25d87b2ed63cfb'
var CLIENT_SECRET = '2598aa227a584e9e8ca50b0ff559d01c';
var REDIRECT_URI = 'http://localhost:4000/callback';

// Base URL for logging in and OAuth authentification
const baseAuthURL = "https://accounts.spotify.com/authorize";
// Base URL for accessing user tokens once authenticated
// const TOKEN_URL = "https://accounts.spotify.com/api/token";

// Scope of the API calls
const scope = "user-modify-playback-state streaming user-library-read playlist-read-private";

// Access token to be retrieved
let access_token = "";
let CODE = "";

// For collecting current user's playlists
// Contains endpoints to the Spotify API to get info about the playlist
let playlists = [];


window.addEventListener("load", init);
window.onSpotifyWebPlaybackSDKReady = () => {
  fetch('/callback')
    .then()
  const token = '[My access token]';
  const player = new Spotify.Player({
    name: 'Web Playback SDK Quick Start Player',
    getOAuthToken: cb => { cb(token); },
    volume: 0.5
  });
}

function init() {
  console.log("in init");

  // window.location.href += 'login';
  // authorizationRequestHandler();

  afterAuthentication();
  // Listen to button for logging in to Spotify
  id("loginBtn").addEventListener("click", authorizationRequestHandler);

}

function authorizationRequestHandler() {
  const state = generateRandomString(16);
  // console.log(state);
  // window.location.href = "http://localhost:4000/login"
  // fetch('/login')
  //   .then(response => response.text())
  //   .then(data => {
  //     console.log("Successfully got code: ");
  //     console.log(data);
  //   })
  // localStorage.setItem("spotify_auth_state", state);
  let url = "https://accounts.spotify.com/authorize?" +
    "client_id=" + CLIENT_ID +
    "&response_type=code" +
    "&redirect_uri=" + encodeURI(REDIRECT_URI) +
    "&show_dialogue=true" +
    "&scope=" + encodeURI(scope);
    "&state=" + state;
  console.log(url);
  window.location.href = url;

  afterAuthentication();
}

function generateRandomString(length) {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// After the user is authenticated through the Spotify API, hide the login button,
// and show the playlists as a list to choose from
function afterAuthentication() {
  if (window.location.search.length > 0) {
    id("loginBtn").classList.add("hidden");
    id("myPlaylistsHeading").classList.remove("hidden");
    makeRequestForUserInfo();
    makeRequestForPlaylists();
  } else {
    id("loginBtn").classList.remove("hidden");
    id("myPlaylistsHeading").classList.add("hidden");
  }
}

// Makes request to get top 10 playlists from current user
function makeRequestForPlaylists() {
  fetch('/get-my-playlists')
    .then(response => response.json())
    .then(data => {
      handlePlaylists(data);
    })
    .catch(error => console.error(error));
}

// Handles the data returned with 10 playlists from current user.
// Adds their name to the DOM.
function handlePlaylists(data) {
  // Logs data from the top 10 playlists
  console.log(data);

  for (let i = 0; i < data.items.length; i++) {
    let playlist = data.items[i];
    let playlist_uri = playlist.uri;
    playlists.push(playlist_uri);

    // Querying for the HTML element to modify
    let idx = i + 1;
    let query = "#playlists :nth-child(" + idx + ")";
    let listNode = qs(query);
    listNode.innerHTML = playlist.name;
    listNode.addEventListener("click", () => {
      makeRequestRefreshToken();
      makeRequestToPlay(idx);
    });
  }
  console.log(playlists);
}

// Handles a request to the Spotify API to start a playback on the specified playlist
function makeRequestToPlay(idx) {
  let uri = playlists[idx - 1];
  fetch('/playback/start', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      playlist_uri: uri
    })
  })
    .then(response => {
      console.log("playingggg!");
    })
    .catch(error => console.error());
}

// Handles a request to the Spotify API to get user info
function makeRequestForUserInfo() {
  fetch('/get-me')
    .then(response => response.json())
    .then(data => {
      let nameNode = id("username");
      let avatarNode = qs("#myPlaylistsHeading img");

      avatarNode.src = data.images[0].url;
      nameNode.textContent = data.display_name;

      // console.log(data);
    })
    .catch(error => console.error(error));
}

function makeRequestRefreshToken() {
  fetch('/refresh_token')
    .then(response => response.json())
    .catch(e => {console.error(e)})
}

// Takes the playlist url that is returned from the user's most recent playlists;
// handles a request to get more info about the playlist
function makeRequestForPlaylistInfo(playlistUrl) {
  let modDate = null;
  fetch('/get-playlist-info', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      playlist_url: playlistUrl
    })
  })
    .then(response => response.json())
    .then(data => {
      modDate = data.tracks.items[0].added_at;
    })
    .catch(error => console.error());
}



// //
// function makeRequestToAuthorize(code, state) {
//   if (code) {
//     const data = {
//       grant_type: "authorization_code",
//       code: code,
//       redirect_uri: REDIRECT_URI,
//       client_id: CLIENT_ID,
//       client_secret: CLIENT_SECRET,
//       state: state,
//     };
//     getCode(data);
//   }
// }

// function getCode(data) {
//   fetch(TOKEN, {
//     method: "POST",
//     header: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     body: new URLSearchParams(data),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       access_token = data.access_token;
//       afterAuthentication();
//     })
//     .catch((error) => {
//       console.error(error);
//     })
// }

// function afterAuthentication() {
//   console.log("authenticated with token");
// }






/**
   * Checks the status of the fetch request sent to the Pokemon API. If HTTP status
   * is within the correct range, returns true. Returns false otherwise.
   * @param {JSObject} response - Response from the fetch request to the Pokemon API.
   * @returns {boolean} - Returns whether the "status" field of the response object reads "ok".
   */
async function statusCheck(response) {
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response;
}

/**
 * Auxilary function for query selecting all and returning elements by selector
 * @param {string} selector - selector for elements to be returned
 * @return {NodeList} returns node list of HTML elements with corresponding CSS selector
 */
function id(selector) {
  return document.getElementById(selector);
}

/**
 * Auxilary function for query selecting and returning element by id
 * @param {string} selector - selector for element to be returned
 * @return {NodeList} returns HTML element with corresponding CSS selector
 */
function qs(selector) {
  return document.querySelector(selector);
}

/**
 * Auxilary function for query selecting and returning element by id
 * @param {string} selector - selector for element to be returned
 * @return {NodeList} returns HTML element with corresponding CSS selector
 */
function qsa(selector) {
  return document.querySelectorAll(selector);
}
