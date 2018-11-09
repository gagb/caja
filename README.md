# caja

## Requirements
This code base requires `docker`.
https://docs.docker.com/install/ 

## Setup
Use the following commands to run the workflow on your local machine

```
./run.sh local.env ./setupLocalDb.sh  //Create a container with MS-SQL database
./run.sh local.env ./buildServer.sh  //Create a container with the application backend
./run.sh local.env ./initDB.sh  //Create tables in the database
./run.sh local.env ./runServer.sh  //Run the appication server
./run.sh local.env ./buildGame.sh example-config.sh  //Build a new game
```
