// require neccessary modules
const express = require("express")
const app = express()
const ytdl = require("ytdl-core")
    //const https = require('https');
const { json } = require("express");


app.use(express.static('public'))
app.use(express.json());

var idGen = function(len) {
        return Math.floor(Math.random() * Math.floor('9'.repeat(len)));
    }
    // variables
let song = [ //{ 'vid': 'f1qz8vn3XbY', 'state': true, 'started': null, 'vdetails': null, 'url': '' }
]

let clients = { // 'idisrandomatstart': { 'ws': 'somews', 'id': 'someid' } 
}

let downloads = [ // id: url
]

let download = async(req, res) => {
    let url = downloads[req.query.id]
    var request = https.get(url, function(response) {
        response.pipe(res);
        response.on('end', res.end())
    });

    request.end()
}

let getAudioUrl = async(url) => {

    try {
        const isValid = ytdl.validateID(url)

        if (!isValid) {
            return 'novideo'
        }

        const videoInfo = await ytdl.getInfo(url)
        let audioFormat = ytdl.chooseFormat(videoInfo.formats, {
            filter: "audioonly",
            quality: "highestaudio"
        });
        //console.log(videoInfo.videoDetails.media)
        return {
            'thumbnail': videoInfo.videoDetails.thumbnail,
            'title': videoInfo.videoDetails.title,
            'length': videoInfo.videoDetails.lengthSeconds,
            'videoId': videoInfo.videoDetails.videoId,
            'media': videoInfo.videoDetails.media,
            'likes': videoInfo.videoDetails.likes,
            'dislikes': videoInfo.videoDetails.dislikes,
            'videoUrl': videoInfo.videoDetails.video_url,
            'audioUrl': audioFormat.url
        }
    } catch (error) {
        console.log(error);
        return null
    }
}


const PORT = process.env.PORT || 4000
let server = app.listen(PORT, () => console.log(`Running on ${PORT}`))

let broadcastWS = (data) => {

    Object.keys(clients).forEach(e => {
        if (clients[e].ws) {
            try {
                clients[e].ws.send(data)
            } catch (f) {
                console.error(f)
                clients[e].ws = null
            }
        }
    })

}

// Websocet
const wss = new websocket.Server({ server: server });

wss.on('connection', function(ws, request, client) {

    //console.log(ws);
    ws.on('message', function incoming(data) {
        if (data == '__ping__') {
            ws.send('__pong__')
            return
        }
        console.log(data);
        try { data = JSON.parse(data); } catch (e) { console.error('ws data not a valid json string', e); }
        switch (data.type) {
            case 'auth':
                if (data.name) {
                    if (data.id) {
                        if (clients[data.name] && clients[data.name].id == data.id) {
                            // User welcome back
                            //console.log('User welcome back')
                            clients[data.name].ws = ws
                            ws.send(JSON.stringify({ 'type': 'auth', 'from': 'serveramankrokx', 'action': 'welcomeback' }))
                        } else {
                            //console.log('No client registered ')
                            let id = idGen(8)
                            clients[data.name] = { 'ws': ws, 'id': id }
                            ws.send(JSON.stringify({ 'type': 'auth', 'from': 'serveramankrokx', 'name': data.name, 'action': 'welcomenew', 'id': id }))
                        }
                    } else if (!clients[data.name]) {
                        // No client registered 
                        //console.log('No client registered ')
                        let id = idGen(8)
                        clients[data.name] = { 'ws': ws, 'id': id }
                        ws.send(JSON.stringify({ 'type': 'auth', 'from': 'serveramankrokx', 'name': data.name, 'action': 'welcomenew', 'id': id }))
                    } else {
                        // name duplicate name or device
                        console.log('duplicate ')
                        let name = data.name + idGen(4)
                        let id = idGen(8)
                        clients[name] = { 'ws': ws, 'id': id }
                        ws.send(JSON.stringify({ 'type': 'auth', 'from': 'serveramankrokx', 'action': 'welcomename', 'name': name, 'id': id }))
                    }
                }
                break;
            case 'queryUrl':
                let videoId = ytdl.getURLVideoID(data.queryUrl)
                getAudioUrl(videoId).then(result => {
                        if (result && result !== 'novideo') {
                            broadcastWS(JSON.stringify({ 'type': 'play', 'song': result }))
                        }
                    })
                    //broadcastWS(JSON.stringify({ 'type': 'chat', 'from': 'serveramankrokx', 'action': 'songAdded', 'title': result.title, 'by': data.from }))
                break;

            case 'chat':
                broadcastWS(JSON.stringify({ 'type': 'chat', 'message': data.message, 'from': data.from }))
                break;


            case 'statusUpdate':
                if (song.length > 0) {
                    ws.send(JSON.stringify({ 'type': 'statusupdate', 'fomr': 'serveramankrokx', 'empty': false, 'songdetails': song[0] }))
                } else { ws.send(JSON.stringify({ 'type': 'statusupdate', 'fomr': 'serveramankrokx', 'empty': true })) }
                break;

            case 'download':
                let newid = idGen(10)
                downloads[newid] = data.url
                ws.send(JSON.stringify({ 'type': 'download', 'id': newid, 'title': data.title }))
                break;

            default:
                break;
        }
    });

})

wss.on('close', function close() {

});


// Routes
//app.get("/stream/:videoId", getAudioStream)
//getAudioUrl('f1qz8vn3XbY').then(e => {
//    console.log(e)
//})

app.get('/download', download)