const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Array to store received data
const arduinoData = [];

app.use(express.json());

app.post('/', (req, res) => {
  const data = req.body;
  console.log('Received Data:', data);

  // Store the data in the array
  arduinoData.push(data);

  // Respond to the Arduino with success
  res.json({ success: true });
});

app.get('/getData', (req, res) => {
  // Respond with the stored Arduino data
  res.json({ arduinoData });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
