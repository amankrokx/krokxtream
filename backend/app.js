const express = require('express')
const cors = require('cors')
const ytdl = require("ytdl-core")

const app = express()
    // Configure express plugins...
app.use(cors())


// Required functions...
// Random ID generatore of length
var idGen = function(len) {
    return Math.floor(Math.random() * Math.floor('9'.repeat(len)))
}

// Main function handle for API calls
app.get('/getAudioUrl', async(req, res) => {
    try {
        console.log(req.query.vid)
        const isValid = ytdl.validateID(req.query.vid)
        console.log(isValid)
        if (!isValid) {
            res.json({ 'error': 'invalid_link' })
            return
        }

        const videoInfo = await ytdl.getInfo('https://www.youtube.com/watch?v=' + req.query.vid)
        let audioFormat = ytdl.chooseFormat(videoInfo.formats, {
            filter: "audioonly",
            quality: "highestaudio"
        });
        //console.log(videoInfo.videoDetails.media)
        res.json({
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