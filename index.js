const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

const cars = require('./cars.json');

app.get('/cars', (req, res) => {
  let cars = JSON.parse(fs.readFileSync('./cars.json', 'utf-8'));

  // Check if unit query param exists
  const { unit } = req.query;

  if (unit && unit.toLowerCase() === 'kmh') {
    cars = cars.map(car => {
      // Extract numeric value from top_speed string
      const speedMph = parseFloat(car.top_speed);
      const speedKmh = Math.round(speedMph * 1.60934);
      return {
        ...car,
        top_speed: `${speedKmh} km/h`
      };
    });
  }

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

  // Find invalid manufacturers
  const existingManufacturers = [...new Set(cars.map(c => c.manufacturer.toLowerCase()))];
  const invalidManufacturers = manufacturerArray.filter(m => !existingManufacturers.includes(m));

  // If *all* are invalid
  if (matchedCars.length === 0) {
    return res.status(404).json({
      error: `No cars found for manufacturers: ${manufacturers}`,
    });
  }

  // If some are invalid, return both cars and warning
  if (invalidManufacturers.length > 0) {
    return res.json({
      warning: `Some manufacturers not found: ${invalidManufacturers.join(', ')}`,
      cars: matchedCars
    });
  }

  // If all are valid
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

  const existingColours = [...new Set(matchedCars.map(car => car.colour.toLowerCase()))];
  const invalidColours = colourArray.filter(c => !existingColours.includes(c));

  // Case: No matches at all
  if (matchedCars.length === 0) {
    return res.status(404).json({
      error: `No cars found in the colours: ${invalidColours.join(', ')}`
    });
  }

  // Case: Partial match — return 206 Partial Content
  if (invalidColours.length > 0) {
    return res.status(206).json({
      cars: matchedCars,
      message: `No cars found in the colours: ${invalidColours.join(', ')}`
    });
  }

  // Case: All matches
  res.json(matchedCars);
});



// Add a new car
app.post('/cars', (req, res) => {
  const { name, manufacturer, top_speed, colour } = req.body;

  // Check required fields
  const missingFields = [];
  if (!name) missingFields.push('name');
  if (!manufacturer) missingFields.push('manufacturer');
  if (!top_speed) missingFields.push('top_speed');
  if (!colour) missingFields.push('colour');

  if (missingFields.length > 0) {
    return res.status(400).json({ error: `Missing required field(s): ${missingFields.join(', ')}` });
  }

  // Validate and normalize top_speed
  const speedRegex = /^(\d+(\.\d+)?)\s*mph$/i;
  let speedString;
  if (typeof top_speed === 'string') {
    const match = top_speed.trim().match(speedRegex);
    if (!match) {
      return res.status(400).json({ error: "top_speed must be a number followed by 'mph', e.g. '210 mph'" });
    }
    // Normalize to one space before mph
    speedString = `${match[1]} mph`;
  } else if (typeof top_speed === 'number') {
    speedString = `${top_speed} mph`;
  } else {
    return res.status(400).json({ error: "top_speed must be a string ending with 'mph' or a number" });
  }

  // Duplicate check
  const cars = JSON.parse(fs.readFileSync('./cars.json', 'utf-8'));
  const duplicate = cars.find(
    car => car.name.toLowerCase() === name.toLowerCase() &&
           car.manufacturer.toLowerCase() === manufacturer.toLowerCase()
  );

  if (duplicate) {
    return res.status(400).json({ error: 'Car already exists.' });
  }

  // Assign new ID to the new car
  const newId = cars.length > 0 ? Math.max(...cars.map(c => c.id)) + 1 : 1;

  const newCar = {
    id: newId,
    name,
    manufacturer,
    top_speed: speedString,
    colour
  };

  cars.push(newCar);
  fs.writeFileSync('./cars.json', JSON.stringify(cars, null, 2));

  res.status(201).json({
    message: 'Car added successfully',
    ...newCar
  });
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

  // If top_speed is being updated, validate and normalize it
  if (updatedFields.top_speed !== undefined) {
    const ts = updatedFields.top_speed;
    const speedRegex = /^(\d+(\.\d+)?)\s*mph$/i;
    if (typeof ts === 'string') {
      const match = ts.trim().match(speedRegex);
      if (!match) {
        return res.status(400).json({ error: "top_speed must be a number followed by 'mph', e.g. '210 mph'" });
      }
      updatedFields.top_speed = `${match[1]} mph`;
    } else if (typeof ts === 'number') {
      updatedFields.top_speed = `${ts} mph`;
    } else {
      return res.status(400).json({ error: "top_speed must be a string ending with 'mph' or a number" });
    }
  }

  cars[carIndex] = { ...cars[carIndex], ...updatedFields };
  fs.writeFileSync('./cars.json', JSON.stringify(cars, null, 2));

  res.json({ message: 'Car updated successfully', car: cars[carIndex] });
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

// Get cars by multiple IDs
app.get('/cars/by-ids', (req, res) => {
  const ids = req.query.ids;
  if (!ids) {
    return res.status(400).json({ error: 'Please provide one or more IDs in the query' });
  }

  const allCars = JSON.parse(fs.readFileSync('./cars.json', 'utf-8'));
  const idArray = ids.split(',').map(id => parseInt(id.trim()));

  const matchedCars = allCars.filter(car => idArray.includes(car.id));
  const foundIds = matchedCars.map(car => car.id);
  const missingIds = idArray.filter(id => !foundIds.includes(id));

  if (missingIds.length) {
    res.status(206).json({
      cars: matchedCars,
      message: `No car found for ID(s): ${missingIds.join(', ')}`
    });
  } else {
    res.json({ cars: matchedCars });
  }
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
