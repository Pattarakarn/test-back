const PopulationModel = require("../models/population")
const PopFlagRegionModel = require("../models/populationFlagRegion")
const RegionModel = require("../models/region")

async function getUniqueCountry() {
    const uniqueCountry = await PopulationModel.aggregate([
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

exports.getRegionGroup = async (req, res) => {
    const uniqueRegion = await getRegionGroup()
    // console.log(uniqueRegion)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.send(uniqueRegion)
}

exports.createRegion = async (req, res) => {
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
}

exports.createRegionFlagPop = async (req, res) => {
    const array = await Population.find({}, { Population: 1, 'Country name': 1, Year: 1 })
    console.log('wait . . .', array.length)
    array.forEach(async (ele, i) => {
        const datas = await RegionModel.find({ country: ele['Country name'] })
        // if (i < 10) console.log(ele['Country name'], datas[0])
        PopFlagRegionModel.insertMany({
            country: ele['Country name'],
            year: ele.Year,
            population: ele.Population,
            flag: datas[0]?.flag,
            region: datas[0]?.region,
        })
    })
    return
}

// async function getRegion(name) {
//     await fetch(`https://restcountries.com/v3.1/region/${name}`)
// }