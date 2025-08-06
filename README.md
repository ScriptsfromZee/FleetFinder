
# FleetFinder API

FleetFinder API is a simple Node.js and Express project for managing a list of cars.  
You can view, search, add, update and delete cars stored in a JSON file.  
This project is perfect for learning about REST APIs, practicing CRUD operations or building a small car management app.

## How to Use

To test the API endpoints, you need to clone this repository, run the server locally and then use the Postman collection to make requests.

## Features

- Get all cars
- Get a random car
- Search cars by manufacturer, colour or ID
- Add new cars
- Update existing cars
- Delete cars

## Getting Started

### 1. Clone the repository

git clone https://github.com/ScriptsfromZee/FleetFinder

cd FleetFinder

### 2. Install dependencies

npm install

### 3. Start the server

node index.js

The API will be running at [http://localhost:3000]

## Testing the API with Postman

After starting your server, you can use the Postman collection to easily test all the endpoints.

https://documenter.getpostman.com/view/33991153/2sB3BBrCCZ

Make sure the server is running locally before sending requests from Postman.

## About the Data

All car data is stored in a simple `cars.json` file in the project root.  
No database setup is needed.


## Why Use This Project?

- Practice working with REST APIs
- Learn how to build CRUD endpoints with Node.js and Express
- Test API requests easily with Postman

