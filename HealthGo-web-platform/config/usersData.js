var User = require('../app/models/user');

exports.updateUserData = function(data, user) {
	user.userData = data;
	user.save();
}

exports.updateSubscribersData = function(data, user) {
	user.subscribers = data;
	user.save();
}

exports.updatePublishersData = function(data, user) {
	user.publishers = data;
	//user.publishers.startDate = data.startDate;
	user.save();
}

exports.updatefitbitData = function(data, user) {
	user.publishers.fitbit  = data.fitbit;
	console.log("!!!!!!!! userData.js");
	user.save();
}
