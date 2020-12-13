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
let writeTo = (message, group, music) => {
    if (!group) group = 'general'
    let timestamp = new Date().toString()
    database.ref('chats/'+group).push().set({
        data: message,
        from: { uid: me.uid, name: me.displayName },
        time: timestamp,
        likes: {
            /*mvSeyyDuBaeIm637uRUW8AECeEH3: "heart"*/
        },
        song: music
    })
}

let addQueue = (song, group) => {
    console.log(song)
    if (!group) group = 'general'
    database.ref('songs/'+group+'/history').push().set(song)
}

// Listen for chats in DB

database.ref('chats/general').orderByChild('time').limitToLast(10).on('child_added', (data) => {
    appendmsg(data.val(), data.key)
});

database.ref('songs/general/history').orderByChild('time').limitToLast(1).on('child_added', (data) => {
    if (data.val().current) playSong(data.val())
});

function signout() {
    firebase.auth().signOut()
}

let askPrompt = (msg) => {
    let n = prompt(msg)
    if (n.length > 0) return n
    return askPrompt(msg)
}