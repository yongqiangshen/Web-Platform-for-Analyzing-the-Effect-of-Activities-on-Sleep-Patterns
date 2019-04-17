//all the routes for our application
//load the relevant frameworks
var FHIR_model = require('../app/models/fhir');

var http = require('request');
const KNN = require('ml-knn');
const SVM = require('ml-svm');
//const ml = require('machine_learning');


const csv = require('csvtojson');


//we need to routes
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================

    app.get('/', function (req, res) {
        //whitelist of all acceptable next parameters to prevent unauthorised redirects
        var whitelist = ['/dashboard', '/user', '/maps', '/prediction', '/data', '/skype/identify'];

        //check and verify for the next parameter in URL to redirect in case of API calls or failed requests
        if (typeof(req.query.next) != 'undefined' && whitelist.indexOf(req.query.next) != -1) {
            passport.session.next = req.query.next;
        } else {
            passport.session.next = '/dashboard';
        }
        if (typeof(req.query.skypeSession) != 'undefined') {
            passport.session.skypeSession = req.query.skypeSession;
        }
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN REDIRECT HANDLERS =============
    // =====================================

    app.get('/next', function (req, res) {
        passport.session.userID = req.user.id;
        var next = passport.session.next;
        if (JSON.stringify(req.user.userData) == JSON.stringify({})) {
            res.redirect('/finalise-setup')
        } else if (typeof(next) != 'undefined') {
            res.redirect(next);
        } else {
            res.redirect('/yearly')
        }
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {message: req.flash('loginMessage')});
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/next', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.post('/loginIOS', passport.authenticate('ios-login'), function (req, res) {
        res.json({"loginStatus": "Success"});
    });

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });

    // process the signup form
    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/next', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)

    app.get('/dashboard', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        yearly_data = dataSources.yearlydata(req.user, callback, req, res);
        res.render('dashboard-wrapper.ejs', {
            user: req.user, // get the user out of session and pass to template
            path: 'dashboard.ejs',
            title: 'Dashboard',
            yearlystep: yearly_data[0],
            yearlydist: yearly_data[1],
            yearlyfloor: yearly_data[2],
            yearlylight: yearly_data[3],
            yearlyfairly: yearly_data[4],
            yearlyvery: yearly_data[5],
            yearlysendent: yearly_data[6],
            yearlycalori: yearly_data[7],
            yearlysleepE : yearly_data[8],
            yearlyminutesAsleep : yearly_data[9],
            yearlyminutesToFallAsleep : yearly_data[10],
            yearlytimeInBed : yearly_data[11],
        });
    });

    app.get('/data', isLoggedIn, function (req, res) {
        res.render('dashboard-wrapper.ejs', {
            user: req.user, // get the user out of session and pass to template
            path: 'data.ejs',
            title: 'Data'
        });
    });
    // get all daily data!
    app.get('/daily', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        today_data = dataSources.todaydata(req.user, callback, req, res);
        //console.log(today_data);
        res.render('dashboard-wrapper.ejs', {
            user: req.user, // get the user out of session and pass to template
            path: 'daily.ejs',
            title: 'DailyData',
            todaystep: today_data[0],
            todaydist: today_data[1],
            todayfloor: today_data[2],
            todaylight: today_data[3],
            todayfairly: today_data[4],
            todayvery: today_data[5],
            todaysendent: today_data[6],
            todaycalori: today_data[7],
            todaysleepE : today_data[8],
            todayminutesAsleep : today_data[9],
            todayminutesToFallAsleep : today_data[10],
            todaytimeInBed : today_data[11],
        });
    });


    app.get('/prediction', isLoggedIn, function (req, res) {
        res.render('dashboard-wrapper.ejs', {
            user: req.user, // get the user out of session and pass to template
            path: 'prediction.ejs',
            title: 'Prediction'
        });
    });


    app.get('/user', isLoggedIn, function (req, res) {
        res.render('dashboard-wrapper.ejs', {
            user: req.user,
            path: 'user.ejs',
            title: 'Profile'
        }); // load the user.ejs file
    });

    app.get('/maps', isLoggedIn, function (req, res) {
        res.render('dashboard-wrapper.ejs', {
            user: req.user,
            path: 'maps.ejs',
            title: 'Maps'
        }); // load the user.ejs file
    });

    // =====================================
    // FITBIT ROUTES =====================
    // =====================================
    app.get('/auth/fitbit',
        passport.authenticate('fitbit', {scope: ['activity', 'sleep', 'heartrate', 'location', 'profile']}
        ));

    app.get('/auth/fitbit/callback', passport.authenticate('fitbit', {
        successRedirect: '/auth/fitbit/success',
        failureRedirect: '/auth/fitbit/failure'
    }));
    app.get('/auth/fitbit/success', function (req, res) {
        res.render('success.ejs', {})
    });

    app.get('/auth/fitbit/failure', function (req, res) {
        res.render('fail.ejs', {})
    });
    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================

    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback', passport.authenticate('facebook',
        {
            successRedirect: '/next',
            failureRedirect: '/'
        }));


    // =====================================
    // NUFFIELD MIDDLE SERVER ROUTES =======
    // =====================================

    /*    //handle the callback after the result is returned
        app.get('/auth/fitbit/callback', function(req,res) {
    //      res.redirect('https://localhost:3000/auth?code=req.code');

          http.post({
            url: "http://localhost:3000/auth/",
            headers: {
              'Content-Type': "application/json;encoding=utf-8",
              'Authorization': "Bearer " /!*+ accessToken*!/
            },
            json: {
              "code" : req.query.code
            }
          }, function(error, resData, json){

            var subscriberData = require('../config/usersData.js');
            var data = {
              fitbit  : resData.body
            };
            console.log("fitbit_id : " + data.id);
            console.log("!!!! before updatefitbitData");
            subscriberData.updatefitbitData(data, req.user);

    //        http.post({
    //          url: "http://localhost:8080/setNuffieldID",
    //          headers: {
    //            'Content-Type': "application/json;encoding=utf-8",
    //            'Authorization': "Bearer " /!*+ accessToken*!/
    //          },
    //          json: {
    //            "code" : resData.body.member_id
    //          }
    //        });
          });
        });

        app.post('/setNuffieldID', function(req,res){
            var subscriberData = require('../config/usersData.js');
            var data = {
                fitbit  : req.body.code
              //nuffield  : req.body.code, //THIS SHOULD BE THE SAME AS
            };
            console.log("!!!! routes setfitbitID");
            subscriberData.updatefitbitData(data, req.user);
            //if the response was successfully completed
            res.writeHead(200);
            res.end();
        });*/

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // USER DATA ===========================
    // =====================================

    app.post('/set-goals', isLoggedIn, function (req, res) {
        var setGoals = require('../config/setGoals.js');
        setGoals.update(req.body.type, req.body.number, req.user);
        res.writeHead(200);
        res.end();
    });
    //=========================================
    //Machine learning analysis===============
    //=======================================
    app.get('/prediction', isLoggedIn, function (req, res) {
        res.render('prediction.ejs', {user: req.user});
    });
    app.get('/predictSleepQuality', isLoggedIn, function (req, res) {
        //var subscriberData = require('../config/usersData.js');
        var response = '';
        var calories_burned = parseFloat(req.query.calories_burned);
        var minutes_sedentary = parseFloat(req.query.minutes_sedentary);
        var floors = parseFloat(req.query.floors);
        var minutes_lightly_active = parseFloat(req.query.minutes_lightly_active);
        var minutes_fairly_active = parseFloat(req.query.minutes_fairly_active);
        var minutes_very_active = parseFloat(req.query.minutes_very_active);
        var steps = parseFloat(req.query.steps);
        var distance = parseFloat(req.query.distance);
        var activity_calories = parseFloat(req.query.activity_calories);
        var accuracy = 0;
        console.log(req.query.minutes_fairly_active);
        //let knn;

        const csvFilePath = 'fitbit.csv'; // Data
        const names = ['calories_burned', 'steps', 'distance', 'floors', 'minutes_sedentary', 'minutes_lightly_active', 'minutes_fairly_active', 'minutes_very_active', 'activity_calories', 'type']; // For header
        console.log("minutes_fairly_active: ");
        //console.log(minutes_fairly_active);
        let seperationSize; // To seperate training and test data

        let data = [], X = [], y = [];
        let knn;

        let trainingSetX = [], trainingSetY = [], testSetX = [], testSetY = [];
        //document.getElementById("demo2").innerHTML = `your steps--------------: ${steps}!`;
        csv({noheader: true, headers: names})
            .fromFile(csvFilePath)
            .on('json', (jsonObj) => {
            data.push(jsonObj); // Push each object to data Array
    })
    .
        on('done', (error) => {
            seperationSize = 0.7 * data.length;
        data = shuffleArray(data);
        dressData();
    })
        ;

        console.log("data length: ");

        console.log(data.length);

        function dressData() {

            /**
             * There are three different types of Iris flowers
             * that this dataset classifies.
             *
             * 1. Iris Setosa (Iris-setosa)
             * 2. Iris Versicolor (Iris-versicolor)
             * 3. Iris Virginica (Iris-virginica)
             *
             * We are going to change these classes from Strings to numbers.
             * Such that, a value of type equal to
             * 0 would mean setosa,
             * 1 would mean versicolor, and
             * 3 would mean virginica
             */


            let types = new Set(); // To gather UNIQUE classes

            data.forEach((row) => {
                types.add(row.type);
        })
            ;

            typesArray = [...types
        ]
            ; // To save the different types of classes.

            data.forEach((row) => {
                let rowArray, typeNumber;

            rowArray = Object.keys(row).map(key => parseFloat(row[key])
        ).
            slice(0, 9);

            typeNumber = typesArray.indexOf(row.type); // Convert type(String) to type(Number)

            X.push(rowArray);
            y.push(typeNumber);

        })
            ;

            let zero = 0;
            let one = 0;
            let two = 0;
            for (var i = 0; i < y.length; i++) {
                if (y[i] == 0) {
                    zero++;
                }
                if (y[i] == 1) {
                    one++;


                }
                if (y[i] == 2) {
                    two++;
                }
            }
            console.log(zero, one, two);

            trainingSetX = X.slice(0, seperationSize);
            trainingSetY = y.slice(0, seperationSize);
            testSetX = X.slice(seperationSize);
            testSetY = y.slice(seperationSize);

            train();
        }

        function train() {
            knn = new KNN(trainingSetX, trainingSetY, {k: 1});
            //svm = new SVM({x: trainingSetX, y: trainingSetY});
            /*   var options = {
                   C: 0.01,
                   tol: 10e-4,
                   maxPasses: 10,
                   maxIterations: 10000,
                   kernel: 'rbf',
                   kernelOptions: {
                       sigma: 0.5
                   }
               };*/
            //svm.train(options);

            //var knn = new ml.KNN(trainingSetX, trainingSetY, {k: 1});
            test();
        }

        function test() {
            //const result = knn.predict(testSetX);
            const result = knn.predict(testSetX);
            //console.log("testSex: ");
            //console.log(testSetX);
            var testSetLength = testSetX.length;
            const predictionError = error(result, testSetY);
            accuracy = Math.round((testSetLength - predictionError) / testSetLength * 100);
            response += '<h4 style="color:#161dff;", class=\"title\"><strong>Machine Learning Accuracy (based on KNN)<strong></h4>\n' +
                `<p style="color:#2db341;">Test Set Size = ${testSetLength} <br> Number of Misclassifications = ${predictionError} <br> The accuracy is ${accuracy}%</p>`;
            //prediction_accuracy= `Test Set Size = ${testSetLength} and number of Misclassifications = ${predictionError}`;

            //console.log(`Test Set Size = ${testSetLength} and number of Misclassifications = ${predictionError}`);
            //document.getElementById("demo1").innerHTML = `Test Set Size = ${testSetLength} and number of Misclassifications = ${predictionError}`;

            predict();
        }

        function error(predicted, expected) {
            let misclassifications = 0;
            for (var index = 0; index < predicted.length; index++) {
                if (predicted[index] !== expected[index]) {
                    misclassifications++;
                }
            }
            return misclassifications;
        }


        function predict() {

            /*var calories_burned = req.body.calories_burned;
            var minutes_sedentary = req.body.minutes_sedentary;
            var floors = req.body.floors;
            var minutes_lightly_active = req.body.minutes_lightly_active;
            var minutes_fairly_active = req.body.minutes_fairly_active;
            var minutes_very_active = req.body.minutes_very_active;
            var steps = req.body.steps;
            var distance = req.body.distance;
            var activity_calories = req.body.activity_calories*/
            //const names = ['calories_burned', 'steps', 'distance', 'floors', 'minutes_sedentary', 'minutes_lightly_active', 'minutes_fairly_active', 'minutes_very_active', 'activity_calories', 'type']

            //let temp = [calories_burned, steps, distance, floors, minutes_sedentary, minutes_lightly_active, minutes_fairly_active, minutes_very_active, activity_calories];


            var temp = new Array(calories_burned, steps, distance, floors, minutes_sedentary, minutes_lightly_active, minutes_fairly_active, minutes_very_active, activity_calories);

            if (knn.predict(temp) == 0) {
                type = 'good';

            }
            if (knn.predict(temp) == 1) {
                type = 'poor';

            }
            if (knn.predict(temp) == 2) {
                type = 'fair';

            }
            /*  var calories_burned = req.query.calories_burned;
                        var minutes_sedentary = req.query.minutes_sedentary;
                        var floors = req.query.floors;
                        var minutes_lightly_active = req.query.minutes_lightly_active;
                        var minutes_fairly_active = req.query.minutes_fairly_active;
                        var minutes_very_active = req.query.minutes_very_active;
                        var steps = req.query.steps;
                        var distance = req.query.distance;
                        var activity_calories = req.query.activity_calories;*/


            //console.log(`With ${temp} -- sleep quality is: ${type}`);
            response += `<h4 style="color:#161dff;", class=\"title\"><strong>Sleep Quality Prediction<strong></h4>` +
                `<p style="color:#2db341;"> Your Activities <br> step: ${steps} <br> floors: ${floors}<br>distance: ${distance}<br> minutes_sedentary: ${minutes_sedentary}<br>` +
                `minutes_lightly_active: ${minutes_lightly_active}<br> minutes_fairly_active: ${minutes_fairly_active}<br>minutes_very_active: ${minutes_very_active}<br>` +
                `activity_calories: ${activity_calories}<br> calories_burned: ${calories_burned}</p><br>` +
                `<p style="color:#b31318;">Based on the activities, your sleep quality will be <strong>${type}</strong> </p>` +
                `<button onclick = "goBack()"> Go Back To Prediction Page</button>` + `<script>function goBack(){window.history.back()};</script>`;
            //res.writeHead(200,"OK",{"Content-Type":"text/html"});
            //res.render('prediction.ejs', {});

            res.render('dashboard-wrapper.ejs', {
                user: req.user,
                path: 'prediction.ejs',
                title: 'Maps',
                steps_val: steps,
                floors_val: floors,
                distance_val: distance,
                minutes_sedentary_val: minutes_sedentary,
                minutes_lightly_active_val: minutes_lightly_active,
                minutes_fairly_active_val: minutes_fairly_active,
                minutes_very_active_val: minutes_very_active,
                activity_calories_val: activity_calories,
                calories_burned_val: calories_burned,
                type_val: type,
                acc_val: accuracy

            }); // load the user.ejs file

            
            //res.send(response);

        }

        /**
         * https://stackoverflow.com/a/12646864
         * Randomize array element order in-place.
         * Using Durstenfeld shuffle algorithm.
         */
        function shuffleArray(array) {
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
        }
    });

    app.post('/update-user-data', isLoggedIn, function (req, res) {
        var userData = require('../config/usersData.js');
        var data = {
            nickname: req.body.nickname,
            email: req.body.email,
            address: req.body.address,
            city: req.body.city,
            country: req.body.country,
            postcode: req.body.postcode,
            aboutMe: req.body.aboutMe
        };
        userData.updateUserData(data, req.user);
        //if the response was successfully completed
        res.writeHead(200);
        res.end();
    });

    app.get('/finalise-setup', isLoggedIn, function (req, res) {
        res.render('finalise-setup.ejs', {user: req.user});
    })

    app.get('/user-remove', isLoggedIn, function (req, res) {
        req.user.remove();
        res.redirect('/');
    })

    app.post('/finalise-setup-submit', isLoggedIn, function (req, res) {
        var userData = require('../config/usersData.js');
        var data = {
            openMRS: (req.body.openMRS != undefined),
            msHealth: (req.body.msHealth != undefined)
        };
        userData.updateSubscribersData(data, req.user);
        var data = {
            nickname: req.body.nickname,
            email: req.body.email,
            address: req.body.address,
            city: req.body.city,
            country: req.body.country,
            postcode: req.body.postcode,
            aboutMe: req.body.aboutMe
        };
        userData.updateUserData(data, req.user);
        var data = {
            fitbit: req.body.fitbit,
            startDate: req.body.startDate
        };
        userData.updatePublishersData(data, req.user);
        res.redirect('/next')
    })

    app.post('/update-data', isLoggedIn, function (req, res) {
        var subscriberData = require('../config/usersData.js');
        var data = {
            openMRS: req.body.openMRS,
            msHealth: req.body.msHealth
        };
        console.log(data)
        subscriberData.updateSubscribersData(data, req.user);
        var data = {
            fitbit: req.body.fitbit,
            startDate: req.body.startDate
        };
        console.log(data)
        subscriberData.updatePublishersData(data, req.user);
        //if the response was successfully completed
        res.writeHead(200);
        res.end();
    });

    app.get('/notifications', isLoggedIn, function (req, res) {
        var getNotifications = require('../config/notifications.js');
        var ret = function (notifications) {
            var resp = {'notifications': notifications};
            res.writeHead(200);
            res.write(JSON.stringify(resp));
            res.end();
        }
        getNotifications(req.user, ret);
    });


    app.get('/bookings', isLoggedIn, function (req, res) {
        var callback = function (bookings) {
            res.writeHead(200);
            res.write(JSON.stringify(bookings));
            res.end();
        }
        var getBookings = require('../config/getBookings.js');
        getBookings(req.user.id, callback);
    });

    // =====================================
    // DATA FOR GRAPHS =====================
    // =====================================
    app.get('/graph/gymByMonth', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.activity(req.user, callback, req, res);
    });

    app.get('/graph/steps24', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.steps24(req.user, callback, req, res);
    });

    app.get('/graph/todaystep', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.todaystep(req.user, callback, req, res);
    });

    app.get('/graph/todaysleep', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.todaysleep(req.user, callback, req, res);
    });

    app.get('/graph/stepsMonth', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.stepsMonth(req.user, callback, req, res);
    });

    app.get('/graph/sessions', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.sessions(req.user, callback, req, res);
    });

    app.get('/graph/gymDist', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.gymDist(req.user, callback, req, res);
    });

    app.get('/graph/stepDist', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.stepDist(req.user, callback, req, res);
    });

    app.get('/graph/todayactivity', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.todayactivity(req.user, callback, req, res);
    });

    app.get('/graph/yearCal', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.yearCal(req.user, callback, req, res);
    });

    app.get('/graph/yearDis', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.yearDis(req.user, callback, req, res);
    });


    app.get('/graph/yearFlo', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.yearFlo(req.user, callback, req, res);
    });
    app.get('/graph/yearSed', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.yearSed(req.user, callback, req, res);
    });
    app.get('/graph/yearLight', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.yearLight(req.user, callback, req, res);
    });

    app.get('/graph/yearFair', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.yearFair(req.user, callback, req, res);
    });

    app.get('/graph/yearVery', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.yearVery(req.user, callback, req, res);
    });
    app.get('/graph/yearsleepE', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.yearsleepE(req.user, callback, req, res);
    });
    app.get('/graph/today', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.today(req.user, callback, req, res);
    });
    app.get('/graph/yearly', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.yearly(req.user, callback, req, res);
    });

    // pictures in Dashboard
    app.get('/graph/stepyearPic', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.stepyearPic(req.user, callback, req, res);
    });

    app.get('/graph/sleepyearPic', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.sleepyearPic(req.user, callback, req, res);
    });

    app.get('/graph/activyearPic', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.activyearPic(req.user, callback, req, res);
    });

    app.get('/graph/calyearPic', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.calyearPic(req.user, callback, req, res);
    });

    app.get('/graph/disyearPic', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.disyearPic(req.user, callback, req, res);
    });

    app.get('/graph/sedyearPic', isLoggedIn, function (req, res) {
        var sedyearPic = require('../config/dataSources.js');
        sedyearPic.sedyearPic(req.user, callback, req, res);
    });
    app.get('/graph/sleepCategory', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.sleepCategory(req.user, callback, req, res);
    });
	  app.get('/graph/correlation', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.correlation(req.user, callback, req, res);
    });

   /* app.get('/graph/yearActCal', isLoggedIn, function (req, res) {
        var dataSources = require('../config/dataSources.js');
        dataSources.yearActCal(req.user, callback, req, res);
    })*/



    // =====================================
    // Get data from IOS ===================
    // =====================================
    // Get the fhir json (currently just steps) from Health Kit
    app.post('/healthKit', function (request, response) {
        if (response.statusCode == 200) {
            console.log("From healthKit we get: ");
            console.log(request.body);
            var newFhirSchema = new FHIR_model.FHIR(request.body);
            newFhirSchema.save();
        }
        else {
            console.log("healthKit seems not working");
            response.send("Error code: " + response.statusCode);
        }
    });

    // =====================================
    // Machine Learning ===================
    // =====================================
    app.get("/dataDisplay", function (request, response) {
            var dataSources = require('../config/dataSources.js');
            var trainData = dataSources.traindata(request.user, callback, request, response);
            //Get traindata data from datasource
            var trainDa = [];
            for (var i = 0; i < trainData[0].length; i++) {

                trainDa[i] = [trainData[0][i], trainData[1][i], trainData[2][i], trainData[3][i], trainData[4][i], trainData[5][i], trainData[6][i], trainData[7][i], trainData[8][i], trainData[9][i], trainData[10][i]];
            }
            ;
            //console.log("yearstepArray, yearcalArray,yearDisArray, yearFloArray,yearMinSed, yearLightActive,yearFairActive,yearVeryActive,yearSleEffi, yearSleepNum==============");
            //console.log(trainDa);
            //get today's activities fro datasources


            var todayActi = dataSources.toActivity(request.user, callback, request, response);

            //Machine Learning algorithms   345 data points in total
            var ml = require('machine_learning');

            // Split the data into training data set and test data set===========================Dressing the data for machine learning
            console.log("Now, starting the machine learning prediction, please wait for running===========================");

            let seperationSize; // To seperate training and test data

            let X = [], yCaltegory = [], yNum = [], yNumArray = [], yBin = [], trainingSetYBin = [], testSetYBin = [];
            let data = [];
            let mlp, svm, knn, dt;

            let trainingSetX = [], trainingSetYCal = [], trainingSetYNum = [], testSetYCal = [], testSetX = [],
                testSetYNum = [];
            let trainSetYNumArray = [], testSetYNumArray = [];
            //document.getElementById("demo2").innerHTML = `your steps--------------: ${steps}!`;
            seperationSize = 0.7 * (trainDa.length);

            data = shuffleArray(trainDa);//shuffle array of the training data

            console.log("shuffle array for training data-----------------------------");

            //console.log(data);

            function shuffleArray(array) {
                for (var i = array.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
                return array;
            }

            //Get the training data X
            X = data.map(function (subarray) {
                return subarray.slice(0, 8);
            });
            /*console.log("------------X");
            console.log(X);*/

            //Get label Y both for categorical or numerical labels
            yCaltegory = data.map(function (subarray) {
                return subarray.slice(8, 9);
            });
            yNum = data.map(function (subarray) {
                return subarray.slice(9, 10);
            });
            yBin = data.map(function (subarray) {
                return subarray.slice(10, 11);
            });
            yNumArray = yNum;

            //Change to only 1 dimensional array
            for (var i = 0; i < yNum.length; i++) {
                yCaltegory[i] = yCaltegory[i][0];
                yNum[i] = yNum[i][0];
                yBin[i] = yBin[i][0];
            }
            console.log("split the data into training set and test set=================================");

            trainingSetX = X.slice(0, seperationSize);
            trainingSetYCal = yCaltegory.slice(0, seperationSize);
            trainingSetYBin = yBin.slice(0, seperationSize);
            trainingSetYNum = yNum.slice(0, seperationSize);
            //trainSetYNumArray = yNumArray.slice(0, seperationSize);

            testSetX = X.slice(seperationSize);
            testSetYCal = yCaltegory.slice(seperationSize);
            testSetYNum = yNum.slice(seperationSize);
            testSetYBin = yBin.slice(seperationSize);
            //testSetYNumArray = yNumArray.slice(seperationSize);

            // Start Machine Learning================================================================
            //.log("start the machine learing==============================");

            //let mlp_res, svm_res, knn_res, dt_res;
            var testSetLength = testSetX.length;

            //Machine Learning results===========================================================================
            var trainResult = train();
            console.log("Machine Learning total results----------------------------------------");
            console.log(trainResult);

            /*Machine Learning======================================================================================*/

            /*Machine Learning======================================================================================*/

            function train() {

                //(1)DT algorithm===============================================================================
                console.log("start the decision tree algorithm***************************");
                var xtree = trainingSetX;
                /*console.log("xtree+++++++++++++++++");
                console.log(xtree);*/
                //console.log(trainingSetYNum);
                var result2 = [];
                var resYCal = [];
                var classifier = new ml.DecisionTree({
                    data: xtree,
                    result: trainingSetYCal
                });
                classifier.build();

                for (var i = 0; i < testSetX.length; i++) {
                    result2.push(classifier.classify(testSetX[i]));
                }
                //console.log("Object.keys(result2[0]");


                //console.log("decision tree prediction testSetY: ");
                for (var i = 0; i < result2.length; i++) {
                    resYCal.push(Object.keys(result2[i])[0]);
                }

                var predictionError = error(resYCal, testSetYCal);
                var treepredict = classifier.classify(todayActi);
                classifier.prune(1.0);
                //dt.print();
                /* console.log("resYCal++++++++++++++++++++++++");
                 console.log(resYCal);
                 console.log("testSetYCal+++++++++++++++++++");
                 console.log(testSetYCal);
                 console.log('Decision Tree algorithm result = ${predict}------------------');
                 console.log(predict);*/
                // console.log("sleep quality will be:=======");
                //console.log(Object.keys(treepredict)[0]);
                var tree_accuracy = Math.round((testSetLength - predictionError) / testSetLength * 100);
                /* console.log("decision tree prediction accuracy will be: test length-${testSetLength} and number of wrong predictions - ${predictionError}");
                 console.log(testSetLength);
                 console.log(predictionError);
                 console.log(tree_accuracy);*/

                // (2) svm suppourt vector machine===================================================================================

                console.log("start the SVM algorithm, this one is pretty slow***********************************");
                var svmResult = [];
                var xsvm = xtree.map(function (subarray) {
                    return subarray.slice(0, 8);
                });

                /* console.log("trainingsetx:++++++++++++++++ in svm");
                 console.log(xsvm);
                 console.log("trainingSetYBin:+++++++++++in svm");
                 console.log(trainingSetYBin);*/
                var svm = new ml.SVM({
                    x: xsvm,
                    y: trainingSetYBin

                });
                svm.train({
                    C: 1.1, // default : 1.0. C in SVM.
                    tol: 1e-5, // default : 1e-4. Higher tolerance --> Higher precision
                    max_passes: 20, // default : 20. Higher max_passes --> Higher precision
                    alpha_tol: 1e-5, // default : 1e-5. Higher alpha_tolerance --> Higher precision

                    kernel: {type: "polynomial", c: 1, d: 5}
                });

                for (var i = 0; i < testSetX.length; i++) {
                    svmResult.push(svm.predict(testSetX[i]));
                }
                /* console.log("svmResult-----------------array");
                 console.log(svmResult);*/

                var predictionError = error(svmResult, testSetYBin);
                var svm_accuracy = Math.round((testSetLength - predictionError) / testSetLength * 100);
                var svmpredict = svm.predict(todayActi);
                let svmpredictRel;
                if (svmpredict == 1) {
                    svmpredictRel = 'good';
                }
                if (svmpredict == -1) {
                    svmpredictRel = 'fair or poor';
                }

                // (3) KNN (K-nearest neighbors)===================================================================================

                console.log("start KNN algorithm ****************************************");

                var knnResult = [];
                var knnResult2 = [];
                let Rel;
                var xknn = xtree.map(function (subarray) {
                    return subarray.slice(0, 8);
                });
                var knn = new ml.KNN({
                    data: xknn,
                    result: trainingSetYNum
                });
                for (var i = 0; i < testSetX.length; i++) {
                    var y = knn.predict({
                        x: testSetX[i],
                        k: 1,
                        weightf: {type: 'gaussian', sigma: 10.0},
                        distance: {type: 'euclidean'}
                    });
                    if (y > 97) {
                        Rel = 'good';
                    }
                    else if (y > 93 && y <= 97) {
                        Rel = 'fair';
                    }
                    else {
                        Rel = 'poor';
                    }
                    knnResult2.push(Rel);

                    knnResult.push(y);
                }
                /* console.log("knn predict test y: ");
                 console.log(knnResult2);
                 console.log(knnResult);*/


                var predictionError = error(knnResult2, testSetYCal);
                var knn_accuracy = Math.round((testSetLength - predictionError) / testSetLength * 100);

                var knnpredict = knn.predict({

                    x: todayActi,
                    k: 1,
                    weightf: {type: 'gaussian', sigma: 10.0},
                    distance: {type: 'euclidean'}

                });

                let knnpredictRel;
                if (knnpredict > 97) {
                    knnpredictRel = 'good';
                }
                else if (knnpredict > 93 && knnpredict <= 97) {
                    knnpredictRel = 'fair';
                }
                else {
                    knnpredictRel = 'poor';
                }


                // (4) MLP algorithm===================================================================================

            /*    console.log("start MLP (Multi-Layer Perceptron)================================================");

                var mlpResult = [];
                // let Rel;
                var xmlp = xtree.map(function (subarray) {
                    return subarray.slice(0, 8);
                });
                console.log(xmlp);
                var mlp = new ml.MLP({
                    'input': xmlp,
                    'label': trainingSetYBin,
                    'n_ins': 8,
                    'n_outs': 1,
                    'hidden_layer_sizes': [4, 4, 5]
                });

                mlp.set('log level', 1); // 0 : nothing, 1 : info, 2 : warning.

                mlp.train({
                    'lr': 0.6,
                    'epochs': 800
                });
                for (var i = 0; i < testSetX.length; i++) {
                    mlpResult.push(mlp.predict(testSetX[i]));

                }
                console.log(mlpResult);*/


                //return results
                return [Object.keys(treepredict)[0], tree_accuracy, svmpredictRel, svm_accuracy, knnpredictRel, knn_accuracy];


            }
        function error(predicted, expected) {
            let misclassifications = 0;
            for (var index = 0; index < predicted.length; index++) {
                if (predicted[index] !== expected[index]) {
                    misclassifications++;
                }
            }
            return misclassifications;
        }

        response.render('dashboard-wrapper.ejs', {
            user: request.user, // get the user out of session and pass to template
            path: 'data.ejs',
            title: 'MachineLearning',
            treesleep: trainResult[0],
            treeaccuracy: trainResult[1],
            svmsleep: trainResult[2],
            svmaccuracy: trainResult[3],
            knnsleep: trainResult[4],
            knnaccuracy: trainResult[5]


        });
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/?next='+req.url);
}

// used for asynchronous mongoose requests
var callback = function(data, req, res){
  res.writeHead(200);
  res.write(JSON.stringify(data));
  res.end();
};
