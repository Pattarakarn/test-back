const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const countrySchema = new Schema({
    country: String,
    flag: String,
});
// population: Number,

const CountryModel = mongoose.model('Country', countrySchema);

module.exports = CountryModel;