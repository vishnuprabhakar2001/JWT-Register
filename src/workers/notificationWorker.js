import connectDB from "../config/db.js";
import { NotificationOutbox } from "../models/NotificationOutbox.model.js";
import { checkDeadlines } from "../controllers/testDeadline.controller.js";

console.log("[NotificationWorker] Starting notification worker process...");

const processOutbox = async () => {
  try {
    const pendingNotifications = await NotificationOutbox.find({
      delivery_status: "pending",
      next_attempt_at: { $lte: new Date() },
    }).limit(20);

    for (const item of pendingNotifications) {
      console.log(`[NotificationWorker] Processing outbox item: ${item._id} (${item.type})`);
      item.attempts = (item.attempts || 0) + 1;
      item.delivery_status = "delivered";
      await item.save();
    }

    // Also check deadlines
    await checkDeadlines();
  } catch (err) {
    console.error("[NotificationWorker] Error in worker cycle:", err.message);
  }
};

connectDB()
  .then(() => {
    console.log("[NotificationWorker] Connected to MongoDB. Polling every 15s.");
    setInterval(processOutbox, 15000);
    processOutbox();
  })
  .catch((err) => {
    console.error("[NotificationWorker] Database connection failed:", err.message);
    process.exit(1);
  });
