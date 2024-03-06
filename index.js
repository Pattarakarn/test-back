const fs = require('fs');
const path = require('path');
const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const Population = require('./models/population')

var upload = multer({ dest: 'upload/' });

const bodyParser = require('body-parser');
const CountryModel = require('./models/country');
const YearModel = require('./models/year');
const YearFilterModel = require('./models/yearFilter');
const PopulationFlagModel = require('./models/populationFlag');
const RegionModel = require('./models/region');
const PopFlagRegionModel = require('./models/populationFlagRegion');

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

var upload = multer({ dest: './upload/' });

async function getUniqueCountry() {
    const uniqueCountry = await Population.aggregate([
        {
            $group: {
                _id: {
                    country: "$Country name"
                }
            }
        },
        {
            $project: {
                _id: 0,
                country: "$_id.country",
            }
        },
    ])

    return uniqueCountry
}

app.get('/country', async (req, res) => {
    const uniqueCountry = await getUniqueCountry()
    // สร้าง Model country
    await uniqueCountry.map(async element => {
        const flag = await getFlag(element.country)
        element.flag = flag
        // ทำ if not find เพิ่ม
        CountryModel.insertMany(element)
    })

    const all = await CountryModel.find();
    console.log('all', all.length)
    const isFlag = await CountryModel.find({ "flag": { $exists: true } });
    console.log('country with flag', isFlag.length)

    return uniqueCountry
})

async function getPopulationByYear() {
    const array = await Population.aggregate([
        {
            $group: {
                _id: {
                    year: "$Year",
                },
            }
        },
        {
            $project: {
                _id: 0,
                year: "$_id.year",
            }
        },
        {
            $sort: {
                year: 1
            }
        },
    ])

    return array
}

async function createModelYear(arrayYear) {
    // raw ไม่มีธง
    arrayYear.forEach(async (ele, i) => {
        const array = await getYearByCountry(ele.year)
        YearModel.insertMany({
            year: ele.year,
            country: array,
            record: array.length
        })
    })
}
async function createModelYearFilter(arrayYear) {
    // กรองเหลือเฉพาะ country, population, มี flag
    arrayYear.forEach(async (ele, i) => {
        const array = await getYearByCountry(ele.year)
        const arr = await getDataWithFlag(array)
        YearFilterModel.insertMany({
            year: ele.year,
            country: arr,
            record: arr.length
        })
    })
}

async function getYearByCountry(year) {
    const arrayByYear = await Population.find({ Year: year })
    return arrayByYear
}

// ใช้ตอนที่ import excel แล้วสร้าง db อื่นๆ
app.get('/test', async (req, res) => {
    console.log('test')

    const arrayYear = await getPopulationByYear()

    await createModelYear(arrayYear)
    await createModelYearFilter(arrayYear)

    console.log('yearOfPop', arrayYear.length)
    res.end()
});

app.post('/post', upload.single('file'), function (req, res) {
    console.log(req.file);
    res.send("file saved on server");
});

app.post('/import', async (req, res) => {
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
    // console.log(json[0])

    res.status(201).end();
});

async function getDataWithFlag(array, limit, sort) {
    const result = await Promise.all(
        array.map(async el => {
            const flag = await CountryModel.find({ country: el['Country name'] })
                .sort({ Population: -1 })
                .limit(limit || 10)

            return {
                country: el['Country name'],
                population: el.Population,
                flag: flag[0].flag,
            }
        })
    )
    return result.filter(el => el.flag)
}

// สร้าง model Population_flag
// const array = await Population.find({}, { Population: 1, 'Country name': 1, Year: 1 })
// // console.log('wait . . .', array.length)
// array.forEach(async (ele, i) => {
//     const flag = await CountryModel.find({ country: ele['Country name'] })
//     // ele.flag = flag[0].flag
//     // if (i < 10) console.log(ele, flag[0].flag)
//     PopulationFlagModel.insertMany({
//         country: ele['Country name'],
//         year: ele.Year,
//         population: ele.Population,
//         flag: flag[0].flag
//     })
// })

app.get('/filterByYear', async (req, res) => {
    const { flag, limit, sort, year } = req.query

    const arrayByYear = await PopulationFlagModel.find(
        { year: year, "flag": { $exists: true } },
        { __v: 0, _id: 0 }
    ).sort({ population: -1 }).limit(limit || 10)

    console.log(arrayByYear.length, arrayByYear)

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.send(arrayByYear)
})

async function getPopulationFlagByYear(year, limit) {
    // const array = await PopulationFlagModel.aggregate([
    const array = await PopFlagRegionModel.aggregate([
        {
            $match: { year: +year, "flag": { $exists: true } }
        },
        {
            $sort: {
                population: -1
            }
        },
        {
            $limit: +limit
        }
    ])
    // if (i < 3) console.log(array)
    return array
}

app.get('/filter', async (req, res) => {
    const { limit, sort, year, region } = req.query
    let result
    if (region) {
        console.log('region', region)
        const arrayYear = await getPopulationByYear()
        result = await Promise.all(arrayYear.map(async (el, i) => {
            // const regionGroup = await getRegionGroup()
            const array = await PopFlagRegionModel.aggregate([
                {
                    $match: {
                        year: el.year,
                        region: region,
                        "flag": { $exists: true }
                    }
                },
                {
                    $sort: {
                        population: -1
                    }
                },
                {
                    $limit: +limit
                }
            ])
            return { [el.year]: array }
        }))
    } else if (!year) {
        const arrayYear = await getPopulationByYear()
        result = await Promise.all(arrayYear.map(async (el, i) => {
            // const array = await PopulationFlagModel.find({ year: el.year })
            return { [el.year]: await getPopulationFlagByYear(el.year, limit) }
        }))
    } else {
        result = [{ [year]: await getPopulationFlagByYear(year, limit) }]
    }

    // console.log(result,year, typeof year)

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.send(result)
})

async function getFlag(name) {
    let datas
    try {
        await fetch(`https://restcountries.com/v3.1/name/${name}`)
            .then(res => (res.json()))
            .then(data => {
                // console.log(data)
                if (data.length) {
                    datas = data?.find(el => el.name?.common == name)
                }
            })
        return { flag: datas?.flag, region: datas?.region }
    } catch (error) {
        console.log(error, name)
        return null
    }
}

async function getRegion(name) {

    // await fetch(`https://restcountries.com/v3.1/region/${name}`)
}

app.get('/region', async (req, res) => {
    const uniqueCountry = await getUniqueCountry()

    await uniqueCountry.map(async element => {
        try {
            const data = await getFlag(element.country)
            console.log(data.flag, data.region, data)
            element.flag = data.flag
            element.region = data.region

            if (data) RegionModel.insertMany(element)
        } catch (err) {
            console.log(err)
        }

    })
    res.end()
})

async function getRegionGroup() {
    const uniqueRegion = await RegionModel.aggregate([
        {
            $group: {
                _id: {
                    region: "$region"
                },
                country: {
                    $push: "$$ROOT"
                },
                total: { $sum: 1 },
            }
        },
        {
            $project: {
                _id: 0,
                region: "$_id.region",
                country: 1,
                total: 1
            }
        },
    ])
    return uniqueRegion
}

app.get('/region/group', async (req, res) => {
    // const array = await Population.find({}, { Population: 1, 'Country name': 1, Year: 1 })
    // console.log('wait . . .', array.length)
    // array.forEach(async (ele, i) => {
    //     const datas = await RegionModel.find({ country: ele['Country name'] })
    //     // if (i < 10) 
    //     console.log(ele['Country name'], datas[0])
    //     PopFlagRegionModel.insertMany({
    //         country: ele['Country name'],
    //         year: ele.Year,
    //         population: ele.Population,
    //         flag: datas[0]?.flag,
    //         region: datas[0]?.region,
    //     })
    // })
    // return

    const uniqueRegion = await getRegionGroup()
    // console.log(uniqueRegion)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.send(uniqueRegion)
})

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

mongoose.connection.on('error', (err) => {
    console.error('MongoDB error', err);
});