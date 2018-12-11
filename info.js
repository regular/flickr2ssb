const flickrapi = require("flickrapi")
const auth = require('./auth.json')
auth.progress = false

const pullJson = require('pull-json-doubleline') 
const file = require('pull-file')
const pull = require('pull-stream')

flickrapi.authenticate(auth, getinfo) 

function getinfo(err, flickr) {
  if (err) return console.error(err.message)
  
  pull(
    file('photostream.dndjson'),
    pullJson.parse(),

    pull.asyncMap( (p, cb) => {
      flickr.photos.getSizes(Object.assign({}, auth, {
        photo_id: p.id,
        secret: p.secret,
        authenticated: true
      }), (err, result)=>{
        if (err) return cb(err)
        cb(null, Object.assign({},p,result))
      })
    }),

    pull.asyncMap( (p, cb) => {
      flickr.photos.getAllContexts(Object.assign({}, auth, {
        photo_id: p.id,
        secret: p.secret,
        authenticated: true
      }), (err, result)=>{
        if (err) return cb(err)
        cb(null, Object.assign({},p,result))
      })
    }),

    pull.asyncMap( (p, cb) => {
      flickr.photos.comments.getList(Object.assign({}, auth, {
        photo_id: p.id,
        secret: p.secret,
        authenticated: true
      }), (err, result)=>{
        if (err) return cb(err)
        cb(null, Object.assign({},p,result))
      })
    }),

    (function() {
      let i=0
      return pull.through( p =>{
          console.error(++i, p.datetaken, p.title)
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
