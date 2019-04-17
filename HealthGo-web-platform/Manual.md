# User's Manual
## Team Name
* HealthGo
## Project Name
* Analyzing the effect of activities and step count on sleep patterns
## Team Members
* Yushen Huang (yhuang607), Ronghua Yu (ryu67), Yiqiang Wang (ywang3087), Yongqiang Shen (yshen304), Xiaohua Cao (xcao67), Wenjing Ling (wling8)
## Project Github Link
* https://github.gatech.edu/gt-hit-fall2017/Activities-and-Step-count-on-Sleep-Patterns-29B

## Log in and Sign up
* Go to sign up with a new user if you have not signed up before

* The user profile will be stored in the MongoDB

### Dashboard screen
* Tap on the "Connect to fitbit" and "Refresh the data" buttons to connect to the fitbit API and load the yearly data for machine learning. 
* This step will take a while （~10 seconds) for the data loaded. 
* If you continue clicking "Refresh the data", it will shows "data have not complete loading, please wait for 10 seconds and click refresh again"
* Once the console shows "Year Sleep Data Is Ready Now, Click the Machine Learning Module to Do Prediction", you will see the yearly data for activities and sleep efficiency
* Now you can navigate to the MACHIINE LEARNING module for sleep prediction.
 
### MACHINE LEARNING screen
* Click the Predict button to start machine learning to predict sleep quality.
* Machine Learning module will use user's hisotorical data to train the model.
* The module will use the training model to predict the sleep quality based on today's activities.
* This module uses the live data from fitbit API.
* This screen also shows the sleep quality (good, fair, poor) distribution in a year and the correlation coefficient between activities and sleep efficiency.
 
### Sleep Prediction screen
* Click the Sleep Prediction button to let use manual input any activities data for predicting.
* This module is based on KNN algorithm to do prediction
* This module also uses the static fitbit data from csv format as training data
 
### Daily Data screen
* Tap on the "Connet to fitbit" and "Refresh the data" buttons to connect to the fitbit API 
* You will see today's activities including steps, sedentary, light, fairly, very active minutes, distance, floors,  calories burned, sleep efficiency, minutes asleep and minutes to fall asleep.
 
### User Profile screen
This is for reviewing the user's profile. The user can also edit the profile.

### Maps screen

## License
HealthGo@6440 2017Fall


