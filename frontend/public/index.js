// Super Global variables
let play, pause, myname, playQuery, lastSong, hl, sl, appendmsg, playSong
window.onload = () => {
    // Loader is the fitrst thing to work
    const tl = document.getElementById('loader')

    // Now DOM elements
    const msgContainer = document.querySelector('div.general div.msgs')
    var link = document.createElement("a");


    sl = () => {
        tl.classList.remove('hidden')
    }

    hl = () => {
        tl.classList.add('hidden')
    }

    // Global variables...
    const audio = document.querySelector('audio')
    const playbtn = document.querySelector('#player span.play')
    const pausebtn = document.querySelector('#player span.pause')


    // Code to handle install prompt on desktop

    let deferredPrompt
    const addBtn = document.querySelector('.add-button')
        //addBtn.style.display = 'none';

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI to notify the user they can add to home screen
        addBtn.style.display = 'block';

        addBtn.addEventListener('click', (e) => {
            // Show the prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    // hide our user interface that shows our A2HS button
                    addBtn.style.display = 'none';
                    console.log('User accepted the A2HS prompt');
                } else {
                    console.log('User dismissed the A2HS prompt');
                }
                deferredPrompt = null;
            });
        });
    })

    // Prevent accidental close on back press
    window.history.pushState({}, '');

    window.addEventListener('popstate', () => {
        //TODO: Optionally show a "Press back again to exit" tooltip
        setTimeout(() => {
            window.history.pushState({}, '');
            //TODO: Optionally hide tooltip
        }, 1500);
    });

    // Online offline trigger
    /*
    let offlineBanner = document.querySelector('.offlineBanner')
    window.addEventListener('online', () => {
        offlineBanner.style.display = 'none'
    });
    window.addEventListener('offline', () => {
        offlineBanner.style.display = 'block'
    });
    */

    document.querySelector('.general').scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "center"
    })

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
                if (linkShared.url) playQuery(linkShared.url)
                else if (linkShared.title) playQuery('!p ' + linkShared.title)
                linkShared.used = true
            }
        }
    }

    // Wave.js
    /*let wave = new Wave();
    wave.fromElement("audio","output", {type:"bars"});*/


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

    audio.onplaying = () => {
        playbtn.style.display = 'none'
        pausebtn.style.display = 'inline-block'
        updatePositionState()
    }

    playSong = (song) => {
        if(!song.artist) song.artist = null
        if(!song.album) song.album = null
        document.querySelector('source').src = song.audioUrl
        document.querySelector('#player div span.title').innerHTML = song.title
        document.querySelector('#player div span.author').innerHTML = song.artist
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
            navigator.mediaSession.setActionHandler('play', play);
            navigator.mediaSession.setActionHandler('pause', pause);
            navigator.mediaSession.setActionHandler('previoustrack', function() {
                playQuery('PLay Previous Track')
            });
            navigator.mediaSession.setActionHandler('nexttrack', function() {
                playQuery('PLay Next Track')
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
        play()
    }


    /*
    case 'play':
        msgContainer.innerHTML += `<span class="commands"><b>Playing Song :</b><p style="text-align: center;"><i>${data.song.title}</i></p></span>`
        lastSong = { 'url': data.song.audioUrl, 'title': data.song.title }
        playSong(data.song)
        break;

    case 'chat':
        if (data.message.length > 0) {
            if (data.from == myname) msgContainer.innerHTML += `<span class="mine chat">${data.message}</span>`
            else msgContainer.innerHTML += `<span class="chat">${data.message}</span>`
            msgContainer.scrollTop = msgContainer.scrollHeight

        }
        break
    */
    // Controls
    play = () => {
        audio.play()
        playbtn.style.display = 'none'
        pausebtn.style.display = 'inline-block'
    }
    pause = () => {
        audio.pause()
        pausebtn.style.display = 'none'
        playbtn.style.display = 'inline-block'
    }

    audio.onended = () => {
        pausebtn.style.display = 'none'
        playbtn.style.display = 'inline-block'
    }

    document.querySelector('#player input.volume').onpointermove = (e) => {
        audio.volume = document.querySelector('#player input.volume').value / 10;
    }

    document.querySelector('div.reply input').addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            document.querySelector("div.reply span.send").click();
        }
    });

    playQuery = async(query) => {
        if (validURL(query)) {
            let r = await extractID(query)
            if (r && r[1].length > 0) {
                document.querySelector('div.reply input').value = ''
                console.log(r[1])
                fetch('https://krokxtream-api.herokuapp.com/getAudioUrl?vid=' + r[1]).then(res => {
                    return res.json()
                }).then(song => {
                    playSong(song)
                })
            } else {
                alert('Not valid Link !')
                document.querySelector('div.reply input').value = ''
            }

        } else if (query.startsWith("!p ")) {
            fetch('https://youtube-v31.p.rapidapi.com/search?q=' + encodeURI(query.slice(3)) + '&part=snippet%2Cid&maxResults=1', {
                "method": "GET",
                "headers": {
                    "x-rapidapi-key": "15be109401msh039dc334993a18cp1b9113jsn7f88dd5900bf",
                    "x-rapidapi-host": "youtube-v31.p.rapidapi.com"
                }
            }).then(res => {
                return res.json()
            }).then(r => {
                console.log(r)
                if (r.items.length > 0) {
                    fetch('https://krokxtream-api.herokuapp.com/getAudioUrl?vid=' + r.items[0].id.videoId).then(res => {
                        return res.json()
                    }).then(song => {
                        let timestamp = new Date().toString()
                        writeTo(song, 'general', true)
                        //playSong(song)
                    })
                    document.querySelector('div.reply input').value = ''
                }
            })

        } else {
            writeTo(query.toString(), 'general', false)
            document.querySelector('div.reply input').value = ''
        }
    }

    document.querySelector('div.reply span.send').onclick = () => {
        playQuery(document.querySelector('div.reply input').value)
    }

    document.querySelector('header span:last-of-type').onclick = () => {
        document.querySelector('nav').style.right = 0
        document.getElementById('navsupport').style.display = 'block'
    }

    document.getElementById('navsupport').onmouseenter = () => {
        document.querySelector('nav').style.right = '-230px'
        document.getElementById('navsupport').style.display = 'none'
    }

    document.querySelector('div.themes').onclick = () => {
        document.querySelector('div.themes div.drop').classList.toggle('hidden')
    }

    appendmsg = (msg, key) => {
        if(msg.song) {msgContainer.innerHTML += `<span class="commands"><b>Playing Song :</b><p style="text-align: center;"><i>${msg.data.title}</i></p></span>`}
        else {
            if (msg.from.uid == me.uid) msgContainer.innerHTML += `<span id="${key}" class="mine chat">${msg.data}</span>`
            else msgContainer.innerHTML += `<span id="${key}" class="chat">${msg.data}</span>`
        }
        msgContainer.scrollTop = msgContainer.scrollHeight
    }
}