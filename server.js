var express = require('express');
var app = express();
var port = 3000;

var twitterKeys = require('./keys.js');
var dictionaryKey = require('./dictionary_apikey.js')


var twitter = require('twit');
var twit = new twitter({
  consumer_key: twitterKeys.TWITTER_CONSUMER_KEY,
  consumer_secret: twitterKeys.TWITTER_CONSUMER_SECRET,
  access_token: twitterKeys.TWITTER_ACCESS_TOKEN,
  access_token_secret: twitterKeys.TWITTER_ACCESS_TOKEN_SECRET
});

app.get('/*', function(req, res){
  res.send('Up & Running');
});

var server = app.listen(port, function(){
  console.log('Listening on port ' + port);
  qualifyPassword('tomatoze')
});

var getMentions = function(){
  var stream = twit.stream('user');

  stream.on('tweet', function (tweet) {
    console.log(tweet)
    var text = tweet.text.split(' ');
    var screenName = tweet.user.screen_name;

    console.log('I just received a message from ' + screenName);
    console.log('msg: ' + text);
    qualifyPassword(text)

  });
};

var request = require('request');
var parser = require('xml2json');

var qualifyPassword = function (password) {
  console.log(password)
  request(`http://www.dictionaryapi.com/api/v1/references/collegiate/xml/${password}?key=${dictionaryKey}`, 
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var json = parser.toJson(body)
        var parsed = JSON.parse(json)
        console.log(parsed.entry_list)
        console.log(parsed.entry_list.entry[0].id)
        console.log(parsed.entry_list.entry[0].id === password)
      }
    }
  )
}




getMentions()
setInterval(function(){
  getMentions();
}, 85000);