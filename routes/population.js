const express = require("express")
const { getFilterPopulation, getFilterPopByYear } = require("../controllers/population")

const router = express.Router()

router.get('/filter', getFilterPopulation)
router.get('/filterByYear', getFilterPopByYear)

module.exports = router
