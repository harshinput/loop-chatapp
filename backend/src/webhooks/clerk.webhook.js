import e from "express";
import User from "../models/user.model.js";
import { verifyWebhook } from "@clerk/backend/webhooks";

const router = e.Router();

router.post("/", e.raw({ type: "application/json" }), async (req, res) => {
  try {
    const signingSecret =
      process.env.CLERK_WEBHOOK_SIGNING_SECRET || process.env.WEBHOOK_SECRET;
    if (!signingSecret) {
      console.error("Missing webhook secret");
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    const formattedHeaders = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v) => formattedHeaders.append(key, v));
        } else {
          formattedHeaders.set(key, value);
        }
      }
    }

    const payloadString = req.body.toString("utf-8");
    const request = new Request(
      "https://loopchat-7j5h.onrender.com/api/webhooks/clerk",
      {
        method: "POST",
        headers: formattedHeaders,
        body: payloadString,
      },
    );

    const evt = await verifyWebhook(request, { signingSecret });

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const u = evt.data;

      const email =
        u.email_addresses?.find((e) => e.id === u.primary_email_address_id)
          ?.email_address ?? u.email_addresses?.[0]?.email_address;

      const fullName =
        [u.first_name, u.last_name].filter(Boolean).join(" ") ||
        u.username ||
        email?.split("@")[0];

      await User.findOneAndUpdate(
        { clerkId: u.id },
        {
          clerkId: u.id,
          email,
          fullName,
          profilePic: u.image_url || "",
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }

    if (evt.type === "user.deleted") {
      if (evt.data?.id) {
        await User.findOneAndDelete({ clerkId: evt.data.id });
      }
    }

    return res
      .status(200)
      .json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error(
      "Error in Clerk Webhook Verification:",
      error.message || error,
    );
    return res
      .status(400)
      .json({ message: "Webhook verification failed", error: error.message });
  }
});

export default router;
