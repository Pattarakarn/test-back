const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const populationFlagSchema = new Schema({
    country: String,
    year: Number,
    population: Number,
    flag: String,
    total: Number
});

const PopulationFlagModel = mongoose.model('Population_flag', populationFlagSchema);

module.exports = PopulationFlagModel;