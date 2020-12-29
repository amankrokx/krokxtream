let me, queue

// Firebase Database
var database = firebase.database();

// Check Auth Before Proceeding
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in.
        console.log(user)
        me = user
        let udata = readFrom('users/'+user.uid)
        if (!user.displayName) {
            let name = askinput('Please provide your Name .')
            let u = firebase.auth().currentUser;
            
            u.updateProfile({
                displayName: name,
            }).then(function() {
                firebase.database().ref('users/' + user.uid).set({displayName: name})
                // Update successful.
                document.querySelector('#settings span.name').innerHTML = user.displayName
                alert('Name Updated !')
            }).catch(function(error) {
                alert('could not update name')
            });
        } else document.querySelector('#settings span.name').innerHTML = user.displayName
        
        if(!user.photoURL) {
            var u = firebase.auth().currentUser;
            let path = './media/letters/'+user.displayName.slice(0,1).toUpperCase()+'.svg'
            console.log(path)
            u.updateProfile({
                photoURL: path,
            }).then(function() {
                // Update successful.
                firebase.database().ref('users/' + user.uid).set({photoURL: path})
                document.querySelector('#settings img').src = path
                console.log('photo updated')
            }).catch(function(error) {
                alert('could not update photo')
            });
        } else document.querySelector('#settings img').src = user.photoURL
        
        if (!udata) {
            let tempdata = JSON.parse(JSON.stringify({
                uid: user.uid,
                name: user.displayName,
                photoURL: user.photoURL,
                emamil: user.emamil,
                phone: user.phoneNumber
            }, function(k, v) {
                if (v === undefined) { return null; }
                return v;
             }))

             firebase.database().ref('users/' + user.uid).set(tempdata).catch(error => {
                console.log(error.message)
            });
        }
    } else {
        // User is signed out.
        console.log('not logged')
            //tell user to login
        window.location = './login.html'
    }
    hl()
});


// Write chats to DB
// Write temprorary data and heavy data here, these message wont be persistant for much longer period.
// Do not add audioUrl to history. History will be persistant for much longer time.
// Lets make it unified and complex .
let writeTo = (data, group, music) => {
    if (!group) group = 'general'
    let timestamp = new Date().toString()

    if(music) {
        // Grab key of corrosponding Chat entry
        let key = database.ref('songs/'+group+'/history').push().key

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
        database.ref('songs/'+group+'/history').push().set({
            title: data.title,
            length: data.length,
            videoId: data.videoId,
            chatRef: key,
            status: 'queued',
            from: { uid: me.uid, name: me.displayName },
            time: timestamp
        })
        // Write to chat too
        database.ref('chats/'+group+'/'+key).set({
            data: media,
            from: { uid: me.uid, name: me.displayName },
            song: true,
            time: timestamp
        })
    } else {
        database.ref('chats/'+group).push().set({
            data: data,
            from: { uid: me.uid, name: me.displayName },
            time: timestamp,
            /*likes: {
                mvSeyyDuBaeIm637uRUW8AECeEH3: "heart"
            }*/
        })
    }
}

let writeCustom = (data) => {
    database.ref('command/general').update({client: data})
}

let readFromAsync = async(path) => {
    return new Promise(async function(resolve, reject) {
        database.ref(path).once('value').then((snapshot) => {
            resolve(snapshot.val())
          })
    })
}

let readFrom = (path) => {
    database.ref(path).once('value').then((snapshot) => {
        return snapshot.val()
      })
}

// Listen for chats in DB

database.ref('chats/general').limitToLast(21).on('child_added', (data) => {
    let chunk = data.val()
    appendmsg(chunk, data.key, 'general')
})

// Lets capture history to get songs

database.ref('songs/general/history').orderByChild('status').startAt('queued').on('child_added', (data) => {
    let chunk = data.val()
    appendQueue(chunk, data.key)
})

database.ref('command/general/').on('value', async(data) => {
    let r = data.val()
    console.log(r)
    if (r.play != 'end') {
        readFromAsync('chats/general/'+r.play).then(song => {
            console.log(song)
        playSong(song.data, song.from)
        })
        

    }
})

function signout() {
    firebase.auth().signOut()
}
