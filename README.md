
# FleetFinder API

FleetFinder API is a simple Node.js and Express project for managing a list of cars.  
You can view, search, add, update and delete cars stored in a JSON file.  
This project is perfect for learning about REST APIs, practicing CRUD operations or building a small car management app.

## How to Use

You have two ways to try the API:

### Run Online (no local setup)

Open the Postman collection: https://documenter.getpostman.com/view/33991153/2sB3BBrCCZ

**Note:** Your first response may take some time as the server goes to sleep after a few minutes of inactivity.

Click “Run in Postman”. 

Ensure https://fleetfinder.onrender.com is set as a variable preferably as {{baseUrl}} to save time. 

Send requests directly. 

### Run locally

Clone the repo: git clone https://github.com/ScriptsfromZee/FleetFinder

cd FleetFinder

Install dependencies: npm install

Start the server: node index.js

The API will be running at http://localhost:3000

You can now use the same Postman collection and switch/set  the base URL to http://localhost:3000.

## Features

- Get all cars
- Get a random car
- Search cars by manufacturer(s), colour(s) or ID(s)
- Add new cars
- Update existing cars
- Delete cars

Make sure the server is running locally before sending requests from Postman. If you make changes to the code, you need to restart your server. 

## About the Data

All car data is stored in a simple `cars.json` file in the project root.  
No database setup is needed.


## Why Use This Project?

- Practice working with REST APIs
- Learn how to build CRUD endpoints with Node.js and Express
- Test API requests easily with Postman

