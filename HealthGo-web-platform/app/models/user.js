//Our user model

// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String,
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },

    userData         : {
        nickname     : String,
        email        : String,
        address      : String,
        city         : String,
        country      : String,
        postcode     : String,
        aboutMe      : String
    },
    publishers       : {
      startDate      : Date,     
      
      fitbit         : {
        id           : String,
        token        : String,
        refreshToken : String
		//calories_burned： String,
		//minutes_sedentary:String,
		//floors: String,
		//minutes_lightly_active: String;
		//minutes_fairly_active: String,
		//minutes_very active: String,
		//steps: String,
		//distance: String,
		//activity_calories: String,
		//prediction_accuracy: String,
		//sleep_quanlity: String
		
			
    },
      },
    subscribers      : {
        openMRS      : Boolean,
        msHealth     : Boolean
    },
    goals            : {
        gym          : Number,
        steps        : Number
    }
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app  or compile model from schema
module.exports = mongoose.model('User', userSchema);
/*
Once you have defined your model classes you can use them to create, update, or delete records
and run queries to get all records or particular subsets of records*/
