const BidModel = require("../models/bidModel");

class BidController {
    static async placeBid(req, res) {
        const { amount, targetDate } = req.body;
        if (!amount || !targetDate) {
            return res.status(400).json({ success: false, message: "Amount and Target Date are required" });
        }
        try {
            const profileId = await BidModel.getProfileId(req.user.id);
            if (!profileId) {
                return res.status(400).json({ success: false, message: "Profile not found. Please create your profile first." });
            }

            const appearances = await BidModel.getMonthlyAppearances(profileId);
            if (appearances >= 1) {
                return res.status(400).json({ success: false, message: "Monthly appearance limit reached. You can only be featured once per month." });
            }

            const bidCheck = await BidModel.checkExistingBid(profileId, targetDate);
            const bidId = bidCheck.length > 0 ? bidCheck[0].ab_bid_id : 0;
            
            const status = await BidModel.placeBid(bidId, profileId, targetDate, amount);
            res.json({ success: true, message: status.Message, biddingStatus: status.BiddingStatus });
        } catch (err) {
            const errorMessage = err.message || "";
            if (errorMessage.includes("MSG:")) {
                return res.json({ success: true, message: errorMessage.split("MSG:")[1].trim() });
            }
            console.error("Bidding Error:", err);
            res.status(500).json({ success: false, message: "An error occurred while placing your bid." });
        }
    }

    static async getStatus(req, res) {
        try {
            const targetDate = req.params.date;
            const profileId = await BidModel.getProfileId(req.user.id);
            if (!profileId) {
                return res.json({ success: false, message: "Profile not found." });
            }

            const bidCheck = await BidModel.checkExistingBid(profileId, targetDate);
            if (bidCheck.length === 0) {
                return res.json({ success: true, biddingStatus: "No Bid", amount: 0 });
            }

            const userAmount = bidCheck[0].ab_amount;
            const maxAmount = await BidModel.getMaxBid(targetDate);
            const isWinning = userAmount >= maxAmount;

            res.json({ success: true, biddingStatus: isWinning ? "Winning" : "Not Winning", amount: userAmount });
        } catch (err) {
            console.error("Bidding Status Error:", err);
            res.status(500).json({ success: false, message: "Error fetching bidding status" });
        }
    }

    static async getWinnerToday(req, res) {
        try {
            const winner = await BidModel.getWinnerToday();
            if (winner) {
                let imageBase64 = null;
                if (winner.apd_profile_image) {
                    imageBase64 = `data:image/jpeg;base64,${winner.apd_profile_image.toString('base64')}`;
                }
                res.json({
                    success: true,
                    winner: {
                        name: winner.apd_full_name,
                        bio: winner.apd_bio,
                        profileImage: imageBase64,
                        amount: winner.adw_winning_amount
                    }
                });
            } else {
                res.json({ success: true, winner: null });
            }
        } catch (err) {
            console.error("Fetch Winner Error:", err);
            res.status(500).json({ success: false, message: "Error fetching today's winner" });
        }
    }

    static async getHistory(req, res) {
        try {
            const profileId = await BidModel.getProfileId(req.user.id);
            if (!profileId) {
                return res.json({ success: false, message: "Profile not found." });
            }
            const history = await BidModel.getHistory(profileId);
            res.json({ success: true, history });
        } catch (err) {
            console.error("Bidding History Error:", err);
            res.status(500).json({ success: false, message: "Error fetching bidding history" });
        }
    }

    static async cancelBid(req, res) {
        try {
            const bidId = req.params.id;
            const profileId = await BidModel.getProfileId(req.user.id);
            if (!profileId) {
                return res.json({ success: false, message: "Profile not found." });
            }
            await BidModel.cancelBid(bidId, profileId);
            res.json({ success: true, message: "Bid cancelled successfully" });
        } catch (err) {
            console.error("Bidding Cancel Error:", err);
            res.status(500).json({ success: false, message: "Error cancelling bid" });
        }
    }
}
module.exports = BidController;
