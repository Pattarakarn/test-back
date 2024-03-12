const express = require("express")
const { getCountry } = require("../controllers/country")

const router = express.Router()

router.get('/country', getCountry)

module.exports = router