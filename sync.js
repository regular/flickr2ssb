const Flickr = require("flickrapi")
const flickrOptions = require('./auth.json')
Flickr.authenticate(flickrOptions, Flickr.downsync("userdata/me", true));
