const express = require("express")
const router = express.Router()


//test-api
router.get('/test-me', function(req, res) {
    res.send({ status: true, message: "test-api working fine" })
})


module.exports=router
