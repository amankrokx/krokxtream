const express = require('express')
const cors = require('cors')
const ytdl = require("ytdl-core")
let yts = require('youtube-search-api');
var firebase = require('firebase/app');
let fetch = require('node-fetch');
global.XMLHttpRequest = require("xhr2");

require("firebase/auth");
require("firebase/database");
require("firebase/storage");
const app = express()

// Configure express plugins...
app.use(cors())
 


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

var storageRef = firebase.storage().ref();



let getdata = async(viaID, param, name, uid) => {
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
            /*var stream = ytdl.downloadFromInfo(videoInfo, {
                filter: "audioonly",
                quality: 'highestaudio'
               })

               let arrayBuffer = await stream.arrayBuffer()
               let buffer = Uint8Array.from(arrayBuffer)*/


            let audioFormat = ytdl.chooseFormat(videoInfo.formats, {
                filter: "audioonly",
                quality: "highestaudio"
            });
            /*console.log(videoInfo.videoDetails)
            console.log(audioFormat)*/

            database.ref('audio/'+videoInfo.videoDetails.videoId).once('value').then((snapshot) => {
                 let v = snapshot.val()
                 console.log(v)
                 if(v && v.url) {
                     if(v.data) {
                        writeDb({
                            'thumbnail': v.data.thumbnail,
                             'title': v.data.title,
                             'videoUrl': v.data.video_url,
                             'length': v.data.length,
                             'videoId': v.data.videoId,
                             'media': v.data.media,
                             'likes': v.data.likes,
                             'dislikes': v.data.dislikes,
                             'audioUrl': v.url
                        }, name, uid)
                        resolve()
                         /*resolve({
                             'thumbnail': v.data.thumbnail,
                             'title': v.data.title,
                             'videoUrl': v.data.video_url,
                             'length': v.data.length,
                             'videoId': v.data.videoId,
                             'media': v.data.media,
                             'likes': v.data.likes,
                             'dislikes': v.data.dislikes,
                             'audioUrl': v.url
                         });*/

                     } else {
                        writeDb({
                            'thumbnail': videoInfo.videoDetails.thumbnails,
                            'title': videoInfo.videoDetails.title,
                            'length': videoInfo.videoDetails.lengthSeconds,
                            'videoId': videoInfo.videoDetails.videoId,
                            'media': videoInfo.videoDetails.media,
                            'likes': videoInfo.videoDetails.likes,
                            'dislikes': videoInfo.videoDetails.dislikes,
                            'videoUrl': videoInfo.videoDetails.video_url,
                            'audioUrl': v.url
                        }, name, uid)
                        resolve()
                         /*resolve({
                             'thumbnail': videoInfo.videoDetails.thumbnails,
                             'title': videoInfo.videoDetails.title,
                             'length': videoInfo.videoDetails.lengthSeconds,
                             'videoId': videoInfo.videoDetails.videoId,
                             'media': videoInfo.videoDetails.media,
                             'likes': videoInfo.videoDetails.likes,
                             'dislikes': videoInfo.videoDetails.dislikes,
                             'videoUrl': videoInfo.videoDetails.video_url,
                             'audioUrl': v.url
                         });*/
                     }
                    return
                 } else {
                    
                    database.ref('command/sta').update({
                        'loadingState': 'true',
                        'loading': 0
                    })
                    
                    fetch(audioFormat.url).then((response)=> {

                        response.arrayBuffer().then((arrayBuffer) => {
                            var metadata = {
                                contentType: 'audio/webm',
                            };

                            var uploadTask = storageRef.child('audio/'+videoInfo.videoDetails.videoId+'.webm').put(arrayBuffer, metadata);
                            
                            // Register three observers:
                            // 1. 'state_changed' observer, called any time the state changes
                            // 2. Error observer, called on failure
                            // 3. Completion observer, called on successful completion
                            uploadTask.on('state_changed', (snapshot) => {
                                // Observe state change events such as progress, pause, and resume
                                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                console.log('Upload is ' + progress + '% done');
                                database.ref('command/sta').update({
                                    'loadingState': 'true',
                                    'loading': parseInt(progress).toString()
                                })
                                /*switch (snapshot.state) {
                                case firebase.storage.TaskState.PAUSED: // or 'paused'
                                    console.log('Upload is paused');
                                    break;
                                case firebase.storage.TaskState.RUNNING: // or 'running'
                                    console.log('Upload is running');
                                    break;
                                }*/
                                }, (error) => {
                                    // Handle unsuccessful uploads
                                    console.log(error)
                                    writeDb({
                                        'thumbnail': videoInfo.videoDetails.thumbnails,
                                        'title': videoInfo.videoDetails.title,
                                        'length': videoInfo.videoDetails.lengthSeconds,
                                        'videoId': videoInfo.videoDetails.videoId,
                                        'media': videoInfo.videoDetails.media,
                                        'likes': videoInfo.videoDetails.likes,
                                        'dislikes': videoInfo.videoDetails.dislikes,
                                        'videoUrl': videoInfo.videoDetails.video_url,
                                        'audioUrl': audioFormat.url
                                    }, name, uid)
                                    resolve()
                                    /*resolve({
                                        'thumbnail': videoInfo.videoDetails.thumbnails,
                                        'title': videoInfo.videoDetails.title,
                                        'length': videoInfo.videoDetails.lengthSeconds,
                                        'videoId': videoInfo.videoDetails.videoId,
                                        'media': videoInfo.videoDetails.media,
                                        'likes': videoInfo.videoDetails.likes,
                                        'dislikes': videoInfo.videoDetails.dislikes,
                                        'videoUrl': videoInfo.videoDetails.video_url,
                                        'audioUrl': audioFormat.url
                                    })*/
                                }, () => {
                                    // Handle successful uploads on complete
                                    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                                    uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                                        console.log('File available at', downloadURL)
                                        database.ref('command/sta').update({
                                            'loadingState': 'false'
                                        })
                                        
                                        database.ref('audio/'+videoInfo.videoDetails.videoId).set({
                                            'url': downloadURL,
                                            'data': {
                                                'thumbnail': videoInfo.videoDetails.thumbnails,
                                                'title': videoInfo.videoDetails.title,
                                                'length': videoInfo.videoDetails.lengthSeconds,
                                                'videoId': videoInfo.videoDetails.videoId,
                                                'media': videoInfo.videoDetails.media,
                                                'likes': videoInfo.videoDetails.likes,
                                                'dislikes': videoInfo.videoDetails.dislikes,
                                                'videoUrl': videoInfo.videoDetails.video_url,
                                            }
                                        })
                                        writeDb({
                                            'thumbnail': videoInfo.videoDetails.thumbnails,
                                            'title': videoInfo.videoDetails.title,
                                            'length': videoInfo.videoDetails.lengthSeconds,
                                            'videoId': videoInfo.videoDetails.videoId,
                                            'media': videoInfo.videoDetails.media,
                                            'likes': videoInfo.videoDetails.likes,
                                            'dislikes': videoInfo.videoDetails.dislikes,
                                            'videoUrl': videoInfo.videoDetails.video_url,
                                            'audioUrl': downloadURL
                                        }, name, uid)
                                        resolve()
                                        /*resolve({
                                            'thumbnail': videoInfo.videoDetails.thumbnails,
                                            'title': videoInfo.videoDetails.title,
                                            'length': videoInfo.videoDetails.lengthSeconds,
                                            'videoId': videoInfo.videoDetails.videoId,
                                            'media': videoInfo.videoDetails.media,
                                            'likes': videoInfo.videoDetails.likes,
                                            'dislikes': videoInfo.videoDetails.dislikes,
                                            'videoUrl': videoInfo.videoDetails.video_url,
                                            'audioUrl': downloadURL
                                        })*/
                                    });
                                }
                            );
                        })
                    }).catch((er) => {
                        console.log(er)
                        writeDb({
                            'thumbnail': videoInfo.videoDetails.thumbnails,
                            'title': videoInfo.videoDetails.title,
                            'length': videoInfo.videoDetails.lengthSeconds,
                            'videoId': videoInfo.videoDetails.videoId,
                            'media': videoInfo.videoDetails.media,
                            'likes': videoInfo.videoDetails.likes,
                            'dislikes': videoInfo.videoDetails.dislikes,
                            'videoUrl': videoInfo.videoDetails.video_url,
                            'audioUrl': audioFormat.url
                        }, name, uid)
                        resolve()
                        /*resolve({
                            'thumbnail': videoInfo.videoDetails.thumbnails,
                            'title': videoInfo.videoDetails.title,
                            'length': videoInfo.videoDetails.lengthSeconds,
                            'videoId': videoInfo.videoDetails.videoId,
                            'media': videoInfo.videoDetails.media,
                            'likes': videoInfo.videoDetails.likes,
                            'dislikes': videoInfo.videoDetails.dislikes,
                            'videoUrl': videoInfo.videoDetails.video_url,
                            'audioUrl': audioFormat.url
                        })*/
                    })   
                      
                 }
              })

        } catch (e) {
            console.log('error')
            reject(e)
        }
    });
  }

let writeDb = (data, name, uid) => {
    let key = database.ref('songs/general/history').push().key
    let timestamp = new Date().toString()
    // Sanatize undefined values
    let media = JSON.parse(JSON.stringify({
        title: data.title,
        videoId: data.videoId,
        artist: data.media.artist,
        album: data.media.album,
        thumbnail: data.thumbnail,
        length: data.length,
        audioUrl: data.audioUrl
    }, function(k, v) {
        if (v === undefined) { return null; }
        return v;
        }))
    // History will contain title, length and videoId plus the dynamic properties like status and current playing etc.
    database.ref('songs/general/history').push().set({
        title: data.title,
        length: data.length,
        videoId: data.videoId,
        chatRef: key,
        status: 'queued',
        from: { uid: uid, name: name },
        time: timestamp
    })
    // Write to chat too
    database.ref('chats/general/'+key).set({
        data: media,
        from: { uid: uid, name: name },
        song: true,
        time: timestamp
    })
}


// Main function handle for API calls
app.get('/getAudioUrl', async(req, res) => {
    try {
        if (req.query.search && req.query.search.length > 0) {
            yts.GetListByKeyword(decodeURI(req.query.search)).then(data => {
                getdata(true, data.items[0].id, req.query.name, req.query.uid).then(data => {
                    res.end('201')
                    //res.json(data)
                }).catch(error => {throw error})
            })
        } else if (req.query.vid) {
            getdata(false, req.query.vid, req.query.name, req.query.uid).then(data => {
                res.end('201')
                //res.json(data)
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