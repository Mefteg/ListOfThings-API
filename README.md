# ListOfThings-API
API of ListOfThings.

## Requirements
Heroku CLI
NodeJS

## Setup
heroku config:get GOOGLE_CLIENT_ID -s  >> .env --app listofthings-api
heroku config:get GOOGLE_CLIENT_SECRET -s  >> .env --app listofthings-api
heroku config:get MONGODB_URI -s  >> .env --app listofthings-api
npm install

## Run
heroku local
