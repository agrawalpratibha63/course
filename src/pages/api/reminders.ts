import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import { courses } from "@/Components/data/constant";
import { verifyFirebaseToken } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    const token = await verifyFirebaseToken(req.headers.authorization);
    if (!token.email)
      return res
        .status(400)
        .json({ error: "Your Google account has no verified email." });
    if (!process.env.RESEND_API_KEY || !process.env.REMINDER_FROM_EMAIL)
      return res
        .status(503)
        .json({ error: "Email reminders are awaiting server configuration." });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { action, reminderId, courseId, delay } = req.body || {};
    if (action === "cancel") {
      if (!reminderId || typeof reminderId !== "string")
        return res.status(400).json({ error: "Missing reminder ID." });
      const { error } = await resend.emails.cancel(reminderId);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ cancelled: true });
    }

    const course = courses.find((item) => item.id === courseId);
    if (!course || !["hour", "tomorrow"].includes(delay))
      return res.status(400).json({ error: "Invalid reminder request." });
    const scheduledAt = new Date(
      Date.now() + (delay === "hour" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
    );
    const safeTitle = course.title.replace(/[<>&"']/g, "");
    const { data, error } = await resend.emails.send({
      from: process.env.REMINDER_FROM_EMAIL,
      to: token.email,
      subject: `Continue learning: ${course.title}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px"><h1 style="color:#1d4ed8">Your CODES course is waiting</h1><p>Hi ${String(token.name || "Learner").replace(/[<>&"']/g, "")},</p><p>Continue <strong>${safeTitle}</strong> and keep your learning streak active.</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://course-one-theta.vercel.app"}/course/${course.id}" style="display:inline-block;background:#1d4ed8;color:white;padding:12px 20px;text-decoration:none;border-radius:8px">Continue course</a></p><p style="color:#64748b;font-size:12px">You requested this course reminder from CODES.</p></div>`,
      scheduledAt: scheduledAt.toISOString(),
    });
    if (error || !data?.id)
      return res
        .status(400)
        .json({ error: error?.message || "Could not schedule reminder." });
    return res
      .status(200)
      .json({
        id: data.id,
        scheduledAt: scheduledAt.toISOString(),
        email: token.email,
      });
  } catch (error) {
    return res
      .status(401)
      .json({ error: error instanceof Error ? error.message : "Unauthorized" });
  }
}
