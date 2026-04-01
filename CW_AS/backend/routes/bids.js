const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const BidController = require("../controllers/bidController");

router.post("/place-bid", authMiddleware, BidController.placeBid);
router.get("/status/:date", authMiddleware, BidController.getStatus);
router.get("/winner-today", BidController.getWinnerToday);

module.exports = router;
