const express = require("express")
const { getFilterPopulation } = require("../controllers/population")

const multer = require('multer')
var upload = multer({ dest: 'upload/' });

const router = express.Router()

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

// ใช้ตอนที่ import excel แล้วสร้าง db country_year
const testCreate = async (req, res) => {
    console.log('test')

    const arrayYear = await getPopulationByYear()

    await createModelYear(arrayYear)
    await createModelYearFilter(arrayYear)

    console.log('yearOfPop', arrayYear.length) // 72
    res.end()
}
router.get('/test', testCreate)

// var upload = multer({ dest: './upload/' });
// router.post('/post', upload.single('file'), function (req, res) {
//     console.log(req.file);
//     res.send("file saved on server");
// });

// router.post('/import', async (req, res) => {
//     const filePath = path.resolve('population-and-demography.csv')

//     let file = fs.readFileSync(filePath, { encoding: 'utf-8' }, function (err) {
//         console.log(err);
//     });

//     file = file.split("\n");

//     headers = file.shift().split(",");

//     const json = [];
//     file.forEach(function (data) {

//         row = {}
//         arrData = data.split(",")

//         for (let i = 0; i < headers.length; i++) {
//             row[headers[i]] = arrData[i];
//         }

//         json.push(row);
//     });

//     content = JSON.stringify(json)
//     // console.log(json[0])

//     res.status(201).end();
// });

module.exports = router