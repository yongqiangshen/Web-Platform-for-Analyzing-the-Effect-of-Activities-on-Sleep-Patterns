# Activities-and-Step-count-on-Sleep-Patterns
### Mongodb Atlas setup (for working the application)
*  Mongodb in this project is to store the user's data, fitbit's tokens, id and etc. (as shown in the mongoose schema under **\app\models\user.js**)
* Sign up for MongoDB Atlas if you don't have one (we created one for this project)
* Database name: healthgo
* Connect with mognodb web application (see the configuration in the **config/database.js**):
mongodb://lindsay:lwj1991131@cluster0-shard-00-00-jmtde.mongodb.net:27017,cluster0-shard-00-01-jmtde.mongodb.net:27017,cluster0-shard-00-02-jmtde.mongodb.net:27017/healthgo?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin
### Mongodb local setup (for importing or exporting data if needed)
* Download Mongodb with SSL version at https://www.mongodb.com/download-center#community
* Intall it under **C:\mongodb**
* Go to C:\mongodb:
    * Create **data** folder, log in data folder, under the data folder, create **db** folder
    * Under **C:\mongodb\bin** folder, use command to set up the data and db folder: 
    mongod --directoryperdb --dbpath C:\mongodb\data\db –logpath
    * Under the **C:\mongodb\bin**, use the command below to connect with MongoDB cloud:
    * mongo "mongodb://cluster0-shard-00-00-jmtde.mongodb.net:27017,cluster0-shard-00-01-jmtde.mongodb.net:27017,cluster0-shard-00-02-jmtde.mongodb.net:27017/test?replicaSet=Cluster0-shard-0" --authenticationDatabase admin --ssl --username lindsay –password lwj1991131
        * show dbs
        * use healthgo
        * show collections
        
    
    

    








