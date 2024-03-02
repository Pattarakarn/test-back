const fs = require('fs');
const path = require('path');
const express = require('express')

const app = express()

let port = process.env.PORT || 8000

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

app.listen(port, () => {
    console.log(`server running at port ${port}`)
})
