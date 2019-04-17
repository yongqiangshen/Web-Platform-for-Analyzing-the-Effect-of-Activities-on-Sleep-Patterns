//configuring the strategies for passport
// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
//var FacebookStrategy = require('passport-facebook').Strategy;
//var GoogleStrategy = require('passport-google-oauth2').Strategy;
var FitbitStrategy = require( 'passport-fitbit-oauth2' ).FitbitOAuth2Strategy;
//var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

// load up the user model
var User            = require('../app/models/user');

//load the auth variables
var configAuth = require('./auth');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
//Passport srategy for authenticating with a username and password
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        //console.log("Hi buddy");
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

                // if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });

        });

    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },

    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));

    // =========================================================================
    // IOS LOGIN =============================================================
    // =========================================================================
    // This is for user using our IOS app, which can add Healkit data to his/her data source.

    passport.use('ios-login', new LocalStrategy({
        // User should use the same information as his Transpire account.
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },

    function(req, email, password, done) {
        User.findOne({ 'local.email' :  email }, function(err, user) {
            if (err)
                return done(err);
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, record the user with HealthKit and return successful user
            user.publishers.healthKit = "Connected";
            user.save(function(err) {
                if (err)
                    throw err;
                // if successful, return the new user
                return done(null, user);
            });
        });

    }));

       // =========================================================================
    // FITBIT LOGIN =============================================================
    // =========================================================================
    // This is for user using Fitbit app, which can add fitbit data to his/her data source.


passport.use(new FitbitStrategy({
    clientID:     configAuth.fitbitAuth.clientID,
    clientSecret: configAuth.fitbitAuth.clientSecret,
	scope: ['activity','sleep','heartrate','location','profile'],
    callbackURL: configAuth.fitbitAuth.callbackURL,
	
	

  },
  function(accessToken, refreshToken, profile, done) {
	  //save accessToken here for later use
    process.nextTick(function() {
    User.findOne({ '_id':  passport.session.userID }, function (err, user) {
     // return done(err, user);
     // if there is an error, stop everything and return that
              // ie an error connecting to the database
              if (err)
                  return done(err);

              // if the user is found, then log them in
              if (user) {
                user.publishers.fitbit.id           = profile.id; // set the users google id
                user.publishers.fitbit.token        = accessToken; // we will save the token that google provides to the user
                user.publishers.fitbit.refreshToken = refreshToken;
				console.log("this is your fitbit accesstoken: ", accessToken);
                console.log("this is your fitbit refreshtoken: ", refreshToken);
                console.log("this is your fitbit accessToken: ", accessToken);
                console.log("this is your fitbit id: ", profile.id);
                user.save(function(err) {
                    if (err)
                        throw err;

                    // if successful, return the new user
                    return done(null, user);
                  });

              } else {
                    return done(null, user);
              }
    });
});
  }
));


    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
   
}
