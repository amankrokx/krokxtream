const express = require('express')
const cors = require('cors')
const ytdl = require("ytdl-core")
let yts = require('youtube-search-api');

const app = express()
    // Configure express plugins...
app.use(cors())


// Required functions...
// Random ID generatore of length
var idGen = function(len) {
    return Math.floor(Math.random() * Math.floor('9'.repeat(len)))
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