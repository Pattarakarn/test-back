const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const yearDataSchema = new Schema(
    {
        year: Number,
        country: [],
        record: Number
    },
    { timestamps: true, versionKey: false }
);

const YearModel = mongoose.model('country_year', yearDataSchema);

module.exports = YearModel;