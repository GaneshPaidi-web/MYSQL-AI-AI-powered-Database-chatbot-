import express from "express";
import Chat from "../models/Chat.js";

const router = express.Router();

// Fetch all chat sessions for a user (metadata only)
router.get("/sessions/:userId", async (req, res) => {
    try {
        const sessions = await Chat.find({ userId: req.params.userId })
            .select("title updatedAt _id")
            .sort({ updatedAt: -1 });
        
        res.json({ success: true, sessions });
    } catch (error) {
        console.error("Error fetching sessions:", error);
        res.status(500).json({ success: false, message: "Server error retrieving sessions." });
    }
});

// Fetch a specific chat session by chatId
router.get("/session/:chatId", async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId);
        
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found." });
        }

        res.json({ success: true, messages: chat.messages });
    } catch (error) {
        console.error("Error fetching session:", error);
        res.status(500).json({ success: false, message: "Server error retrieving session." });
    }
});

// Delete a specific chat session
router.delete("/session/:chatId", async (req, res) => {
    try {
        await Chat.findByIdAndDelete(req.params.chatId);
        res.json({ success: true, message: "Session deleted successfully." });
    } catch (error) {
        console.error("Error deleting session:", error);
        res.status(500).json({ success: false, message: "Server error deleting session." });
    }
});

export default router;
