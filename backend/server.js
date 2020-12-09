const express = require('express')
const cors = require('cors');
const ytdl = require("ytdl-core")

const app = express();

app.use(cors());


var idGen = function(len) {
    return Math.floor(Math.random() * Math.floor('9'.repeat(len)));
}


let getAudioUrl = async(req, res) => {
    try {
        const isValid = ytdl.validateID(req.params.vinfo)
        console.log(isValid)
        if (!isValid) {
            return 'novideo'
        }

        const videoInfo = await ytdl.getInfo(url)
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
        res.error()
    }
}


app.get('/book', (req, res) => {
    // We will be coding here
    res.send(req.query)
});


const PORT = process.env.PORT || 4001
let server = app.listen(PORT, () => console.log(`Running on ${PORT}`))