let askinput, appendmsg, sendMessage, currentGroup = 'general',  progressBar, audioSrc, audio, hl, sl, appendQueue

window.onload = () => {
    console.log('fron index2')
    // Functon to ask input
    askinput = (message) => {
        let input = prompt(message)
        if (input.length > 0) return input
        else return askinput(message)
    }

    // Append messages globally
    let ref = document.querySelector('#rooms div.general div.chats')
    appendmsg = (data, key, group) => {
        if (group == 'general') { // for few days
            let photo = readFrom('users/'+data.from.uid+'/photoUrl')
            if(!photo) photo = './media/letters/'+data.from.name.slice(0,1).toUpperCase()+'.svg'
            if (data.song) {
                ref.innerHTML += `<div class="message" id="${key}"><img src="${photo}"><span class="name" id="${data.from.uid}"> ${data.from.name.split(' ')[0]}</span> <br /><div class="data noti">Added to Queue - <br /><center>${data.data.title}</center></div></div>`
                
            }
            else {
                ref.innerHTML += `<div class="message" id="${key}"><img src="${photo}"><span class="name" id="${data.from.uid}"> ${data.from.name.split(' ')[0]}</span> <br /><div class="data">${data.data}</div></div>`
            }
            ref.scrollTop = ref.scrollHeight

        }
    }

    let queueRef = document.querySelector('#playlist div.queue')
    appendQueue = (data, key) => {
        queueRef.innerHTML += `<div id="${key}"><div class="title">${data.title}</div><span>${data.length} s</span></div>`
    }

    // Listen for share-target-api
    const parsedUrl = new URL(window.location);
    // searchParams.get() will properly handle decoding the values.
    let linkShared
    if (parsedUrl.searchParams.get('name')) {
        linkShared = {
            used: false,
            url: parsedUrl.searchParams.get('description'),
            title: parsedUrl.searchParams.get('name')
        }
        if (myname) {
            if (!linkShared.used) {
                if (linkShared.url) sendMessage(linkShared.url)
                else if (linkShared.title) playQuery(linkShared.title)
                linkShared.used = true
            }
        }
    }

    sendMessage = async(query) => {
        if(!query) {
            query = document.querySelector('#reply input').value
            document.querySelector('#reply input').value = ''
            // Check for commands
            if (query.startsWith("!p ")) {
                playQuery(query.split('!p ')[1])
                return
            }
            else if (query.startsWith("!play ")) {
                playQuery(query.split('!play ')[1])
                return
            }
        }
        
        if (validURL(query)) {
            let id = await extractID(query)
            if (id && id[1].length > 0) {
                console.log(r[1])
                fetch('https://krokxtream-api.herokuapp.com/getAudioUrl?vid=' + r[1]).then(res => {
                    return res.json()
                }).then(song => {
                    writeTo(song, currentGroup, true)
                })
            } else {
                alert('Not valid Link !')
            }
        }
        else {
            // Thos is a message !
            writeTo(query, currentGroup, false)
        }
    }


    // All UI elements and transitions here
    progressBar = document.querySelector('div.progress')
    audio = document.querySelector('#audio')
    audioSrc = document.querySelector('source')
    let playBtn = document.querySelector('span.play')
    let pauseBtn = document.querySelector('span.pause')

    // Audio events
    audio.onplay = () => {
        playBtn.style.display = "none"
        pauseBtn.style.display = "inline-block"
    }

    audio.onpause = () => {
        pauseBtn.style.display = "none"
        playBtn.style.display = "inline-block"
    }

    // Transition Function
    let blurdiv = document.querySelector('#fullblur')
    toggleDiv = (what, hide) => {
        let div = document.querySelector(what.toString())
        if(hide || div.style.display !== 'none') {
            blurdiv.style.opacity = 0
            div.style.opacity = 0
            setTimeout(() => {
                blurdiv.style.display = 'none'
                div.style.display = 'none'
            }, 250)
        } else {
            div.style.display = 'block'
            blurdiv.style.display = 'block'
            setTimeout(() => {
                blurdiv.style.opacity = 1
                div.style.opacity = 1
            }, 10)
            
            div.focus()
        }
    }

    document.querySelector('#reply input').addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            document.querySelector("#reply span.reply").click();
        }
    });

    hl = () => {
        document.querySelector('#loader').style.display = "none"
    }
    sl = () => {
        document.querySelector('#loader').style.display = "none"
    }

    let updatePositionState = () => {
        if ('setPositionState' in navigator.mediaSession) {
            console.log('Updating position state...')
            navigator.mediaSession.setPositionState({
                duration: audio.duration,
                playbackRate: audio.playbackRate,
                position: audio.currentTime
            })
        }
    }

    // Play song
    playSong = (song, from) => {
        if(!song.artist) song.artist = null
        if(!song.album) song.album = null
        audioSrc = song.audioUrl
        document.querySelector('#player div div b span.title').innerHTML = song.title
        document.querySelector('#player div div span.artist').innerHTML = song.artist
        document.querySelector('#player div div span.addedby').innerHTML = from.name
        audio.load()
        if ('mediaSession' in navigator) {
            let albumart = []
            song.thumbnail.thumbnails.forEach(e => {
                albumart.push({
                    src: e.url,
                    sizes: e.height + 'x' + e.width,
                    type: 'image/jpeg'
                })
            });

            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.title,
                artist: song.artist,
                album: song.album,
                artwork: albumart
            });
            navigator.mediaSession.setActionHandler('play', function() {
                audio.play()
            });
            navigator.mediaSession.setActionHandler('pause', function() {
                audio.pause()
            });
            navigator.mediaSession.setActionHandler('previoustrack', function() {
                
            });
            navigator.mediaSession.setActionHandler('nexttrack', function() {
                
            });
            navigator.mediaSession.setActionHandler('seekbackward', function(event) {
                log('> User clicked "Seek Backward" icon.')
                const skipTime = event.seekOffset || 10
                audio.currentTime = Math.max(audio.currentTime - skipTime, 0)
                updatePositionState()
            })
            navigator.mediaSession.setActionHandler('seekforward', function(event) {
                log('> User clicked "Seek Forward" icon.')
                const skipTime = event.seekOffset || 10
                audio.currentTime = Math.min(audio.currentTime + skipTime, audio.duration)
                updatePositionState()
            })
            try {
                navigator.mediaSession.setActionHandler('seekto', function(event) {
                    log('> User clicked "Seek To" icon.')
                    if (event.fastSeek && ('fastSeek' in audio)) {
                        audio.fastSeek(event.seekTime)
                        return;
                    }
                    audio.currentTime = event.seekTime
                    updatePositionState()
                });
            } catch (error) {
                log('Warning! The "seekto" media session action is not supported.')
            }
        }
        audio.play()
        updatePositionState
    }
}

// Fetch song ID from query with rapidapi
let playQuery = (query) => {
    fetch('https://krokxtream-api.herokuapp.com/getAudioUrl?search=' + encodeURI(query))
                    .then(res => {
                        return res.json()
                    })
                    .then(song => {
                        writeTo(song, 'general', true)
                    })
}

// Validations and supporting functions
function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

function extractID(url) {
    return url.match(/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/)
}