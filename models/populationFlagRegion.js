const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const popFlagRegionSchema = new Schema({
    country: String,
    year: Number,
    population: Number,
    flag: String,
    region: String
});

const PopFlagRegionModel = mongoose.model('region_flag_pop', popFlagRegionSchema);

module.exports = PopFlagRegionModel;