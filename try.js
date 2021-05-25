let https = require('https')
let fetch = require('node-fetch')

async function f() {
    let response = await fetch('https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_1MG.mp3')
    let arrayBuffer = await response.arrayBuffer()
    let bufer = await Buffer.from(arrayBuffer)

    
}

f()
