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

## License
Copyright (c) 2018 Gagan Bansal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
