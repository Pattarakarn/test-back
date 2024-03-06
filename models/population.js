const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const populationSchema = new Schema({
    ['Country name']: String,
    Year: {
        type: Number,
        select: false
    },
    Population: Number
});

const PopulationModel = mongoose.model('Population', populationSchema);

module.exports = PopulationModel;