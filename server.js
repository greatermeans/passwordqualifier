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
});

var originalPassword;
var message;
var passwordHasBeenChanged;
var storedTweets = {}

var getMentions = function(){
  var stream = twit.stream('statuses/filter', { track: ['@EnhancingPass'] })
    
  stream.on('tweet', function (tweet) {    
    let textItems = tweet.text.split(' ');
    let sender = tweet.user.screen_name;

    originalPassword = RemoveUserName(textItems)
    passwordHasBeenChanged = false
    storedTweets.sender = originalPassword

    qualifyPassword(originalPassword)
    respondToSender(sender)
    console.log(storedTweets)
  })
}

var respondToSender = function (sender) {
  if (passwordHasBeenChanged) {
    message = `Your password is stronger as [${reducedPassword}]`
  }

  twit.post('statuses/update', {status: `@${sender} ${message}`},  
    function(error, tweet, response){
      if(error){
        console.log(error);
      } else {
        console.log(tweet)
      }
    });
}

var RemoveUserName = function (textItems) {
  textItems.shift()
  return textItems.join(' ')
}

var reducedPassword;

var qualifyPassword = function (password) {
  //check for words
  reducedPassword = checkForWords(password.split(' '))
  //check for quantity of character types
  var characterTypes = characterTypesCount(reducedPassword)
  //get strength value
  var passwordStrength = reducedPassword.length * characterTypes
  //evaluate strength
  return evaluateStrength(passwordStrength)
}

// iterates through password to see if any valid words exist and returns a reduced password
var alphaWord = new RegExp(/[a-zA-Z]{2,50}/)

var checkForWords = function (words) {
  var passwordItems = []

  for (var i = words.length - 1; i >= 0; i--) {
    let matched = words[i].match(alphaWord)
    if (matched) {
      var word = matched[0]
      var index = matched.index
    } else {
      var word = false
    }

    if (word && IsWord(word)){
      passwordItems.unshift(words[i].replace(alphaWord,words[i][index]))
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

var expressions = { 
  alpha: new RegExp(/[a-zA-Z]/),
  digit: new RegExp(/\d/),
  space: new RegExp(/\s/),
  other: new RegExp(/[_]|[^\w\s]/)
}

var characterTypesCount = function (password) {
  var count = 0
  for (var key in expressions) {
    if (expressions[key].test(password))
      ++count
  }
  return count
}

var missingCharTypes = function (password) {
  let missingTypes = []
  for (var key in expressions) {
    if (!expressions[key].test(password))
      missingTypes.push(key)
  }
  return missingTypes
}

var evaluateStrength = function (strength) {
  if (strength >= 50) {
    return message = "Your password is through the roof! You probably shouldn't use it since its on Twitter"
  } else if (strength > 10 && strength < 50) {
    passwordHasBeenChanged = true
    originalPassword.length > reducedPassword.length ? makePasswordBetter() : addCharacter()
   } else if (strength <= 10) {
    return message = "That was terrible. Try again!"
  }
}

var makePasswordBetter = function () {
  while (reducedPassword.length < originalPassword.length ) {
    let missingTypes = missingCharTypes(reducedPassword)
    reducedPassword = addToPassword(missingTypes)
  } 

  qualifyPassword(reducedPassword)
}

var addToPassword = function (missingTypes) {
  switch (missingTypes[0]) {
    case 'space':
      return (reducedPassword + ' ')
    case 'other':
      return (reducedPassword + '_')
    case 'digit':
      return (reducedPassword + '2')
    case 'alpha':
      return (reducedPassword + 'a')
    default:
      return (reducedPassword + '!')
  }
}

var addCharacter = function () {
  qualifyPassword(reducedPassword + '!')
}


getMentions()
setInterval(function(){
  getMentions();
}, 85000);