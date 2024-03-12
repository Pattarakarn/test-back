const PopulationModel = require("../models/population")
const PopulationFlagModel = require("../models/populationFlag")
const PopFlagRegionModel = require("../models/populationFlagRegion")


async function getPopulationByYear() {
    const array = await PopulationModel.aggregate([
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

async function getPopulationFlagByYear(year, limit) {
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

exports.getFilterPopulation = async (req, res) => {
    const { flag, limit, sort, year, region } = req.query
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

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.send(result)
}

exports.getFilterPopByYear = async (req, res) => {
    const { flag, limit, sort, year } = req.query

    const arrayByYear = await PopulationFlagModel.find(
        { year: year, "flag": { $exists: true } },
        { __v: 0, _id: 0 }
    ).sort({ population: -1 }).limit(limit || 10)

    console.log(arrayByYear.length, arrayByYear)

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.send(arrayByYear)
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