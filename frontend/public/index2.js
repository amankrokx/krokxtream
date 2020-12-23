let askinput, appendmsg, sendMessage, currentGroup = 'general'

window.onload = () => {
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
                    //playSong(song)
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