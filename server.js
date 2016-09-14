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
  qualifyPassword('123hello123 /) ')
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
  var characterTypes = characterTypesCount(reducedPassword)
  //get strength value
  var passwordStrength = reducedPassword.length * characterTypes
  //responses through tweets
}


// iterates through password to see if any valid words exist and returns a reduced password
var expressions = { 
  alpha: new RegExp(/[a-zA-Z]+/),
  digit: new RegExp(/\d/),
  space: new RegExp(/\s/),
  other: new RegExp(/\S\W/)
}

var checkForWords = function (words) {
  var passwordItems = []

  for (var i = words.length - 1; i >= 0; i--) {
    if (words[i].match(expressions.alpha)) {
      var word = words[i].match(expressions.alpha)[0]
      var index = words[i].match(expressions.alpha).index
    } else {
      var word = false
    }

    if (word && IsWord(word)){
      passwordItems.unshift(words[i].replace(expressions.alpha,words[i][index]))
    } else {
      passwordItems.unshift(words[i])
    }
  }
  return passwordItems.join(' ')
}


// hits dictionary api to return true/false if word exists
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

var characterTypesCount = function (password) {

  var count = 0
  console.log(password)
  for (var key in expressions) {
    if (password.match(expressions[key]))
      ++count
  }

  return count

}

getMentions()
setInterval(function(){
  getMentions();
}, 85000);