const express = require("express")
const router = express.Router()
const userController=require("../controllers/userController")

//test-api
router.get('/test-me', function(req, res) {
    res.send({ status: true, message: "test-api working fine" })
})

router.post("/create",userController.registerUser)

module.exports=router
