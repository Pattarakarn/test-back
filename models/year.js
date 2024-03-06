const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const yearDataSchema = new Schema(
    {
        // year: [{
        //     type: Map,
        //     of: String
        // }]
        year: Number,
        country: [],
        record: Number
        // [
        //     new Schema({
        //         country: String,
        //         Population: Number
        //     })
        // ],
    },
    // auto generate createdAt และ updatedAt เป็นเวลาที่ data นั้นถูกสร้าง หรือถูก edit นั่นเอง
    { timestamps: true, versionKey: false }
    // เอา field generate __v ออก
);

const YearModel = mongoose.model('country_year', yearDataSchema);

module.exports = YearModel;