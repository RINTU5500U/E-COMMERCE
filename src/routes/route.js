const express = require("express")
const router = express.Router()
const userController=require("../controllers/userController")

//test-api
router.get('/test-me', function(req, res) {
    res.send({ status: true, message: "test-api working fine" })
})

router.post("/register",userController.registerUser)
router.post("/login",userController.userLogin)

router.all("/*", function (req, res) {
    res.status(400).send({ status: false, message: "invalid http request" });
  });

module.exports=router
