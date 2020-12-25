let volumediv, progressBar, audioSrc, audio, playBtn, pauseBtn, toggleDiv

// All UI elements and transitions here
//Global variables
window.onload = () => {
    console.log('fron ui')
    let volumediv = document.querySelector('div.volume_abs')
    let progressBar = document.querySelector('div.progress')
    let audio = document.querySelector('#audio')
    let audioSrc = document.querySelector('source')
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
}
