const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

const cars = require('./cars.json');

app.get('/cars', (req, res) => {
  res.json(cars);
});

app.use(express.json());

// Get random car
app.get('/cars/random_car', (req, res) => {
  const cars = JSON.parse(fs.readFileSync('./cars.json', 'utf-8'));
  const randomIndex = Math.floor(Math.random() * cars.length);
  res.json(cars[randomIndex]);

});

// Get car(s) by manufacturer(s)
app.get('/cars/by-manufacturer', (req, res) => {
  const manufacturers = req.query.manufacturers;

  if (!manufacturers) {
    return res.status(400).json({ error: 'Please provide one or more manufacturers in the query' });
  }

  const manufacturerArray = manufacturers.split(',').map(m => m.trim().toLowerCase());
  const cars = JSON.parse(fs.readFileSync('./cars.json', 'utf-8'));

  const matchedCars = cars.filter(car =>
    manufacturerArray.includes(car.manufacturer.toLowerCase())
  );

  if (matchedCars.length === 0) {
    return res.status(404).json({ error: `No cars found for manufacturers: ${manufacturers}` });
  }

  res.json(matchedCars);
});

// Get car(s) by colour(s)
app.get('/cars/by-colour', (req, res) => {
  const colours = req.query.colours;

  if (!colours) {
    return res.status(400).json({ error: 'Please provide one or more colours in the query' });
  }

  const colourArray = colours.split(',').map(c => c.trim().toLowerCase());
  const cars = JSON.parse(fs.readFileSync('./cars.json', 'utf-8'));

  const matchedCars = cars.filter(car =>
    colourArray.includes(car.colour.toLowerCase())
  );

  if (matchedCars.length === 0) {
    return res.status(404).json({ error: `No cars found in the colours: ${colours}` });
  }

  res.json(matchedCars);
});

// Add a new car
app.post('/cars', (req, res) => {
  const newCar = req.body;
  const cars = JSON.parse(fs.readFileSync('./cars.json', 'utf-8'));

  // Automatically assign a new ID (max + 1)
  const newId = cars.length > 0 ? Math.max(...cars.map(c => c.id)) + 1 : 1;
  newCar.id = newId;

  cars.push(newCar);
  fs.writeFileSync('./cars.json', JSON.stringify(cars, null, 2));

  res.status(201).json({ message: 'Car added successfully', car: newCar });
});

// Update an existing car
app.put('/cars/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updatedFields = req.body;

  const cars = JSON.parse(fs.readFileSync('./cars.json', 'utf-8'));
  const carIndex = cars.findIndex(car => car.id === id);

  if (carIndex === -1) {
    return res.status(404).json({ error: 'Car not found' });
  }

  cars[carIndex] = { ...cars[carIndex], ...updatedFields };
  fs.writeFileSync('./cars.json', JSON.stringify(cars, null, 2));

  res.json({ message: 'Car updated Successfully', car: cars[carIndex] });
});

// Delete a car
app.delete('/cars/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let cars = JSON.parse(fs.readFileSync('./cars.json', 'utf-8'));
  const carIndex = cars.findIndex(car => car.id === id);

  if (carIndex === -1) {
    return res.status(404).json({ error: 'Car not found' });
  }

  cars.splice(carIndex, 1);
  fs.writeFileSync('./cars.json', JSON.stringify(cars, null, 2));

  res.json({ message: 'Car deleted successfully' });
});

// Get multiple cars by IDs
app.get('/cars/by-ids', (req, res) => {
  const ids = req.query.ids;
  const allCars = JSON.parse(fs.readFileSync('./cars.json', 'utf-8'));
  const idArray = ids.split(',').map(id => parseInt(id.trim()));
  const matchedCars = allCars.filter(car => idArray.includes(car.id));

  res.json(matchedCars);
});

// Get car by ID
app.get('/cars/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const cars = JSON.parse(fs.readFileSync('./cars.json', 'utf-8'));
  const car = cars.find(car => car.id === id);

  if (car) {
    res.json(car);
  } else {
    res.status(404).json({ error: 'Car not found' });
  }
});

app.listen(port, () => {
  console.log(`Blur Car API running at http://localhost:${port}`);
});
