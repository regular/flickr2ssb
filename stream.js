const flickrapi = require("flickrapi")
const auth = require('./auth.json')
auth.progress = false
flickrapi.authenticate(auth, getpage) 

function getpage(err, flickr, page) {
  if (err) return console.error(err.message)
  if (!page) page = 1
  flickr.people.getPhotos(Object.assign({}, auth, {
    authenticated: true,
    page,
    per_page: 500,
    extras: 'description,license,date_upload,date_taken,original_format,geo,tags,machine_tags,o_dims,views,media,url_o'
  }), (err, result) => {
    if (err) return console.error(err.message)
    console.error(`${result.photos.page}/${result.photos.pages}`)
    const photos = result.photos.photo
    photos.forEach( p=>process.stdout.write('\n\n'+JSON.stringify(p)) )

    if (page < result.photos.pages) {
      getpage(null, flickr, page + 1)
    }
  })
}
