const express = require('express')
const cors = require('cors')
const ytdl = require("ytdl-core")
let yts = require('youtube-search-api');
var firebase = require('firebase/app');
let proxy = require('express-http-proxy');

require("firebase/auth");
require("firebase/database");
const app = express()
// Configure express plugins...
app.use(cors())
 
app.use('/proxy', proxy(
    req => req.query.host,
    {
     https: true,
     proxyReqPathResolver: req => `${req.query.uri}&${process.env[`KEY_${req.query.provider.toUpperCase()}`]}`
    }))


let queue = [], playing, queuetimer
// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBgwn_AX22AqAPOzE-RlQv_TrsANbPLbgE",
    authDomain: "krokxtream.firebaseapp.com",
    databaseURL: "https://krokxtream-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "krokxtream",
    storageBucket: "krokxtream.appspot.com",
    messagingSenderId: "351247452806",
    appId: "1:351247452806:web:9cff31d9e54d000adc1f07"
  };

firebase.initializeApp(firebaseConfig)

let database = firebase.database();

database.ref('songs/general/history').orderByChild('status').startAt('queued').on('child_added', (data) => { 
    queue.push({key: data.key, value: data.val()})
    console.log(`added song ${data.val().title} to queue`)
    if(!playing) {
        console.log('starting queue init')
        runqueue()
    }
})

database.ref('command/general/client').on('child_changed', (data) => { 
    console.log(data.val())
    if((data.val() == 'pause') && playing) {
        console.log('a')
        queuetimer.pause()
    } else if ((data.val() == 'resume') && queue.length > 0 && !playing && queuetimer) {
        console.log('b')
        queuetimer.resume()
    } else if (data.val() == 'skip' && playing && queuetimer) {
        queuetimer.clear()
        console.log('next song skipped this')
        nextSong()
    }
})

let nextSong = () => {
    database.ref('songs/general/history/'+queue[0].key).update({
        'status': 'played'
    })
    console.log('set status of '+queue[0].key+ ' to played')

    queue.shift()
    if(queue.length > 0) {
        console.log('next song')
        runqueue()}
    else{
        console.log('list finished')
        playing = false
        database.ref('command/general').set({
            'play': 'end'
        }
    )}
}

let runqueue = () => {
    playing = true
    console.log('set playing to true and play command at '+queue[0].value.chatRef)
    database.ref('command/general').update({
        'play': queue[0].value.chatRef
    })
    console.log(queue[0].key)
    queuetimer = new Timer(() => {
        nextSong()
    }, queue[0].value.length * 1000)
}

// Required functions...
// Random ID generatore of length
var idGen = function(len) {
    return Math.floor(Math.random() * Math.floor('9'.repeat(len)))
}

var Timer = function(callback, delay) {
    var timerId, start, remaining = delay

    this.pause = function() {
        clearTimeout(timerId)
        remaining -= Date.now() - start
    }

    this.resume = function() {
        start = Date.now()
        clearTimeout(timerId)
        timerId = setTimeout(callback, remaining)
    };
    
    this.clear = function() {
        
        clearTimeout(timerId)
    }

    this.resume()

    
}


let getdata = async(viaID, param) => {
    return new Promise(async function(resolve, reject) {
        try {
            if(!viaID) {
                const isValid = ytdl.validateID(param)
                console.log(isValid)
                if (!isValid) {
                    res.json({ 'error': 'invalid_link' })
                    throw 'vidError'
                }
            }
    
            const videoInfo = await ytdl.getInfo('https://www.youtube.com/watch?v=' + param)
            let audioFormat = ytdl.chooseFormat(videoInfo.formats, {
                filter: "audioonly",
                quality: "highestaudio"
            });
            //console.log(videoInfo.videoDetails.media)
            resolve({
                'thumbnail': videoInfo.videoDetails.thumbnail,
                'title': videoInfo.videoDetails.title,
                'length': videoInfo.videoDetails.lengthSeconds,
                'videoId': videoInfo.videoDetails.videoId,
                'media': videoInfo.videoDetails.media,
                'likes': videoInfo.videoDetails.likes,
                'dislikes': videoInfo.videoDetails.dislikes,
                'videoUrl': videoInfo.videoDetails.video_url,
                'audioUrl': audioFormat.url
            })
        } catch (e) {
            console.log('error')
            reject(e)
        }
    });
  }

// Main function handle for API calls
app.get('/getAudioUrl', async(req, res) => {
    try {
        if (req.query.search && req.query.search.length > 0) {
            yts.GetListByKeyword(decodeURI(req.query.search)).then(data => {
                getdata(true, data.items[0].id).then(data => {
                    res.json(data)
                }).catch(error => {throw error})
            })
        } else if (req.query.vid) {
            getdata(false, req.query.vid).then(data => {
                res.json(data)
            }).catch(error => {throw error})
        } else {throw 'empty_params'}
        
    } catch (error) {
        console.log(error);
        res.error(403)
    }
})

// Dummy request API
app.get('/ping', (req, res) => {
    // We will be coding here
    res.send('pong')
})


const PORT = process.env.PORT || 4001
let server = app.listen(PORT, () => console.log(`Running on ${PORT}`))