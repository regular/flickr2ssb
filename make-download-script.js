const pullJson = require('pull-json-doubleline') 
const file = require('pull-file')
const pull = require('pull-stream')

pull(
    file('info.dndjson'),
    pullJson.parse(),

    (function() {
      let i=0
      return pull.through( p =>{
        console.error(`${++i} ${p.title}`)
      })
    })(),

    pull.map( p => {
      const size = p.sizes.size.find( s=>s.label === 'Original' )
      const url = size.source
      return `curl ${url} > ${p.id}`
     }),

    pull.drain( s => {
      console.log(s)
    }, err => {
      if (err) console.error(err)
    })
)

