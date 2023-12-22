//Inicjalizacja serwera Express


const express = require('express'); 
const app = express();
const port = process.env.PORT || 3000;


//obsługa plików


const fs = require('fs');
const dataFolder = './data/';
const arduinoData = [];

//Obsługa przesyłanych danych:
app.use(express.json());

//Zapisywanie danych do plików:

function saveDataToFile(data) {
Object.keys(data).forEach(parameter => {
const filePath = `${dataFolder}${parameter.toLowerCase()}.json`;
//odczyt danych
const existingData = fs.existsSync(filePath) ?
JSON.parse(fs.readFileSync(filePath)) : [];
existingData.push({ timestamp: Date.now(), value: data[parameter] });
fs.writeFileSync(filePath, JSON.stringify(existingData));
});
}

app.post('/', (req, res) => {
const data = req.body;
arduinoData.push(data);
if (arduinoData.length > 10) {
arduinoData.shift();
}
saveDataToFile(data);
res.json({ success: true });
});


//Pobieranie wszystkich danych


app.get('/getData/', (req, res) => {
res.json({ arduinoData });
});

//Pobieranie danych dla konkretnego parametru


app.get('/getData/:parameter', (req, res) => {
const requestedParameter = req.params.parameter;

if (isValidParameter(requestedParameter)) {
const parameterData = arduinoData.map(entry => entry[requestedParameter]);

res.json({ [requestedParameter]: parameterData });
} else {
res.status(400).json({ error: 'Invalid parameter' });
}
});

//Pobieranie danych z określonym okresem czasu:

app.get('/getData/:parameter/:duration', (req, res) => {
const requestedParameter = req.params.parameter;
const duration = req.params.duration;
if (isValidParameter(requestedParameter)) {
const filePath = `${dataFolder}${requestedParameter.toLowerCase()}.json`;
const data = fs.existsSync(filePath) ?
JSON.parse(fs.readFileSync(filePath)) : [];
//Filtry danych czasowych:
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
return 60 * 60 * 1000; // 1 godzina w milisekundach
case 'day':
return 24 * 60 * 60 * 1000; // 1 dzień w milisekundach
case '3days':
return 3 * 24 * 60 * 60 * 1000; // 3 dni w milisekundach
default:
return 0;
}
}

//Sprawdzanie poprawności parametru

function isValidParameter(parameter) {
const validParameters = ['Temperature', 'Pressure', 'Light', 'PM25',
'PM10', 'PM1', 'Humidity', 'eTVOC', 'eCO2'];
return validParameters.some(validParam => validParam.toLowerCase() ===
parameter.toLowerCase());
}

//Nasłuchiwanie na określonym porcie

app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});
