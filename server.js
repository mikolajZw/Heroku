const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const fs = require('fs');
const dataFolder = './data/';

// Array to store received data
const arduinoData = [];

app.use(express.json());


function getFormattedTimestamp() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }


function saveDataToFile(data) {
Object.keys(data).forEach(parameter => {
const filePath = `${dataFolder}${parameter.toLowerCase()}.json`;

// Read existing data or create an empty array
const existingData = fs.existsSync(filePath) ?
JSON.parse(fs.readFileSync(filePath)) : [];
// Add new data entry
existingData.push({ timestamp: getFormattedTimestamp(), value: data[parameter] });

// Write the updated data back to the file
fs.writeFileSync(filePath, JSON.stringify(existingData));
});
}

app.post('/', (req, res) => {
const data = req.body;

// Store the data in the array
arduinoData.push(data);

if (arduinoData.length > 10) {
arduinoData.shift();
}

// Save data to individual files
saveDataToFile(data);

// Respond to the Arduino with success
res.json({ success: true });
});
app.get('/getData/', (req, res) => {
res.json({ arduinoData });
});

app.get('/getData/:parameter', (req, res) => {
const requestedParameter = req.params.parameter;

if (isValidParameter(requestedParameter)) {
const parameterData = arduinoData.map(entry => entry[requestedParameter]);

res.json({ [requestedParameter]: parameterData });
} else {
res.status(400).json({ error: 'Invalid parameter' });
}
});

app.get('/getData/:parameter/:duration', (req, res) => {
const requestedParameter = req.params.parameter;
const duration = req.params.duration;

if (isValidParameter(requestedParameter)) {
const filePath = `${dataFolder}${requestedParameter.toLowerCase()}.json`;
const data = fs.existsSync(filePath) ?
JSON.parse(fs.readFileSync(filePath)) : [];

// Filter data based on the requested time range (e.g., last hour,last day, last 3 days)
const filteredData = filterDataByDuration(data, duration);

res.json({ [requestedParameter]: filteredData });
} else {
res.status(400).json({ error: 'Invalid parameter' });
}
});

function filterDataByDuration(data, duration) {
const currentTime = Date.now();
const timeThreshold = getTimeThreshold(duration);

return data.filter(entry => entry.timestamp >= currentTime - timeThreshold);
}

function getTimeThreshold(duration) {
switch (duration) {
case 'hour':
return 60 * 60 * 1000; // 1 hour in milliseconds
case 'day':
return 24 * 60 * 60 * 1000; // 1 day in milliseconds
case '3days':
return 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
default:
return 0;
}
}


function isValidParameter(parameter) {
// Add more parameters as needed
const validParameters = ['Temperature', 'Pressure', 'Light', 'PM25',
'PM10', 'PM1', 'Humidity', 'eTVOC', 'eCO2'];
return validParameters.some(validParam => validParam.toLowerCase() ===
parameter.toLowerCase());
}

app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});
