const express = require("express")
const router = express.Router()
router.get("/test-me",(req, res) => {
    console.log("hi")
})

module.exports=router
