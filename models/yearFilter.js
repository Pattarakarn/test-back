const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const yearFilterSchema = new Schema(
    {
        year: Number,
        country: [],
    },
);

const YearFilterModel = mongoose.model('country_year_filter', yearFilterSchema);

module.exports = YearFilterModel;