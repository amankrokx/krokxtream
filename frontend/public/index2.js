let askinput, appendmsg, sendMessage, currentGroup = 'general',  progressBar, audioSrc, audio

window.onload = () => {
    console.log('fron index2')
    // Functon to ask input
    askinput = (message) => {
        let input = prompt(message)
        if (input.length > 0) return input
        else return askinput(message)
    }

    // Append messages globally
    appendmsg = (data, key, group) => {
        if (group == 'general') { // for few days
            let ref = document.querySelector('#rooms div.general div.chats')
            let photo = readFrom('users/'+data.from.uid+'/photoUrl')
            if(!photo) photo = './media/letters/'+data.from.name.slice(0,1).toUpperCase()+'.svg'
            if (data.song) {}
            else {
                ref.innerHTML += `<div class="message" id="${key}"><img src="${photo}"><span class="name" id="${data.from.uid}"> ${data.from.name.split(' ')[0]}</span> <br /><div class="data">${data.data}</div>
            </div>`
            }
            ref.scrollTop = ref.scrollHeight

        }
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
}

// Fetch song ID from query with rapidapi
let playQuery = (query) => {
    fetch('https://youtube-v31.p.rapidapi.com/search?q=' + encodeURI(query) + '&part=snippet%2Cid&maxResults=1', {
                "method": "GET",
                "headers": {
                    "x-rapidapi-key": "15be109401msh039dc334993a18cp1b9113jsn7f88dd5900bf",
                    "x-rapidapi-host": "youtube-v31.p.rapidapi.com"
                }
            }).then(res => {
                return res.json()
            }).then(r => {
                if (r.items.length > 0) {
                    fetch('https://krokxtream-api.herokuapp.com/getAudioUrl?vid=' + r.items[0].id.videoId)
                    .then(res => {
                        return res.json()
                    })
                    .then(song => {
                        writeTo(song, 'general', true)
                    })
                }
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