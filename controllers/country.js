const PopulationModel = require("../models/population")

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

exports.getCountry = async (req, res) => {
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
}

// async function getYearByCountry(year) {
//     const arrayByYear = await Population.find({ Year: year })
//     return arrayByYear
// }

// async function getDataWithFlag(array, limit, sort) {
//     const result = await Promise.all(
//         array.map(async el => {
//             const flag = await CountryModel.find({ country: el['Country name'] })
//                 .sort({ Population: -1 })
//                 .limit(limit || 10)

//             return {
//                 country: el['Country name'],
//                 population: el.Population,
//                 flag: flag[0].flag,
//             }
//         })
//     )
//     return result.filter(el => el.flag)
// }