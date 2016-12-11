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
docker run -d -p 27017 --name mongo db
```
Second bring up the API:
```
docker run -d -p 8080 --link mongo:mongo api
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
docker logs (id of container)
```

### Swagger
Swagger docs are at http://localhost:8080/docs

This project leverages the mega-awesome [swagger-tools](https://github.com/apigee-127/swagger-tools) middleware which does most all the work.
