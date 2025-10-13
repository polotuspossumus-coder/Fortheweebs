// ...existing code...
/**
 * Snitching Clause Update
 *
 * Illegal content is automatically screened, banned, and reported to authorities by the platform's automated systems. Users should not report other creators to the platform for illegal content, as such material is already handled and removed by automation. All other moderation is minimal and focused on legal compliance and user safety.
 */
// ...existing code...
/**
 * Additional Legal Protections
 *
 * 6. Disclaimer of Liability: The platform is not liable for any damages resulting from user-generated content, misuse, or interruptions in service.
 * 7. Indemnification: Users agree to indemnify and hold harmless the platform and its owners against any claims arising from their actions or content.
 * 8. Right to Modify Terms: The platform reserves the right to update or modify these terms at any time. Continued use constitutes acceptance of changes.
 * 9. Jurisdiction and Governing Law: All disputes will be governed by the laws and jurisdiction specified by the platform.
 * 10. Privacy Policy: Users should review the platform's privacy policy to understand how data is handled and protected.
 * 11. Account Termination: The platform may terminate accounts for any violation of terms, at its sole discretion.
 * 12. No Guarantee of Service: The platform does not guarantee uninterrupted or error-free service.
 */
// ...existing code...
/**
 * Terms of Service - Illegal Content Policy
 *
 * 1. Any account flagged for uploading, sharing, or attempting to post illegal content (including but not limited to child exploitation, abuse, or other criminal material) will be immediately terminated and reported to the proper authorities. This process is fully automated.
 * 2. The platform is not responsible for user-generated content, but will cooperate fully with law enforcement agencies as required by law.
 * 3. Users are solely responsible for all content they upload, share, or post. By using this platform, users agree to comply with all applicable laws.
 * 4. The platform reserves the right to retain evidence of illegal activity as required by law, and such evidence will be securely stored and only accessible to law enforcement.
 * 5. The platform complies with all laws regarding reporting and handling of illegal content. Automated systems are in place to detect, report, and restrict access to such material.
 */
/**
 * Media Identification and Copyright Flagging
 *
 * All media uploaded or processed through Vanguard must be identified as original creator content or flagged if it could potentially violate copyright laws. If media is flagged, the creator will be notified and must review the content. By accepting flagged content, the creator acknowledges and accepts full responsibility for hosting and distributing the material. The platform provides tools for creators to revise, remove, or provide proof of ownership. This process helps prevent accidental copyright violations and shifts legal responsibility to the creator for any flagged content.
 */
/**
 * User Content Policy and Liability
 *
 * Users are permitted to post any type of media content, subject to automated moderation. Illegal content is automatically detected, banned, and reported to authorities. All other content remains the sole responsibility of the user, including any copyright violations or attempts to monetize copyrighted material. By using the platform, users accept full liability for their actions and content. The platform does not censor lawful content but enforces strict automated removal of illegal material. Users must ensure they have the rights to share, distribute, or monetize any content they upload.
 */
/**
 * Account Termination and Copyright Complaints
 *
 * Accounts will only be terminated for posting illegal content, as required by law. No account will be taken down for copyright violations; instead, any copyright complaints or takedown requests will be directed to the creator who posted the content. The creator is responsible for removing infringing material or facing the legal consequences. The platform acts solely as a conduit and does not mediate copyright disputes. All responsibility for copyright compliance rests with the content creator.
 */
// ...existing code...
import express from "express";

const acceptanceLog = [];

const router = express.Router();

// POST /api/tos/accept
router.post("/api/tos/accept", (req, res) => {
  const { userId, ipAddress, version } = req.body;
  if (!userId || !ipAddress || !version) return res.status(400).json({ error: "Missing required fields" });
  acceptanceLog.push({
    userId,
    timestamp: Date.now(),
    ipAddress,
    version,
  });
  res.json({ success: true });
});

// GET /api/tos/accepted/:userId
router.get("/api/tos/accepted/:userId", (req, res) => {
  const { userId } = req.params;
  const history = acceptanceLog.filter((entry) => entry.userId === userId);
  res.json({ accepted: history.length > 0, history });
});

export default router;
