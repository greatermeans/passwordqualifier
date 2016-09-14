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
  qualifyPassword('123hello123 rob123 123apple')
});

var getMentions = function(){
  var stream = twit.stream('user');

  stream.on('tweet', function (tweet) {

    var textItems = tweet.text.split(' ');
    var screenName = tweet.user.screen_name;

    var password = RemoveUserName(textItems)
    console.log(password)
    qualifyPassword(password)

  });
};

var RemoveUserName = function (textItems) {
  textItems.shift()
  return textItems.join(' ')
}

var qualifyPassword = function (password) {
  //check for words
  var reducedPassword = checkForWords(password.split(' '))
  //check for quantity of character types
  //get strength value
  //responses through tweets
}


var wordReg = new RegExp(/\D\w+\D/)

var checkForWords = function (words) {
  var passwordItems = []
  for (var i = words.length - 1; i >= 0; i--) {
    let word = words[i].match(wordReg)[0]
    let index = words[i].match(wordReg).index

    if (word && IsWord(word)){
      console.log(words[i])
      passwordItems.unshift(words[i].replace(wordReg,words[i][index]))
    }
  }
  return passwordItems.join(' ')
}

var request = require('request');
var parser = require('xml2json');

var IsWord = function (word) {
  return request(`http://www.dictionaryapi.com/api/v1/references/collegiate/xml/${word}?key=${dictionaryKey}`, 
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var json = parser.toJson(body)
        var parsed = JSON.parse(json)
        if (parsed.entry_list.entry) {
          return true
        } else {
          return false
        }
      }
    }
  )
}

getMentions()
setInterval(function(){
  getMentions();
}, 85000);