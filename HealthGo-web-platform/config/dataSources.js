var Swipe = require('../app/models/swipe.js');
var FHIR_model = require('../app/models/fhir');
var http = require('request');
var refreshTokens = require('./refreshTokens.js');
var fhir_converter = require('fhir-converter');
var Correlation = require('node-correlation');

var steps_data = 5;
var yearlySteps = 5;

//array
var yearstepArray = [];
var yearcalArray = [];
var yearDisArray = [];
var yearFloArray = [];
var yearMinSed = [];
var yearLightActive = [];
var yearFairActive = [];
var yearVeryActive = [];
//var yearActCalories = [];
var todayAct = [];
var yearSleEffi = [];
var yearSleepNum = [];
var yearSleBinary = [];

// dictionary
var yearStep = [];
var yearCal = [];
var yearDis = [];
var yearFlo = [];
var yearMS = [];
var yearLight = [];
var yearFair = [];
var yearVery = [];
var yearSleepE = [];

// for yearly pictures
var monthlyStep = [];
var monthlyDis = [];
var monthlyFlo = [];
var monthlyLight = [];
var monthlyFair = [];
var monthlyVery = [];
var monthlySed = [];
var monthlyCal = [];
var monthlySleEffi = [];

//var trainData = [];

var todaystep = 0;
var todaydist = 0;
var todayfloor = 0;
var todaylight = 0;
var todayfairly = 0;
var todayvery = 0;
var todaysendent = 0;
var todaycalori = 0;

var todaysleepE = 0;
var todayminutesAsleep = 0;
var todayminutesToFallAsleep = 0;
var todaytimeInBed = 0;

//sleep quality
var sleepcategory = [];
//for correlathion
var corrArray = [];


//calculate Correlations between different components
exports.correlation = function(user, callback, req, res){

    corrArray[0] =Correlation.calc(yearstepArray,yearSleepNum);
    corrArray[1] =Correlation.calc(yearcalArray,yearSleepNum);
    corrArray[2] =Correlation.calc(yearDisArray,yearSleepNum);
    corrArray[3] =Correlation.calc(yearFloArray,yearSleepNum);
    corrArray[4] =Correlation.calc(yearMinSed,yearSleepNum);
    corrArray[5] =Correlation.calc(yearLightActive,yearSleepNum);
    corrArray[6] =Correlation.calc(yearFairActive,yearSleepNum);
    corrArray[7] =Correlation.calc(yearVeryActive,yearSleepNum);
    /*console.log("correlation: ============");
    console.log(corrArray);*/
	var BarChartData = {

        labels: ["Steps_Sleep", "Calories_Sleep", "Distance_Sleep", "Floors-Sleep", "Minutes sedentary_Sleep", "Minutes lighlty active_Sleep", "Minutes fairly active_Sleep","Minutes very active_Sleep"],
        datasets: [{
            label: 'correlation coefficient',
            backgroundColor: "#802880",
            borderColor: "#5b2648",
            borderWidth: 1,
            data: corrArray,
        }]

    };
    var config = {
        type: 'bar',
        data: BarChartData,
        options: {
            elements: {
                rectangle: {
                    borderWidth: 2,
                }
            },
            responsive: true,
            legend: {
                position: 'right',
                fontSize: 20
            },
            ticks: {
                beginAtZero: false
            },
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'correlation coefficient'
                },
                ticks: {
                    beginAtZero: false
                }
            }],
            scales: {
                xAxes: [{
                    ticks: {
                        fontSize: 14
                    }
                }],
                scaleLabel:[{
                    ticks: {
                        fontSize: 14
                    }
                }],
                yAxes: [{
                    ticks: {
                        fontSize: 20
                    }
                }]
            }

        }
    };
    return callback(config, req, res)
}


//export data for machine learning training

exports.traindata = function (user, callback, req, res) {
    var step = [];
    var cal = [];
    var dis = [], flo = [], msed = [], light = [], fair = [], very = [];
    //normalize all the training data into the scale 0 -1
    var maxstep = Math.max(...yearstepArray);
    var minstep = Math.min(...yearstepArray);
    var maxcal = Math.max(...yearcalArray);
    var mincal = Math.min(...yearcalArray);
    var maxdis = Math.max(...yearDisArray);
    var mindis = Math.min(...yearDisArray);
    var maxmsed = Math.max(...yearMinSed);
    var minmsed = Math.min(...yearMinSed);
    var maxflo = Math.max(...yearFloArray);
    var minflo = Math.min(...yearFloArray);
    var maxlight = Math.max(...yearLightActive);
    var minlight = Math.min(...yearLightActive);
    var maxfair = Math.max(...yearFairActive);
    var minfair = Math.min(...yearFairActive);
    var maxvery = Math.max(...yearVeryActive);
    var minvery = Math.min(...yearVeryActive);


    for (var i = 0; i < yearstepArray.length; i++) {
        step[i] = (yearstepArray[i] - minstep) / (maxstep - minstep);
        cal[i] = (yearcalArray[i] - mincal) / (maxcal - mincal);
        dis[i] = (yearDisArray[i] - mindis) / (maxdis - mindis);
        flo[i] = (yearFloArray[i] - minflo) / (maxflo - minflo);
        msed[i] = (yearMinSed[i] - minmsed) / (maxmsed - minmsed);
        light[i] = (yearLightActive[i] - minlight) / (maxlight - minlight);
        fair[i] = (yearFairActive[i] - minfair) / (maxfair - minfair);
        very[i] = (yearVeryActive[i] - minvery) / (maxvery - minvery);

    }

    return [step, cal, dis, flo, msed, light, fair, very, yearSleEffi, yearSleepNum, yearSleBinary];



}
//export today's fitbit data and normalize for machine learning

exports.toActivity = function (user, callback, req, res) {
    var maxstep = Math.max(...yearstepArray);
    var minstep = Math.min(...yearstepArray);
    var maxcal = Math.max(...yearcalArray);
    var mincal = Math.min(...yearcalArray);
    var maxdis = Math.max(...yearDisArray);
    var mindis = Math.min(...yearDisArray);
    var maxmsed = Math.max(...yearMinSed);
    var minmsed = Math.min(...yearMinSed);
    var maxflo = Math.max(...yearFloArray);
    var minflo = Math.min(...yearFloArray);
    var maxlight = Math.max(...yearLightActive);
    var minlight = Math.min(...yearLightActive);
    var maxfair = Math.max(...yearFairActive);
    var minfair = Math.min(...yearFairActive);
    var maxvery = Math.max(...yearVeryActive);
    var minvery = Math.min(...yearVeryActive);
    todayAct = [todaystep, todaycalori, todaydist, todayfloor, todaysendent, todaylight, todayfairly, todayvery];
    //normalized the today's activities to the range 0 ~ 1
    todayAct[0] = (todayAct[0] - minstep) / (maxstep - minstep);
    todayAct[1] = (todayAct[1] - mincal) / (maxcal - mincal);
    todayAct[2] = (todayAct[2] - mindis) / (maxdis - mindis);
    todayAct[3] = (todayAct[3] - minflo) / (maxflo - minflo);
    todayAct[4] = (todayAct[4] - minmsed) / (maxmsed - minmsed);
    todayAct[5] = (todayAct[5] - minlight) / (maxlight - minlight);
    todayAct[6] = (todayAct[6] - minfair) / (maxfair - minfair);
    todayAct[7] = (todayAct[7] - minvery) / (maxvery - minvery);


    return todayAct;
}


exports.yearsleepE = function (user, callback, req, res) {
    var afterTokenRefresh = function (accessToken) {
        //console.log('here');
        var temp_result = [];
        var now = new Date();
        var month = now.getMonth() + 1;
        var today_date = now.getDate() - 1;
        var currentdate = now.getFullYear() + "-" + month + "-" + today_date;
        var lastDay = today_date + 1;
        var lastDay2 = today_date - 1;
        //var lastYear = now.getFullYear()-1;
        var year3_start = now.getFullYear() + "-08-" + today_date;
        //var year3_end = now.getFullYear() + "-08-" + lastDay2;
        var year6_start = now.getFullYear() + "-05-" + today_date;
        var year6_end = now.getFullYear() + "-05-" + lastDay2;
        var year9_start = now.getFullYear() + "-02-" + today_date;
        var year9_end = now.getFullYear() + "-02-" + lastDay2;


        http.get({
            //url: "https://api.fitbit.com/1.2/user/-/sleep/date/"+currentdate+".json",
            //url: "https://api.fitbit.com/1.2/user/-/sleep/date/"+year3_start+"/"+currentdate+".json",
            url: "https://api.fitbit.com/1.2/user/-/sleep/date/2016-12-16/2017-03-16.json",
            //url: "https://api.fitbit.com/1/user/3QCMLV/activities.json",
            headers: {
                'Content-Type': "application/json;encoding=utf-8",
                'Authorization': "Bearer " + accessToken
            }
        },
            function (err, resdata, sledata) {
                //console.log("see the start of the sleep date============");
                //console.log("sledata a year--------------------");
                //console.log(sledata);

                if (err) {
                    console.log(err);
                    return callback({}, req, res);
                }
                if (resdata.statusCode != 200) {
                    //console.log(resdata);
                    return callback({}, req, res);
                }
                if (sledata.error) {
                    //console.log(sledata);
                    return callback({}, req, res);
                }

                var jsonContent = JSON.parse(sledata);

                var len = jsonContent.sleep.length;
                //console.log(jsonContent.sleep[0]);
                for (var i = 0; i < len; i++) {
                    temp_result[jsonContent.sleep[i].dateOfSleep] = parseFloat(jsonContent.sleep[i].efficiency);

                }
                //console.log("Sleep From 2016-12-16 to 2017-03-16: the temp_result is:==========");
                //console.log(temp_result);

                http.get({
                    //url: "https://api.fitbit.com/1.2/user/-/sleep/date/"+currentdate+".json",
                    //url: "https://api.fitbit.com/1.2/user/-/sleep/date/"+year6_start+"/"+year3_end+".json",
                    url: "https://api.fitbit.com/1.2/user/-/sleep/date/2017-03-17/2017-06-17.json",
                    //url: "https://api.fitbit.com/1/user/3QCMLV/activities.json",
                    headers: {
                        'Content-Type': "application/json;encoding=utf-8",
                        'Authorization': "Bearer " + accessToken
                    }
                },
                    function (err, resdata, sledata) {
                        //console.log("see the second states of sleep============");
                        //console.log(sledata);
                        if (err) {
                            //console.log(err);
                            return callback({}, req, res);
                        }
                        if (resdata.statusCode != 200) {
                            //console.log(resdata);
                            return callback({}, req, res);
                        }
                        if (sledata.error) {
                            //console.log(sledata);
                            return callback({}, req, res);
                        }
                        var jsonContent = JSON.parse(sledata);
                        var len = jsonContent.sleep.length;
                        //console.log(jsonContent.sleep[0]);
                        for (var i = 0; i < len; i++) {
                            temp_result[jsonContent.sleep[i].dateOfSleep] = parseFloat(jsonContent.sleep[i].efficiency);
                        }
                        //console.log("Sleep From 2016-03-17 to 2017-06-17: the temp_result is:==========");
                        //console.log(temp_result);

                        http.get({
                            //url: "https://api.fitbit.com/1.2/user/-/sleep/date/"+currentdate+".json",
                            //url: "https://api.fitbit.com/1.2/user/-/sleep/date/"+year9_start+"/"+year6_end+".json",
                            url: "https://api.fitbit.com/1.2/user/-/sleep/date/2017-06-18/2017-09-18.json",
                            //url: "https://api.fitbit.com/1/user/3QCMLV/activities.json",
                            headers: {
                                'Content-Type': "application/json;encoding=utf-8",
                                'Authorization': "Bearer " + accessToken
                            }
                        },
                            function (err, resdata, sledata) {
                                //console.log("see the third stages of the sleep==========");
                                //console.log(sledata);
                                if (err) {
                                    console.log(err);
                                    return callback({}, req, res);
                                }
                                if (resdata.statusCode != 200) {
                                    //console.log(resdata);
                                    return callback({}, req, res);
                                }
                                if (sledata.error) {
                                    //console.log(sledata);
                                    return callback({}, req, res);
                                }
                                var jsonContent = JSON.parse(sledata);
                                var len = jsonContent.sleep.length;
                                //console.log(jsonContent.sleep[0]);
                                for (var i = 0; i < len; i++) {
                                    temp_result[jsonContent.sleep[i].dateOfSleep] = parseFloat(jsonContent.sleep[i].efficiency);
                                }
                                //console.log("Sleep From 2016-06-18 to 2017-09-18: the temp_result is:==========");
                                //console.log(temp_result);

                                http.get({
                                    //url: "https://api.fitbit.com/1.2/user/-/sleep/date/"+currentdate+".json",
                                    //url: "https://api.fitbit.com/1.2/user/-/sleep/date/"+lastyear+"/"+year9_end+".json",
                                    url: "https://api.fitbit.com/1.2/user/-/sleep/date/2017-09-19/2017-11-25.json",
                                    //url: "https://api.fitbit.com/1/user/3QCMLV/activities.json",
                                    headers: {
                                        'Content-Type': "application/json;encoding=utf-8",
                                        'Authorization': "Bearer " + accessToken
                                    }
                                },
                                    function (err, resdata, sledata) {
                                        //console.log(sledata);
                                        if (err) {
                                            console.log(err);
                                            return callback({}, req, res);
                                        }
                                        if (resdata.statusCode != 200) {
                                            //console.log(resdata);
                                            return callback({}, req, res);
                                        }
                                        if (sledata.error) {
                                            //console.log(sledata);
                                            return callback({}, req, res);
                                        }
                                        var jsonContent = JSON.parse(sledata);
                                        var len = jsonContent.sleep.length;

                                        for (var i = 0; i < len; i++) {
                                            temp_result[jsonContent.sleep[i].dateOfSleep] = parseFloat(jsonContent.sleep[i].efficiency);
                                        }
                                        //calculate the mean of the sleep efficiency
                                        var total = 0, i = 0;
                                        var tempSleep = [];
                                        for (var key in temp_result) {
                                            tempSleep[i] = temp_result[key];
                                            total += tempSleep[i];
                                            i += 1;
                                        }
                                        var average = total / tempSleep.length;

                                        for (var key in yearStep) {
                                            if (key == "2016-12-15") {
                                                continue;
                                            };
                                            if (!temp_result.hasOwnProperty(key)) {
                                                //console.log("which key is not in the activities?");
                                                //console.log(key);
                                                temp_result[key] = average;
                                            }

                                        }

                                        //sort the sleep efficiency sleep date according to the activities order and extract all the values from the object

                                        var dateofSleep = [];

                                        for (var date in temp_result) {
                                            dateofSleep.push(date);

                                        }
                                        dateofSleep.sort();
                                        //console.log("sorted the sleep date and the lenghth of the sleep data yearly=================");

                                        //console.log(dateofSleep);
                                        //console.log(dateofSleep.length);
                                        var poor = 0;
                                        var fair = 0;
                                        var good = 0;



                                        var sleepDate = [];

                                        for (var m = 0; m < dateofSleep.length; m++) {
                                            var d = dateofSleep[m];
                                            sleepDate[m] = d;
                                            yearSleepE[m] = temp_result[d];
                                            yearSleepNum[m] = temp_result[d];


                                            //console.log(yearSleepNum[m]);
                                            //console.log(d, yearSleepE[d]);
                                            if (temp_result[d] > 97) {
                                                yearSleEffi[m] = 'good';
                                                yearSleBinary[m] = 1;
                                                good++;
                                            }
                                            else if (temp_result[d] > 93 && temp_result[d] <= 97) {
                                                yearSleEffi[m] = 'fair';
                                                yearSleBinary[m] = -1;
                                                fair++;

                                            }
                                            else {
                                                yearSleEffi[m] = 'poor';
                                                yearSleBinary[m] = -1;
                                                poor++;
                                            }

                                        }
                                        sleepcategory = [poor, fair, good];
                                        console.log("Year Sleep Data Is Ready Now, Click the Machine Learning Module to Do Prediction***********");
                                        console.log("good, fair, poor = ");
                                        console.log(good);
                                        console.log(fair);
                                        console.log(poor);

                                        //alert = "Ready";

                                        return callback(yearSleEffi, req, res);
                                    });
                            });
                    });

            });
    }
    refreshTokens.refreshFitbitToken(user._id, afterTokenRefresh);
}

//Minutes Very Active=====================================================
//Get Yearly Vary Minutes Active==========================================

exports.yearVery = function (user, callback, req, res) {
    var afterTokenRefresh = function (accessToken) {
        //console.log('here');
        var now = new Date();
        var month = now.getMonth() + 1;
        var today_date = now.getDate() - 2;
        var currentdate = now.getFullYear() + "-" + month + "-" + today_date;
        //var startdate = now.getFullYear() + "-" + now.getMonth() + "-" + today_date;
        http.get({
            //url: "https://api.fitbit.com/1.2/user/-/activities/minutesVeryActive/date/"+currentdate+"/1y.json",
            //url: "https://api.fitbit.com/1.2/user/-/sleep/date/2016-12-15/2017-11-24.json",
            url: "https://api.fitbit.com/1.2/user/-/activities/minutesVeryActive/date/2016-12-15/2017-11-24.json",
            //url: "https://api.fitbit.com/1/user/3QCMLV/activities.json",
            headers: {
                'Content-Type': "application/json;encoding=utf-8",
                'Authorization': "Bearer " + accessToken
            }
        },
            function (err, resdata, verydata) {
                //console.log("verydata=================compare with sleep date");
                //console.log(verydata);

                if (err) {
                    console.log(err);
                    return callback({}, req, res);
                }
                if (resdata.statusCode != 200) {
                    //console.log(verydata);
                    return callback({}, req, res);
                }
                if (verydata.error) {
                    //console.log(verydata);
                    return callback({}, req, res);
                }
                //console.log("verydata a year ---------------------------------");
                //console.log(verydata);
                var sss = verydata.toString();
                sss = sss.replace(/activities-minutesVeryActive/, "very");
                var jsonContent = JSON.parse(sss);

                var len = jsonContent.very.length;
                //console.log(jsonContent.sleep[0]);

                //var yearVery = [];
                for (var i = 0; i < len; i++) {
                    yearVery[jsonContent.very[i].dateTime] = parseInt(jsonContent.very[i].value);
                }

                //var len = jsonContent.very.length;
                for (var i = 0; i < len; i++) {
                    yearVeryActive[i] = parseInt(jsonContent.very[i].value);
                }
                console.log("is ready for yearVery **********************************************");
                return callback(verydata, req, res);
            });
    }
    refreshTokens.refreshFitbitToken(user._id, afterTokenRefresh);
}
//Minutes Fairly Active=====================================================
//Get Yearly Fairly Minutes Active==========================================

exports.yearFair = function (user, callback, req, res) {
    var afterTokenRefresh = function (accessToken) {
        //console.log('here');
        var now = new Date();
        var month = now.getMonth() + 1;
        var today_date = now.getDate() - 2;
        var currentdate = now.getFullYear() + "-" + month + "-" + today_date;
        //var startdate = now.getFullYear() + "-" + now.getMonth() + "-" + today_date;
        http.get({
            //url: "https://api.fitbit.com/1.2/user/-/activities/minutesFairlyActive/date/"+currentdate+"/1y.json",
            url: "https://api.fitbit.com/1.2/user/-/activities/minutesFairlyActive/date/2016-12-15/2017-11-24.json",
            //url: "https://api.fitbit.com/1/user/3QCMLV/activities.json",
            headers: {
                'Content-Type': "application/json;encoding=utf-8",
                'Authorization': "Bearer " + accessToken
            }
        },
            function (err, resdata, fairdata) {
                //console.log(fairdata);

                if (err) {
                    console.log(err);
                    return callback({}, req, res);
                }
                if (resdata.statusCode != 200) {
                    //console.log(fairdata);
                    return callback({}, req, res);
                }
                if (fairdata.error) {
                    //console.log(fairdata);
                    return callback({}, req, res);
                }
                console.log("fairdata a year ---------------------------------");
                //console.log(fairdata);
                var sss = fairdata.toString();
                sss = sss.replace(/activities-minutesFairlyActive/, "fair");
                var jsonContent = JSON.parse(sss);

                var len = jsonContent.fair.length;

                for (var i = 0; i < len; i++) {
                    yearFair[jsonContent.fair[i].dateTime] = parseInt(jsonContent.fair[i].value);
                }


                for (var i = 0; i < len; i++) {
                    yearFairActive[i] = parseInt(jsonContent.fair[i].value);
                }
                console.log("yearfair:====-----------------");
                //console.log(yearLightActive);
                //console.log("---------------");
                //console.log(jsonContent.yearstep[100].value);
                //yearlySteps = fairdata;
                console.log("is ready for yearFair **********************************************");
                return callback(fairdata, req, res);
            });

    }
    refreshTokens.refreshFitbitToken(user._id, afterTokenRefresh);
}


//Minutes Lightly Active=====================================================
//Get Yearly Lightly Minutes Active==========================================

exports.yearLight = function (user, callback, req, res) {
    var afterTokenRefresh = function (accessToken) {
        //console.log('here');
        var now = new Date();
        var month = now.getMonth() + 1;
        var today_date = now.getDate() - 2;

        var currentdate = now.getFullYear() + "-" + month + "-" + today_date;
        //var endate = setDate(currentdate - 344);
        //var startdate = now.getFullYear() + "-" + now.getMonth() + "-" + today_date;
        http.get({
            //url: "https://api.fitbit.com/1.2/user/-/activities/minutesLightlyActive/date/"+currentdate+"/344d.json",
            url: "https://api.fitbit.com/1.2/user/-/activities/minutesLightlyActive/date/2016-12-15/2017-11-24.json",

            //url: "https://api.fitbit.com/1.2/user/-/sleep/date/2017-04-02/2017-04-08.json",
            //url: "https://api.fitbit.com/1/user/3QCMLV/activities.json",
            headers: {
                'Content-Type': "application/json;encoding=utf-8",
                'Authorization': "Bearer " + accessToken
            }
        },
            function (err, resdata, lightdata) {


                if (err) {
                    console.log(err);
                    return callback({}, req, res);
                }
                if (resdata.statusCode != 200) {
                    //console.log(lightdata);
                    return callback({}, req, res);
                }
                if (lightdata.error) {
                    //console.log(lightdata);
                    return callback({}, req, res);
                }
                console.log("lightdata a year ---------------------------------");
                //console.log(lightdata);
                var sss = lightdata.toString();
                sss = sss.replace(/activities-minutesLightlyActive/, "yearlight");
                var jsonContent = JSON.parse(sss);

                var len = jsonContent.yearlight.length;


                for (var i = 0; i < len; i++) {
                    yearLight[jsonContent.yearlight[i].dateTime] = parseInt(jsonContent.yearlight[i].value);
                }
                for (var i = 0; i < len; i++) {
                    yearLightActive[i] = parseInt(jsonContent.yearlight[i].value);

                }
                console.log("yearlight:====-----------------");
                //console.log(yearLightActive);
                //console.log("---------------");
                //console.log(jsonContent.yearstep[100].value);
                //yearlySteps = lightdata;
                console.log("is ready for yearLight **********************************************");
                return callback(lightdata, req, res);


            });

    }
    refreshTokens.refreshFitbitToken(user._id, afterTokenRefresh);
}



//Minutes Sedentary==========================================================
//Get Yearly Minutes Sedentary===============================(machine learning)

exports.yearSed = function (user, callback, req, res) {
    var afterTokenRefresh = function (accessToken) {
        //console.log('here');
        var now = new Date();
        var month = now.getMonth() + 1;
        var today_date = now.getDate() - 2;
        var currentdate = now.getFullYear() + "-" + month + "-" + today_date;
        //var startdate = now.getFullYear() + "-" + now.getMonth() + "-" + today_date;
        http.get({
            //url: "https://api.fitbit.com/1.2/user/-/activities/minutesSedentary/date/"+currentdate+"/1y.json",
            url: "https://api.fitbit.com/1.2/user/-/activities/minutesSedentary/date/2016-12-15/2017-11-24.json",
            //url: "https://api.fitbit.com/1/user/3QCMLV/activities.json",
            headers: {
                'Content-Type': "application/json;encoding=utf-8",
                'Authorization': "Bearer " + accessToken
            }
        },
            function (err, resdata, seddata) {
                //console.log(seddata);

                if (err) {
                    console.log(err);
                    return callback({}, req, res);
                }
                if (resdata.statusCode != 200) {
                    //console.log(seddata);
                    return callback({}, req, res);
                }
                if (seddata.error) {
                    //console.log(seddata);
                    return callback({}, req, res);
                }
                console.log("seddata a year ---------------------------------");
                //console.log(seddata);
                var sss = seddata.toString();
                sss = sss.replace(/activities-minutesSedentary/, "yearsed");
                var jsonContent = JSON.parse(sss);

                var len = jsonContent.yearsed.length;


                for (var i = 0; i < len; i++) {
                    yearMS[jsonContent.yearsed[i].dateTime] = parseInt(jsonContent.yearsed[i].value);
                }

                for (var i = 0; i < len; i++) {
                    yearMinSed[i] = parseInt(jsonContent.yearsed[i].value);

                }
                //console.log("yearSed:====-----------------");
                //console.log(yearMinSed);
                //console.log("---------------");
                //console.log(jsonContent.yearstep[100].value);
                //yearlySteps = seddata;
                console.log("is ready for yearSed **********************************************");
                return callback(seddata, req, res);
            });

    }
    refreshTokens.refreshFitbitToken(user._id, afterTokenRefresh);
}


//floors==========================================================
//Get Yearly Floors===============================(machine learning)

exports.yearFlo = function (user, callback, req, res) {
    var afterTokenRefresh = function (accessToken) {
        //console.log('here');
        var now = new Date();
        var month = now.getMonth() + 1;
        var today_date = now.getDate() - 2;
        var currentdate = now.getFullYear() + "-" + month + "-" + today_date;
        //var startdate = now.getFullYear() + "-" + now.getMonth() + "-" + today_date;
        http.get({
            //url: "https://api.fitbit.com/1.2/user/-/activities/floors/date/"+currentdate+"/1y.json",
            url: "https://api.fitbit.com/1.2/user/-/activities/floors/date/2016-12-15/2017-11-24.json",
            //url: "https://api.fitbit.com/1/user/3QCMLV/activities.json",
            headers: {
                'Content-Type': "application/json;encoding=utf-8",
                'Authorization': "Bearer " + accessToken
            }
        },
            function (err, resdata, flodata) {
                //console.log(flodata);

                if (err) {
                    console.log(err);
                    return callback({}, req, res);
                }
                if (resdata.statusCode != 200) {
                    //console.log(flodata);
                    return callback({}, req, res);
                }
                if (flodata.error) {
                    console.log(flodata);
                    return callback({}, req, res);
                }
                console.log("flodata a year ---------------------------------");
                //console.log(flodata);
                var sss = flodata.toString();
                sss = sss.replace(/activities-floors/, "yearflo");
                var jsonContent = JSON.parse(sss);

                var len = jsonContent.yearflo.length;


                for (var i = 0; i < len; i++) {
                    yearFlo[jsonContent.yearflo[i].dateTime] = parseInt(jsonContent.yearflo[i].value);
                }

                for (var i = 0; i < len; i++) {
                    yearFloArray[i] = parseInt(jsonContent.yearflo[i].value);

                }
                console.log("yearFlo:====-----------------");
                //console.log(yearDisArray);
                //console.log("---------------");
                //console.log(jsonContent.yearstep[100].value);
                //yearlySteps = flodata;
                console.log("is ready for yearFlo **********************************************");
                return callback(flodata, req, res);
            });

    }
    refreshTokens.refreshFitbitToken(user._id, afterTokenRefresh);
}

//Distance year==========================================================
//Get Yearly Distance==============================(machine learning)

exports.yearDis = function (user, callback, req, res) {
    var afterTokenRefresh = function (accessToken) {
        //console.log('here');
        var now = new Date();
        var month = now.getMonth() + 1;
        var today_date = now.getDate() - 2;
        var currentdate = now.getFullYear() + "-" + month + "-" + today_date;
        //var startdate = now.getFullYear() + "-" + now.getMonth() + "-" + today_date;
        http.get({
            //url: "https://api.fitbit.com/1.2/user/-/activities/distance/date/"+currentdate+"/1y.json",
            url: "https://api.fitbit.com/1.2/user/-/activities/distance/date/2016-12-15/2017-11-24.json",
            //url: "https://api.fitbit.com/1/user/3QCMLV/activities.json",
            headers: {
                'Content-Type': "application/json;encoding=utf-8",
                'Authorization': "Bearer " + accessToken
            }
        },
            function (err, resdata, disdata) {
                //console.log(disdata);

                if (err) {
                    console.log(err);
                    return callback({}, req, res);
                }
                if (resdata.statusCode != 200) {
                    //console.log(resdata);
                    return callback({}, req, res);
                }
                if (disdata.error) {
                    console.log(disdata);
                    return callback({}, req, res);
                }
                console.log("disdata a year ---------------------------------");
                //console.log(disdata);
                var sss = disdata.toString();
                sss = sss.replace(/activities-distance/, "yeardis");
                var jsonContent = JSON.parse(sss);

                var len = jsonContent.yeardis.length;


                for (var i = 0; i < len; i++) {
                    yearDis[jsonContent.yeardis[i].dateTime] = parseInt(jsonContent.yeardis[i].value);
                }

                for (var i = 0; i < len; i++) {
                    yearDisArray[i] = parseInt(jsonContent.yeardis[i].value);

                }
                //console.log("yearDisArray:====-----------------");
                //console.log(yearDisArray);
                //console.log("---------------");
                //console.log(jsonContent.yearstep[100].value);
                //yearlySteps = disdata;
                console.log("is ready for yearDis**********************************************");
                return callback(disdata, req, res);
            });

    }
    refreshTokens.refreshFitbitToken(user._id, afterTokenRefresh);
}


//Get Yearly Calories===============================(machine learning)

exports.yearCal = function (user, callback, req, res) {
    var afterTokenRefresh = function (accessToken) {
        //console.log('here');
        var now = new Date();
        var month = now.getMonth() + 1;
        var today_date = now.getDate() - 2;
        var currentdate = now.getFullYear() + "-" + month + "-" + today_date;
        //var startdate = now.getFullYear() + "-" + now.getMonth() + "-" + today_date;
        http.get({
            //url: "https://api.fitbit.com/1.2/user/-/activities/calories/date/"+currentdate+"/1y.json",
            url: "https://api.fitbit.com/1.2/user/-/activities/calories/date/2016-12-15/2017-11-24.json",
            //url: "https://api.fitbit.com/1/user/3QCMLV/activities.json",
            headers: {
                'Content-Type': "application/json;encoding=utf-8",
                'Authorization': "Bearer " + accessToken
            }
        },
            function (err, resdata, caldata) {
                //console.log(caldata);

                if (err) {
                    console.log(err);
                    return callback({}, req, res);
                }
                if (resdata.statusCode != 200) {
                    //console.log(resdata);
                    return callback({}, req, res);
                }
                if (caldata.error) {
                    // console.log(caldata);
                    return callback({}, req, res);
                }
                // console.log("calories a year ---------------------------------");
                //console.log(caldata);
                var sss = caldata.toString();
                sss = sss.replace(/activities-calories/, "yearcal");
                var jsonContent = JSON.parse(sss);

                var len = jsonContent.yearcal.length;



                for (var i = 0; i < len; i++) {
                    yearCal[jsonContent.yearcal[i].dateTime] = parseInt(jsonContent.yearcal[i].value);
                }

                for (var i = 0; i < len; i++) {
                    yearcalArray[i] = parseInt(jsonContent.yearcal[i].value);

                }
                console.log("yearcalArray:====-----------------");
                //console.log(yearcalArray);
                //console.log("---------------");
                //console.log(jsonContent.yearstep[100].value);
                //yearlySteps = caldata;
                console.log("is ready for yearCal **********************************************");
                return callback(caldata, req, res);
            });

    }
    refreshTokens.refreshFitbitToken(user._id, afterTokenRefresh);
}

//Get Yearly Steps===============================(machine learning)

exports.stepsMonth = function (user, callback, req, res) {
    var afterTokenRefresh = function (accessToken) {
        //console.log('here');
        var now = new Date();
        var month = now.getMonth() + 1;
        var today_date = now.getDate() - 2;
        var currentdate = now.getFullYear() + "-" + month + "-" + today_date;
        var startdate = now.getFullYear() + "-" + now.getMonth() + "-" + today_date;
        http.get({
            //url: "https://api.fitbit.com/1.2/user/-/activities/steps/date/"+currentdate+"/1y.json",
            url: "https://api.fitbit.com/1.2/user/-/activities/steps/date/2016-12-15/2017-11-24.json",
            //url: "https://api.fitbit.com/1/user/3QCMLV/activities.json",
            headers: {
                'Content-Type': "application/json;encoding=utf-8",
                'Authorization': "Bearer " + accessToken
            }
        },
            function (err, resdata, stepsdata) {

                //console.log(stepsdata);

                if (err) {
                    console.log(err);
                    return callback({}, req, res);
                }
                if (resdata.statusCode != 200) {
                    //console.log(resdata);
                    return callback({}, req, res);
                }
                if (stepsdata.error) {
                    //console.log(stepsdata);
                    return callback({}, req, res);
                }
                var sss = stepsdata.toString();
                sss = sss.replace(/activities-steps/, "yearstep");
                var jsonContent = JSON.parse(sss)
                //console.log("check my date from here:+++++++++++++++++++++++++++++++++");
                //.log(jsonContent.yearstep);
                var len = jsonContent.yearstep.length;

                for (var i = 0; i < len; i++) {
                    yearStep[jsonContent.yearstep[i].dateTime] = parseInt(jsonContent.yearstep[i].value);
                }

                for (var i = 0; i < len; i++) {
                    yearstepArray[i] = parseInt(jsonContent.yearstep[i].value);

                }
                //.log("yearstepArray:====-----------------------");
                //console.log(yearstepArray);
                //console.log("---------------");
                //console.log(jsonContent.yearstep[100].value);
                yearlySteps = stepsdata;
                console.log("is ready for yearSteps **********************************************");
                return callback(stepsdata, req, res);
            });

    }
    refreshTokens.refreshFitbitToken(user._id, afterTokenRefresh);
}

//Get today activites for ml analysis
exports.today = function (user, callback, req, res) {
    var afterTokenRefresh = function (accessToken) {
        //console.log('here');
        var now = new Date();
        var month = now.getMonth() + 1;
        var today_date = now.getDate() - 2;
        var currentdate = now.getFullYear() + "-" + month + "-" + today_date;
        var startdate = now.getFullYear() + "-" + now.getMonth() + "-" + today_date;
        http.post({
            url: "https://api.fitbit.com/1/user/-/activities/date/" + currentdate + ".json",
            //url: "https://api.fitbit.com/1/user/3QCMLV/activities.json",
            headers: {
                'Content-Type': "application/json;encoding=utf-8",
                'Authorization': "Bearer " + accessToken
            }
        },
            function (err, resdata, todaydata) {
                //console.log(stepsdata);

                var jsonContent = JSON.parse(todaydata);
                //console.log("print the activities for the today data");
                //console.log(jsonContent);
                if (err) {
                    //console.log(err);
                    return callback({}, req, res);
                }
                if (resdata.statusCode != 200) {
                    //console.log(resdata);
                    return callback({}, req, res);
                }
                if (todaydata.error) {
                    //console.log(stepsdata);
                    return callback({}, req, res);
                }

                try {
                    todaystep = parseInt(jsonContent.summary.steps);
                    todaycalori = parseInt(jsonContent.summary.caloriesOut);
                    todaydist = parseInt(jsonContent.summary.distances[0].distance);
                    todayfloor = parseInt(jsonContent.summary.floors);
                    todaysendent = parseInt(jsonContent.summary.sedentaryMinutes);
                    todaylight = parseInt(jsonContent.summary.lightlyActiveMinutes);
                    todayfairly = parseInt(jsonContent.summary.fairlyActiveMinutes);
                    todayvery = parseInt(jsonContent.summary.veryActiveMinutes);
                    //console.log("steps, calories, distance, floors, sedmin, lightactive, fairactive, veryactive");
                    //console.log(stepsM, caloriesM, distanceM, floorsM, sedminM, lightactiveM, fairactiveM, veryactiveM);
                    todayAct = [todaystep, todaycalori, todaydist, todayfloor, todaysendent, todaylight, todayfairly, todayvery];
                    console.log(todayAct);
                    //var stepsAVG = stepsdata.bucket[0].dataset[1].point[0].value[0].fpVal;
                } catch (err) {
                    console.log(err);
                    return callback({}, req, res);
                }
                return callback([], req, res);
            });
    }
    refreshTokens.refreshFitbitToken(user._id, afterTokenRefresh);
}


//=================================Below are for dashboard figures





// GET STEPS FOR TODAY
exports.steps24 = function (user, callback, req, res) {
    today = new Date();
    goal = 0;
    if (user.goals.steps) goal = user.goals.steps;
    var chartData = {
        type: 'bar',
        data: {
            labels: ['Today'],
            datasets: [{
                label: 'Steps',
                backgroundColor: '#FFFACD',
                borderColor: '#FFDAB9',
                borderWidth: 2,
                data: [-1]
            }, {
                label: 'Goal',
                backgroundColor: '#9368E9',
                borderColor: '#6B49AF',
                borderWidth: 2,
                data: [goal]
            }]
        }
    };
    FHIR_model.FHIR.findOne({ 'subject.reference': user.local.email, 'id': "daily-steps", 'issued': today.toISOString().substring(0, 10) }, function (err, fhir) {
        if (err) {
            console.log(err);
            return callback({}, req, res);
        }
        if (fhir) {
            chartData["data"]["datasets"][0]["data"] = [fhir.valueQuantity.value];
            return callback(chartData, req, res);
        }
        else {
            var afterTokenRefresh = function (accessToken) {
                if (accessToken == '') {
                    console.log('Could Not Refresh fitbit Token');
                    //alert("Hello! I am an alert box!!");
                    return callback({}, req, res);
                }
                // console.log('hi Lindsay');
                // here after is not visited!!!!
                var now = new Date();
                var month = now.getMonth() + 1;
                var today_date = now.getDate() -1;
                var currentdate = now.getFullYear() + "-" + month + "-" + today_date;
                var midnight = new Date();
                midnight.setHours(0, 0, 0, 0);
                /*        now = now.getTime();
                        midnight = midnight.getTime();*/
                console.log("today is : " + currentdate);
                http.post({
                    url: "https://api.fitbit.com/1/user/-/activities/date/" + currentdate + ".json",
                    //url: "https://api.fitbit.com/1/user/3QCMLV/activities.json",
                    headers: {
                        'Content-Type': "application/json;encoding=utf-8",
                        'Authorization': "Bearer " + accessToken
                    }
                },
                    function (err, resdata, stepsdata) {
                        //console.log(stepsdata);
                        steps_data = stepsdata;
                        var jsonContent = JSON.parse(stepsdata);
                        //console.log("print the activities for the today data");
                        //console.log(jsonContent);
                        if (err) {
                            //console.log(err);
                            return callback({}, req, res);
                        }
                        if (resdata.statusCode != 200) {
                            //console.log(resdata);
                            return callback({}, req, res);
                        }
                        if (stepsdata.error) {
                            //console.log(stepsdata);
                            return callback({}, req, res);
                        }

                        try {
                            todaystep = parseInt(jsonContent.summary.steps);
                            todaycalori = parseInt(jsonContent.summary.caloriesOut);
                            todaydist = parseInt(jsonContent.summary.distances[0].distance);
                            todayfloor = parseInt(jsonContent.summary.floors);
                            todaysendent = parseInt(jsonContent.summary.sedentaryMinutes);
                            todaylight = parseInt(jsonContent.summary.lightlyActiveMinutes);
                            todayfairly = parseInt(jsonContent.summary.fairlyActiveMinutes);
                            todayvery = parseInt(jsonContent.summary.veryActiveMinutes);
                            //console.log("steps, calories, distance, floors, sedmin, lightactive, fairactive, veryactive");
                            /* console.log(stepsM, caloriesM, distanceM, floorsM, sedminM, lightactiveM, fairactiveM, veryactiveM);
                             todayAct = [todaystep, todaycalori, todaydist, todayfloor, todaysendent, todaylight, todayfairly, todayvery];
                             console.log(todayAct);*/
                            //var stepsAVG = stepsdata.bucket[0].dataset[1].point[0].value[0].fpVal;
                        } catch (err) {
                            console.log(err);
                            return callback({}, req, res);
                        }
                        return callback([], req, res);
                    });
            }
            // will enter this and below
            refreshTokens.refreshFitbitToken(user._id, afterTokenRefresh);
        }
    });

}


//GET today's sleep
exports.stepDist = function (user, callback, req, res) {
    var afterTokenRefresh = function (accessToken) {
        //console.log('here');
        var now = new Date();
        var month = now.getMonth() + 1;
        var today_date = now.getDate() -1;
        var currentdate = now.getFullYear() + "-" + month + "-" + today_date;
        http.post({
            url: "https://api.fitbit.com/1.2/user/-/sleep/date/" + currentdate + ".json",
            //url: "https://api.fitbit.com/1/user/3QCMLV/activities.json",
            headers: {
                'Content-Type': "application/json;encoding=utf-8",
                'Authorization': "Bearer " + accessToken
            }
        },
            function (err, resdata, stepsdata) {
                //console.log(stepsdata);
                var jsonContent = JSON.parse(stepsdata);
                if (err) {
                    console.log(err);
                    return callback({}, req, res);
                }
                if (resdata.statusCode != 200) {
                    //console.log(resdata);
                    return callback({}, req, res);
                }
                if (stepsdata.error) {
                    console.log(stepsdata);
                    return callback({}, req, res);
                }
                todaysleepE = parseInt(jsonContent.sleep[0].efficiency);
                todayminutesAsleep = parseInt(jsonContent.sleep[0].minutesAsleep);
                todayminutesToFallAsleep = parseInt(jsonContent.sleep[0].minutesToFallAsleep);
                todaytimeInBed = parseInt(jsonContent.sleep[0].timeInBed);
                return callback([], req, res)
            });

    }
    refreshTokens.refreshFitbitToken(user._id, afterTokenRefresh);
}

// get all data for today, dashboard display
exports.todaystep = function (user, callback, req, res) {
    var chartData = {
        type: 'bar',
        data: {
            labels: ['Today'],
            datasets: [{
                label: 'Steps',
                backgroundColor: '#FFFACD',
                borderColor: '#FFDAB9',
                borderWidth: 2,
                data: [-1]
            }, {
                label: 'Goal',
                backgroundColor: '#9368E9',
                borderColor: '#6B49AF',
                borderWidth: 2,
                data: [goal]
            }]
        }
    };
    chartData["data"]["datasets"][0]["data"] = [todaystep];
    return callback(chartData, req, res);
}

// get all data for today, dashboard display
exports.todaysleep = function (user, callback, req, res) {
    var steps = [todaysleepE, todayminutesAsleep, todayminutesToFallAsleep, todaytimeInBed]

    graphData = {

        type: 'doughnut',
        data: {
            labels: ['sleepEfficiency(%)', 'minutesAsleep', 'minutesToFallAsleep', 'timeInBed'],
            datasets: [
                {
                    backgroundColor: ['#FFFACD', '#f75c56', '#1e7ca8', '#469633'],
                    borderColor: '#FFDAB9',
                    borderWidth: 2,
                    data: steps,
                }]
        },
        options: {
            responsive: true,
            legend: {
                display: true,
            },
            scale: {
                ticks: {
                    beginAtZero: true
                },
                reverse: false
            },
            animation: {
                animateRotate: false,
                animateScale: true
            }
        }
    };

    return callback(graphData, req, res)
}

// get all data for today, dashboard display
exports.todayactivity = function (user, callback, req, res) {
    var steps = [todaylight, todayfairly, todayvery];
    graphData = {

        type: 'pie',
        data: {
            labels: ['light active minutes', 'fairly active minutes', 'very active minutes'],
            datasets: [
                {
                    backgroundColor: ['#72b4f9', '#1d4299', '#9e641e'],
                    borderColor: '#FFDAB9',
                    borderWidth: 2,
                    data: steps,
                }]
        },
        options: {
            responsive: true,
            legend: {
                display: true,
            }
        }
    };

    return callback(graphData, req, res)
}




// get all data for today, dashboard display
exports.todaydata = function (user, callback, req, res) {
    return [todaystep, todaydist, todayfloor, todaylight, todayfairly, todayvery, todaysendent, todaycalori, todaysleepE, todayminutesAsleep, todayminutesToFallAsleep, todaytimeInBed];
}

// get all data for yearly, dashboard display
exports.yearlydata = function (user, callback, req, res) {
    function ave(arr) {
        var sum = 0;
        for (var i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
        return parseInt(sum / arr.length);
    }

    monthlyStep = [ave(yearstepArray.slice(16,47)),ave(yearstepArray.slice(47,75)),ave(yearstepArray.slice(75,106)),ave(yearstepArray.slice(106,136)),
        ave(yearstepArray.slice(136,167)),ave(yearstepArray.slice(167,197)),ave(yearstepArray.slice(197,228)),ave(yearstepArray.slice(228,259)),
        ave(yearstepArray.slice(259,289)),ave(yearstepArray.slice(289,320)),ave(yearstepArray.slice(320,350))];
    monthlyDis = [ave(yearDisArray.slice(16,47)),ave(yearDisArray.slice(47,75)),ave(yearDisArray.slice(75,106)),ave(yearDisArray.slice(106,136)),
        ave(yearDisArray.slice(136,167)),ave(yearDisArray.slice(167,197)),ave(yearDisArray.slice(197,228)),ave(yearDisArray.slice(228,259)),
        ave(yearDisArray.slice(259,289)),ave(yearDisArray.slice(289,320)),ave(yearDisArray.slice(320,350))];
    monthlyFlo = [ave(yearFloArray.slice(16,47)),ave(yearFloArray.slice(47,75)),ave(yearFloArray.slice(75,106)),ave(yearFloArray.slice(106,136)),
        ave(yearFloArray.slice(136,167)),ave(yearFloArray.slice(167,197)),ave(yearFloArray.slice(197,228)),ave(yearFloArray.slice(228,259)),
        ave(yearFloArray.slice(259,289)),ave(yearFloArray.slice(289,320)),ave(yearFloArray.slice(320,350))];
    monthlyLight = [ave(yearLightActive.slice(16,47)),ave(yearLightActive.slice(47,75)),ave(yearLightActive.slice(75,106)),ave(yearLightActive.slice(106,136)),
        ave(yearLightActive.slice(136,167)),ave(yearLightActive.slice(167,197)),ave(yearLightActive.slice(197,228)),ave(yearLightActive.slice(228,259)),
        ave(yearLightActive.slice(259,289)),ave(yearLightActive.slice(289,320)),ave(yearLightActive.slice(320,350))];
    monthlyFair = [ave(yearFairActive.slice(16,47)),ave(yearFairActive.slice(47,75)),ave(yearFairActive.slice(75,106)),ave(yearFairActive.slice(106,136)),
        ave(yearFairActive.slice(136,167)),ave(yearFairActive.slice(167,197)),ave(yearFairActive.slice(197,228)),ave(yearFairActive.slice(228,259)),
        ave(yearFairActive.slice(259,289)),ave(yearFairActive.slice(289,320)),ave(yearFairActive.slice(320,350))];
    monthlyVery = [ave(yearVeryActive.slice(16,47)),ave(yearVeryActive.slice(47,75)),ave(yearVeryActive.slice(75,106)),ave(yearVeryActive.slice(106,136)),
        ave(yearVeryActive.slice(136,167)),ave(yearVeryActive.slice(167,197)),ave(yearVeryActive.slice(197,228)),ave(yearVeryActive.slice(228,259)),
        ave(yearVeryActive.slice(259,289)),ave(yearVeryActive.slice(289,320)),ave(yearVeryActive.slice(320,350))];
    monthlySed = [ave(yearMinSed.slice(16,47)),ave(yearMinSed.slice(47,75)),ave(yearMinSed.slice(75,106)),ave(yearMinSed.slice(106,136)),
        ave(yearMinSed.slice(136,167)),ave(yearMinSed.slice(167,197)),ave(yearMinSed.slice(197,228)),ave(yearMinSed.slice(228,259)),
        ave(yearMinSed.slice(259,289)),ave(yearMinSed.slice(289,320)),ave(yearMinSed.slice(320,350))];
    monthlyCal = [ave(yearcalArray.slice(16,47)),ave(yearcalArray.slice(47,75)),ave(yearcalArray.slice(75,106)),ave(yearcalArray.slice(106,136)),
        ave(yearcalArray.slice(136,167)),ave(yearcalArray.slice(167,197)),ave(yearcalArray.slice(197,228)),ave(yearcalArray.slice(228,259)),
        ave(yearcalArray.slice(259,289)),ave(yearcalArray.slice(289,320)),ave(yearcalArray.slice(320,350))];
    monthlySleEffi = [ave(yearSleepE.slice(16,47)),ave(yearSleepE.slice(47,75)),ave(yearSleepE.slice(75,106)),ave(yearSleepE.slice(106,136)),
        ave(yearSleepE.slice(136,167)),ave(yearSleepE.slice(167,197)),ave(yearSleepE.slice(197,228)),ave(yearSleepE.slice(228,259)),
        ave(yearSleepE.slice(259,289)),ave(yearSleepE.slice(289,320)),ave(yearSleepE.slice(320,350))];

    return [ave(monthlyStep), ave(monthlyDis), ave(monthlyFlo), ave(monthlyLight),
    ave(monthlyFair), ave(monthlyVery), ave(monthlySed),
    ave(monthlyCal), ave(monthlySleEffi)];
}

// picture for steps
exports.activyearPic = function (user, callback, req, res) {
    var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October"];
    var config = {
        type: 'bar',
        data: {
            labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October"],
            datasets: [{
                type: 'line',
                yAxisID: "y-axis-1",
                label: "Light Activity",
                backgroundColor: "#549bff",
                borderColor: "#0065f4",
                data: monthlyLight,
                fill: false,
            },{
                type: 'line',
                yAxisID: "y-axis-1",
                label: "Fairly Activity",
                backgroundColor: "#6ef4cc",
                borderColor: "#00c98d",
                data: monthlyFair,
                fill: false,
            },{
                type: 'line',
                yAxisID: "y-axis-1",
                label: "Very Activity",
                backgroundColor: "#cc75ff",
                borderColor: "#5a008e",
                data: monthlyVery,
                fill: false,
            },{
                type: 'bar',
                yAxisID: "y-axis-2",
                label: "Sleep Efficiency",
                backgroundColor: "#e0e2b2",
                borderColor: "#000000",
                data: monthlySleEffi,
                fill: false,
            }]
        },
        options: {
            responsive: true,
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Month'
                    }
                }],
                yAxes: [{
                    type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: "left",
                    id: "y-axis-1",
                    ticks: {
                        beginAtZero: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Minutes'
                    },
                }, {
                    type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: "right",
                    id: "y-axis-2",
                    gridLines: {
                        drawOnChartArea: false
                    },scaleLabel: {
                        display: true,
                        labelString: 'Sleep Efficiency(%)'
                    },
                    ticks: {
                        beginAtZero: false
                    }
                }],
            }
        }
    };
    return callback(config, req, res)
}

// picture for steps
exports.sleepyearPic = function (user, callback, req, res) {
    var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October"];
    var config = {
        type: 'bar',
        data: {
            labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October"],
            datasets: [{
                label: "Monthly sleep efficiency",
                backgroundColor: "#7ccfff",
                borderColor: "#705900",
                data: monthlySleEffi,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Sleep Efficiency(%)'
                    },
                    ticks: {
                        beginAtZero: false
                    }
                }]
            }
        }
    };
    return callback(config, req, res)
}


// picture for steps
exports.stepyearPic = function (user, callback, req, res) {
    var barChartData = {
        labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October"],
        datasets: [{
            label: 'Steps',
            borderColor: "#f7c709",
            yAxisID: "y-axis-1",
            data: monthlyStep,
            fill: false,
        }, {
            label: 'Sleep Efficiency',
            borderColor: "#ff5947",
            yAxisID: "y-axis-2",
            data: monthlySleEffi,
            fill: false,
        }]

    };
    var config = {
        type: 'line',
        data: barChartData,
        options: {
            responsive: true,
            tooltips: {
                mode: 'index',
                intersect: true
            },
            scales: {
                yAxes: [{
                    type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: "left",
                    id: "y-axis-1",
                    scaleLabel: {
                        display: true,
                        labelString: 'Steps'
                    },
                    ticks: {
                        beginAtZero: false
                    }
                }, {
                    type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: "right",
                    id: "y-axis-2",
                    gridLines: {
                        drawOnChartArea: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Sleep Efficiency(%)'
                    },
                    ticks: {
                        beginAtZero: false
                    }
                }],
            }
        }
    };
    return callback(config, req, res)
}

// picture for steps
exports.calyearPic = function (user, callback, req, res) {
    var scatterChartData = {
        datasets: [{
            label: "Sleep vs Steps",
            borderColor: "#FFFFFF",
            backgroundColor: "#2861ff",
            fill: false,
            showLine: false,
            radius: 4,
            data: [{
                x: monthlyCal[0],
                y: monthlySleEffi[0],
            }, {
                x: monthlyCal[1],
                y: monthlySleEffi[1],
            }, {
                x: monthlyCal[2],
                y: monthlySleEffi[2],
            }, {
                x: monthlyCal[3],
                y: monthlySleEffi[3],
            }, {
                x: monthlyCal[4],
                y: monthlySleEffi[4],
            }, {
                x: monthlyCal[5],
                y: monthlySleEffi[5],
            }, {
                x: monthlyCal[6],
                y: monthlySleEffi[6],
            }, {
                x: monthlyCal[7],
                y: monthlySleEffi[7],
            }, {
                x: monthlyCal[8],
                y: monthlySleEffi[8],
            }, {
                x: monthlyCal[9],
                y: monthlySleEffi[9],
            }]
        },{
            label: "Trendline",
            borderColor: "#000000",
            borderDash: [5,5],
            backgroundColor: "#FFFFFF",
            fill: false,
            data: [{
                x: 2500,
                y: 97.84,
            }, {
                x: 2550,
                y: 97.48,
            }, {
                x: 2600,
                y: 97.12,
            }, {
                x: 2650,
                y: 96.76,
            }, {
                x: 2700,
                y: 96.4,                
            }, {
                x: 2750,
                y: 96.04,                
            }, {
                x: 2800,
                y: 95.68,                
            }]
        }]
    };


    var config = {
        type: 'scatter',
        data: scatterChartData,
        options: {
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Calories'
                    },
                    ticks: {
                        beginAtZero: false
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Sleep Efficiency(%)'
                    },
                    ticks: {
                        beginAtZero: false
                    }
                }]
            }
        }
    };
    return callback(config, req, res)
}


// picture for steps
exports.disyearPic = function (user, callback, req, res) {
    var horizontalBarChartData = {
        labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October"],
        datasets: [{
            label: 'Yearly distance (km)',
            backgroundColor: "#70a365",
            borderColor: "#105b00",
            borderWidth: 1,
            data: monthlyDis,
        }]

    };
    var config = {
        type: 'horizontalBar',
        data: horizontalBarChartData,
        options: {
            elements: {
                rectangle: {
                    borderWidth: 2,
                }
            },
            responsive: true,
            legend: {
                position: 'right',
            },
            ticks: {
                beginAtZero: false
            }
        }
    };
    return callback(config, req, res)
}

// picture for steps
exports.sedyearPic = function (user, callback, req, res) {
    var barChartData = {
        labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October"],
        datasets: [{
            label: 'Sendentary minutes',
            backgroundColor: "#849dff",
            yAxisID: "y-axis-1",
            data: monthlySed,
            fill: false,
        }, {
            label: 'Sleep Efficiency',
            backgroundColor: "#e0e2b2",
            yAxisID: "y-axis-2",
            data: monthlySleEffi,
            fill: false,
        }]

    };
    var config = {
        type: 'bar',
        data: barChartData,
        options: {
            responsive: true,
            tooltips: {
                mode: 'index',
                intersect: true
            },
            scales: {
                yAxes: [{
                    type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: "left",
                    id: "y-axis-1",
                    ticks: {
                        beginAtZero: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Minutes'
                    },
                }, {
                    type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: "right",
                    id: "y-axis-2",
                    gridLines: {
                        drawOnChartArea: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Sleep Efficiency(%)'
                    },
                    ticks: {
                        beginAtZero: false
                    }
                }],
            }
        }
    };
    return callback(config, req, res)
}
//sleep quality graph: good, fair, poor
// picture for steps
exports.sleepCategory = function (user, callback, req, res) {
    var BarChartData = {

        labels: ["poor", "fair", "good"],
        datasets: [{
            label: 'Number of Days',
            backgroundColor: "#1fa252",
            borderColor: "#105b00",
            borderWidth: 1,
            data: sleepcategory,
        }]

    };
    var config = {
        type: 'bar',
        data: BarChartData,
        options: {
            elements: {
                rectangle: {
                    borderWidth: 2,
                }
            },
            responsive: true,
            legend: {
                position: 'right',
                fontSize: 20
            },
            ticks: {
                beginAtZero: false
            },
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Days'
                },
                ticks: {
                    beginAtZero: false
                }
            }],
            scales: {
                xAxes: [{
                    ticks: {
                        fontSize: 24
                    }
                }],
                scaleLabel:[{
                    ticks: {
                        fontSize: 20
                    }
                }],
                yAxes: [{
                    ticks: {
                        fontSize: 20
                    }
                }]
            }

        }
    };
    return callback(config, req, res)
}