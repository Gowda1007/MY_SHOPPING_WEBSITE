const  express = require('express')
const paymentController = require("../controllers/payment.controller")
const auth = require("../middleware/auth.middleware");

const router = express.Router();


router.post("/checkout",auth.authUser,paymentController.checkout)
router.post("/verify",auth.authUser,paymentController.verify)

module.exports = router;