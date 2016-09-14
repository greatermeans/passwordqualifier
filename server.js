var express = require('express');
var app = express();
var port = 3000;

var keys = require('./keys.js');

var twitter = require('twit');
var twit = new twitter({
  consumer_key: keys.TWITTER_CONSUMER_KEY,
  consumer_secret: keys.TWITTER_CONSUMER_SECRET,
  access_token: keys.TWITTER_ACCESS_TOKEN,
  access_token_secret: keys.TWITTER_ACCESS_TOKEN_SECRET
});

app.get('/*', function(req, res){
  res.send('Up & Running');
});

var server = app.listen(port, function(){
  console.log('Listening on port ' + port);
});

var getMentions = function(){
  var stream = twit.stream('user');

  stream.on('tweet', function (tweet) {
    console.log(tweet)
    var text = tweet.text.split(' ');
    var screenName = tweet.user.screen_name;

    console.log('I just received a message from ' + screenName);
    console.log('msg: ' + text);
  });
};



getMentions()
setInterval(function(){
  getMentions();
}, 85000);