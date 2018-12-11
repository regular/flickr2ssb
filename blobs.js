const once = require('once')
const pullJson = require('pull-json-doubleline') 
const file = require('pull-file')
const pull = require('pull-stream')
const fetch = require('pull-fetch')
const paramap = require('pull-paramap')
const filesize = require('filesize')

const path = require('path')
const ssbClient = require('ssb-client')
const createConfig = require('ssb-config/inject')
const ssbKeys = require('ssb-keys')
const config = createConfig(process.env.ssb_appname)
const keys = ssbKeys.loadOrCreateSync(path.join(config.path, 'secret'))

ssbClient(keys, config, (err, ssb)=>{
  if (err) return console.error(err)
  getblobs(ssb)
})

function Transfer(ssb) {
    return function transfer(p, cb) {
      cb = once(cb)
      const size = p.sizes.size.find( s=>s.label === 'Original' )
      const url = size.source
      console.error(`${size.width}x${size.height} ${url}`)
      let bytes = 0
      pull(
        fetch(url, {body: false, timeout: 10000}),
        pull.asyncMap((resp, cb) => {
          pull(
            resp,
            pull.through( buff => {
              bytes += buff.byteLength
            }),
            ssb.blobs.add( (err, hash) =>{
              if (err) return cb(err)
              cb(null, {id: p.id, title: p.title, url, hash, bytes})
            })
          )
        }),
        pull.drain(p => cb(null, p), cb)
      )
    }
}

function getblobs(ssb) {
  pull(
    file('info.dndjson'),
    pullJson.parse(),
    //pull.take(10),
    paramap(Transfer(ssb), 15),

    (function() {
      let i=0
      return pull.through( p =>{
        console.error(`${++i} ${p.title} ${filesize(p.bytes)}`)
      })
    })(),

    pullJson.stringify(),

    pull.drain( s => {
      process.stdout.write(s)
    }, err => {
      if (err) console.error(err)
    })
  )
}

