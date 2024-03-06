const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const regionSchema = new Schema({
    country: String,
    flag: String,
    region: String
});

const RegionModel = mongoose.model('Region', regionSchema);

module.exports = RegionModel;