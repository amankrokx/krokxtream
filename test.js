let fetch = require('node-fetch')
let https = require('https')

let url_fast = 'https://firebasestorage.googleapis.com/v0/b/krokxtream.appspot.com/o/audio%2F2bMEe0UYa8E.webm?alt=media&token=4e150e16-de60-479c-a5b9-5dbbca36346a'
let url_slow = 'https://r1---sn-gwpa-pmge.googlevideo.com/videoplayback?expire=1622633112&ei=OBa3YJaWI_ie3LUP25SkuAw&ip=49.37.66.12&id=o-AMis6YoHHqYfgCZr29ccn7wD68h3DEJu3FaYsaflKPZt&itag=251&source=youtube&requiressl=yes&mh=5Q&mm=31%2C29&mn=sn-gwpa-pmge%2Csn-cvh76nez&ms=au%2Crdu&mv=m&mvi=1&pcm2cms=yes&pl=21&gcr=in&initcwndbps=187500&vprv=1&mime=audio%2Fwebm&ns=zMlqPZ5i3uVPfhFseEU4WJUF&gir=yes&clen=2788286&dur=161.681&lmt=1614422764358908&mt=1622611244&fvip=5&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5531432&n=GmxpJ8IQPAT2YagMzN&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cgcr%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpcm2cms%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRAIgGK5BNBB_F0V5t9Myf23mpNwS9oMSCsagzVti7wWV4qYCICo0Yw9-1QJo_RJ3d7tkvA29FNuwaljKKYzgU5qOMkTE&ratebypass=yes&sig=AOq0QJ8wRQIhAI0kKcFpoUhFWJ3qHS9DnZ9DVEmsSX77CVZajXuc5DoDAiA-ULNYOsIgHTwK-koQ1XqbWUV2HlA366dZTkxUsuD5rA%3D%3D'


fetch(url_fast).then((response)=> {
    console.time('fast')
    return response.blob()
}).then(blob => {
    console.timeEnd('fast')
})

fetch(url_slow).then((response)=> {
    console.log('slow')
    return response.blob()
}).then(blob => {
    console.timeEnd('slow')
})
/*
https.get(url, async res => {
  console.time('http download')
  var data = []
  for await (let c of res) data.push(c)
  let buffer = Buffer.concat(data)
  console.timeEnd('http download')
  console.log(buffer)

  const res1 = await fetch(url)
  console.time('fetch download')
  const buffer4 = await res1.buffer()
  console.timeEnd('fetch download')
})*/