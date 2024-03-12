const fs = require('fs');
const path = require('path');
const express = require('express')
const mongoose = require('mongoose')

const bodyParser = require('body-parser');

const populationRouter = require('./routes/population')
const testRouter = require('./routes/test')

const app = express()
app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const url = 'mongodb+srv://pattarak:pattarak@cluster0.wsbiuab.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

let port = process.env.PORT || 8000

mongoose.connect(url).then(() => {
    console.log('Connected to MongoDB');

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

app.get('/', (request, response) => {
    let content = ""

    try {
        const filePath = path.resolve('population-and-demography.csv')

        let file = fs.readFileSync(filePath, { encoding: 'utf-8' }, function (err) {
            console.log(err);
        });

        file = file.split("\n");

        headers = file.shift().split(",");

        const json = [];
        file.forEach(function (data) {

            row = {}
            arrData = data.split(",")

            for (let i = 0; i < headers.length; i++) {
                row[headers[i]] = arrData[i];
            }

            json.push(row);
        });

        content = JSON.stringify(json)

    } catch (error) {
        console.error(error)
    }

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.send(content)
});

app.use('/', populationRouter)
app.use('/', testRouter)

mongoose.connection.on('error', (err) => {
    console.error('MongoDB error', err);
});