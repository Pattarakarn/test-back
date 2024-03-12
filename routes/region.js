const express = require("express")
const { getRegion, getRegionGroup } = require("../controllers/region")

const router = express.Router()

// router.get('/region', createRegion)
router.get('/region/group', getRegionGroup)

module.exports = router