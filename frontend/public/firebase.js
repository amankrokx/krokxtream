let me
    // Check Auth Before Proceeding
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in.
        console.log(user)
        me = user
        if (!user.displayName) {
            let name = askPrompt('Please provide your Name .')
            var u = firebase.auth().currentUser;

            u.updateProfile({
                displayName: name,
            }).then(function() {
                // Update successful.
                document.querySelector('div.profile span.name').innerHTML = user.displayName
                alert('Name Updated !')
            }).catch(function(error) {
                alert('could not update name')
            });
        }

        if (user.photoURL) document.querySelector('div.profile img').src = user.photoURL
        else document.querySelector('div.profile img').src = './media/profile.jpg'
        document.querySelector('div.profile span.name').innerHTML = user.displayName
    } else {
        // User is signed out.
        console.log('not logged')
            //tell user to login
        window.location = './login.html'
    }
    hl()
});

// Firebase Database
var database = firebase.database();

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

let readFrom = (path) => {
    database.ref(path).once('value').then((snapshot) => {
        return snapshot.val()
      })
}


// Listen for chats in DB

database.ref('chats/general').limitToLast(21).on('child_added', (data) => {
    let chunk = data.val()
    appendmsg(chunk, data.key)
})

// Lets capture history to get songs
database.ref('songs/general/history').orderByChild('status').startAt('true').on('child_added', (data) => {
    let chunk = data.val()
    console.log([chunk, data.key])
})

function signout() {
    firebase.auth().signOut()
}

let askPrompt = (msg) => {
    let n = prompt(msg)
    if (n.length > 0) return n
    return askPrompt(msg)
}