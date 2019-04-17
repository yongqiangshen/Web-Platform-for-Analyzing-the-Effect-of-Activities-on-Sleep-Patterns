# How to launch the application of Activities-and-Step-count-on-Sleep-Patterns


### Run and setup from docker image
[//]: # "We expect to launch your application via a docker-compose.yml file to be found at the root of the repository. If your software development process/tool caused the docker-compose file to be in a different folder and/or you have special build/launch instructions. "
  - Install docker from https://www.docker.com (if not already installed)
  - Download or clone the repo from github (https://github.gatech.edu/gt-hit-fall2017/Activities-and-Step-count-on-Sleep-Patterns-29B.git)
  - In the command window, navigate to the directory HealthGo-web-platform
  - Type docker-compose up in the command window and hit enter
	~~~
	docker-compose up
	~~~
  - Wait for everything to build and startup
  - From browser, go to localhost:8080

  ![loginPage](./pictures/000.png)
  - Ready

### Run and setup locally
  - Download **Node.js**:  https://nodejs.org/en/download/
  - Download or clone the repo from github (https://github.gatech.edu/gt-hit-fall2017/Activities-and-Step-count-on-Sleep-Patterns-29B.git)
  - In the command window, navigate to the directory HealthGo-web-platform
  - Use **Node.js command prompt** to install the **npm**
    ~~~nodejs  
    npm install
    ~~~
  - Start the webserver for the application(in the code root)
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

