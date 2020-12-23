// All UI elements and transitions here
//Global variables
let volumediv, progressBar, audioSrc, audio, playBtn, pauseBtn, toggleDiv

window.onload = () => {
    volumediv = document.querySelector('div.volume_abs')
    progressBar = document.querySelector('div.progress')
    audio = document.querySelector('#audio')
    audioSrc = document.querySelector('source')
    playBtn = document.querySelector('span.play')
    pauseBtn = document.querySelector('span.pause')

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
