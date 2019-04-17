# Web-Platform-for-Analyzing-the-Effect-of-Activities-on-Sleep-Patterns
  - Developed a full-stack web platform to pull data from Fitbit app using Fitbit API.
  - Developed a RESTful backend service using Node.js, MongoDB, Passport.js, and implemented the front end using HTML5, CSS3, JavaScript, and Bootstrap.
  - Performed sleep quality prediction using machine learning library in Node.js (SVM, KNN, and Decision Tree).

## The project source directory is "HealthGo-web-platform"

## How to run the application (two ways):
### Run and setup from docker image
  - Install docker from https://www.docker.com (if not already installed)
  - Download or clone this repo from github
  - In the command window, navigate to the directory HealthGo-web-platform
  - Type docker-compose up in the command window and hit enter
	~~~
	docker-compose up
	~~~
  - Wait for everything to build and startup
  - From browser, go to localhost:8080

  ![loginPage](./pictures/000.png)
  - Ready


### Run and setup web application without using docker
  - Download **Node.js**:  https://nodejs.org/en/download/
  - Download or clone this repo from github
  - Use **Node.js command prompt** to install the **npm**
    ~~~nodejs  
    npm install
    ~~~
  - Start the webserver for the application
    ~~~
    node server.js
    ~~~
  - From browser, go to localhost:8080
  ![loginPage](./pictures/000.png)
  - Ready

### Special notes for Fitbit user credential
  Fitbit API doesn't allow several users use the same fitbit account to pull fitbit data at the same time. It only allows one user to connect to the fitbit at one time and other users will be blocked to connect to the fitbit API.

### Database that we used
   This application uses MongoDB on cloud.

### Credentials could be used for test

| Userame | password |
| ------ | ------ |
| user1@gmail.com | 123 |
| user2@gmail.com |123456  |