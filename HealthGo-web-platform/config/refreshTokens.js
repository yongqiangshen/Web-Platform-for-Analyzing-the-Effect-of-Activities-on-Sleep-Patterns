const User = require('../app/models/user.js');
const credentials = require('./auth.js');
const http = require('request');

exports.refreshFitbitToken = function(userID, callback){
  User.findOne({'_id':userID}, function(err, user){
      if(err){
        console.log(err);
        return callback('');
      }
      if(user){
        http.post({
          url : 'https://api.fitbit.com/oauth2/token',
          headers : {
            "Content-Type" : "application/x-www-form-urlencoded",
            'Authorization':  'Basic '+ new Buffer(credentials.fitbitAuth.clientID + ':' + credentials.fitbitAuth.clientSecret).toString('base64')
            },
          form : {
            "client_id"      : credentials.fitbitAuth.clientID,
            "client_secret"  : credentials.fitbitAuth.clientSecret,
            "refresh_token"  : user.publishers.fitbit.refreshToken,
            "grant_type"     : 'refresh_token'
          }
        }, function(err, resdata, tokendata) {
          tokendata = JSON.parse(tokendata);
          if(err){
            console.log(err);
            return callback('');
          }
          if(resdata.statusCode != 200){
            //console.log('what is this? got');
            //console.log(tokendata);
            return callback('');
          }
          if(tokendata.error){
            //console.log(tokendata.console.error);
            return callback('');
          }
          if(tokendata.access_token){
            //console.log('token got');
            //console.log(tokendata.refresh_token);
            return callback(tokendata.access_token);
          }
          console.log('Uncaught Error While Refreshing fitbit Access Token');
          return callback('');
        })
      } else {
        console.log('Can\'t Refresh User Token!');
        return callback('');
      }
  })

}
