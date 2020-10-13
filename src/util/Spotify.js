
const clientID = "322def6893f7425a9a28afa28e994bd2";
const redirectURI = 'localhost:3000';

const proxyURL = 'https://cors-anywhere.herokuapp.com/'

let accessToken;

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            console.log('Already has Access Token')
            return accessToken
        }

        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if(accessTokenMatch && expiresInMatch){
            console.log('SPOTIFY 20 ')
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken
        } else {
            console.log('Sign in with client ID and then redirect to redirect URI')
            window.location = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
        }
        
    },

    search(term) {
        const accessToken = this.getAccessToken();
        console.log(accessToken + ' is the access TOKEN')
        let url = `${proxyURL}http://api.spotify.com/v1/search?type=track&q=${term}`
        return fetch(url, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
        }).then(jsonResponse => {
            if (!jsonResponse.tracks) {
                return []
            } else {
                console.log(jsonResponse.tracks.items);
                return jsonResponse.tracks.items.map(track => ({
                    id: track.id,
                    track: track.name,
                    artist: track.artists[0].name,
                    album: track.album.name,
                    uri: track.uri
                }
                ))
            }
        })
    },

    savePlaylist(playlistName, trackUris) {
        if (!playlistName && !trackUris) {
            return
        }

        let accessToken = this.getAccessToken();
        let headers = { 'Authorization': `Bearer ${accessToken}` };
        let userID = [];

        return fetch('https://api.spotify.com/v1/me', {
            headers: headers
        }).then(response => {
            return response.json();
        }).then(jsonResponse => {
            userID = jsonResponse.id
            fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({ name: playlistName })
            }).then(response => response.json())
                .then(jsonResponse => {
                    let playlistID = jsonResponse.id;
                    console.log(playlistID);
                    return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
                        headers: headers,
                        method: 'POST',
                        body: JSON.stringify({ uris: trackUris })
                    })
                })
            })

    }
}

export default Spotify