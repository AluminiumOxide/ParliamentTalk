# Parliament Talk Server

## Overview
The server-side code for the ParliamentTalk project.

## How To

### Building the docker containers

To build the API:
```
docker build -t api .
```
To build the DB:
```
docker build -t db mongodb/
```

### Running the docker containers
First bring up the DB:
```
docker run -d -p 27017 --name db db
```
Second bring up the API:
```
docker run -d -p 8080 --link db:db --name api api
```
If the name is already in use, remove the existing container:
```
docker rm (api or db)
```

### Checking on docker containers
To list images:
```
docker images
```
To list containers:
```
docker ps
```
To view logs:
```
docker logs (api or db)
```

### Connecting to the docker containers
To run a command on a docker container:
```
docker exec -it (api or db) (command)
```
To connect to the dockerized mongo database:
```
docker exec -it db mongo
```

### Stopping the docker containers
First stop the API:
```
docker stop api
```
Second stop the DB:
```
docker stop db
```

### Swagger
Swagger docs are at http://localhost:8080/docs

This project leverages the mega-awesome [swagger-tools](https://github.com/apigee-127/swagger-tools) middleware which does most all the work.
