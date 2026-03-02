import { appendFile, mkdir } from "fs/promises";
import path from "path";

const WHAPI_TOKEN = process.env.WHAPI_TOKEN;
const WHAPI_BASE_URL = process.env.WHAPI_BASE_URL;
const LOGGING_ENABLED = process.env.WHATSAPP_LOGGING === "true";

async function logWhatsAppMessage(
  recipient: string,
  messageType: string,
  status: "sent" | "failed" | "skipped",
) {
  if (!LOGGING_ENABLED) return;

  try {
    const logDir = path.join(process.cwd(), "logs");
    await mkdir(logDir, { recursive: true });
    const logFile = path.join(logDir, "whatsapp.log");
    const timestamp = new Date().toISOString();
    const maskedNumber =
      recipient.slice(0, -4).replace(/./g, "*") + recipient.slice(-4);
    const entry = `[${timestamp}] ${status.toUpperCase()} | type=${messageType} | to=${maskedNumber}\n`;
    await appendFile(logFile, entry);
  } catch (err) {
    console.error("Failed to write WhatsApp log:", err);
  }
}

export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string,
  messageType = "generic",
): Promise<void> {
  if (!WHAPI_TOKEN || !WHAPI_BASE_URL) {
    console.error(
      "WhatsApp API credentials are not configured. Skipping message.",
    );
    await logWhatsAppMessage(phoneNumber, messageType, "skipped");
    return;
  }

  try {
    const response = await fetch(`${WHAPI_BASE_URL}/messages/text`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: phoneNumber,
        body: message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`WhatsApp API error (${response.status}): ${errorData}`);
      await logWhatsAppMessage(phoneNumber, messageType, "failed");
    } else {
      await logWhatsAppMessage(phoneNumber, messageType, "sent");
    }
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    await logWhatsAppMessage(phoneNumber, messageType, "failed");
  }
}

// ── Coach Account Notifications ──────────────────────────────

export async function notifyManagerNewCoach(
  managerNumber: string,
  coachName: string,
  coachNumber: string,
) {
  await sendWhatsAppMessage(
    managerNumber,
    `📋 *New Coach Application*\n\n*${coachName}* (${coachNumber}) has applied to become a Caissa coach.\n\nPlease review in the Manager Panel.`,
    "new_coach_application",
  );
}

export async function notifyCoachAccountApproved(coachNumber: string) {
  await sendWhatsAppMessage(
    coachNumber,
    `🎉 Congratulations!\n\nYour Caissa coach application has been *approved*. You can now log into your coach dashboard and start creating courses.`,
    "coach_approved",
  );
}

export async function notifyCoachAccountRejected(
  coachNumber: string,
  reason?: string,
) {
  await sendWhatsAppMessage(
    coachNumber,
    `Hello,\n\nWe have reviewed your coach application. Unfortunately, it has been *rejected* at this time.\n\n📝 *Reason:* ${reason || "Does not meet our current requirements."}\n\nIf you have any questions, please contact our support team.`,
    "coach_rejected",
  );
}

// ── Course Notifications ────────────────────────────────────

export async function notifyManagerNewCourseSubmission(
  managerNumber: string,
  courseTitle: string,
  coachName: string,
) {
  await sendWhatsAppMessage(
    managerNumber,
    `📚 *New Course Submitted*\n\nCoach *${coachName}* has submitted *"${courseTitle}"* for review.\n\nPlease review in the Manager Panel.`,
    "new_course_submission",
  );
}

export async function notifyCoachCourseApproved(
  coachNumber: string,
  courseTitle: string,
) {
  await sendWhatsAppMessage(
    coachNumber,
    `🎉 Great news!\n\nYour course *"${courseTitle}"* has been *approved* by our review team!`,
    "course_approved",
  );
}

export async function notifyCoachCourseRejected(
  coachNumber: string,
  courseTitle: string,
  reason?: string,
) {
  await sendWhatsAppMessage(
    coachNumber,
    `Hello,\n\nYour course *"${courseTitle}"* has been *rejected* during review.\n\n📝 *Reason:* ${reason || "Does not meet publishing standards."}\n\nPlease make the requested changes and resubmit.`,
    "course_rejected",
  );
}

export async function notifyCoachCourseOnHold(
  coachNumber: string,
  courseTitle: string,
  reason?: string,
) {
  await sendWhatsAppMessage(
    coachNumber,
    `⏸️ Your course *"${courseTitle}"* has been placed *on hold*.\n\n📝 *Note:* ${reason || "Further review is needed."}\n\nWe'll notify you when there's an update.`,
    "course_on_hold",
  );
}

export async function notifyCoachCoursePublished(
  coachNumber: string,
  courseTitle: string,
) {
  await sendWhatsAppMessage(
    coachNumber,
    `🚀 Your course *"${courseTitle}"* is now *live on Caissa*!\n\nStudents can now discover and enroll in your course.`,
    "course_published",
  );
}

// ── Enrollment Notifications ────────────────────────────────

export async function notifyManagerNewReceipt(
  managerNumber: string,
  studentName: string,
  courseTitle: string,
) {
  await sendWhatsAppMessage(
    managerNumber,
    `💳 *New Enrollment Receipt*\n\n*${studentName}* has submitted a payment receipt for *"${courseTitle}"*.\n\nPlease review in the Manager Panel.`,
    "new_receipt",
  );
}

export async function notifyStudentEnrollmentApproved(
  studentNumber: string,
  courseTitle: string,
) {
  await sendWhatsAppMessage(
    studentNumber,
    `🎉 Congratulations!\n\nYour enrollment for *"${courseTitle}"* has been *approved*!\n\nYou can now access all course content. Happy learning! 📚`,
    "enrollment_approved",
  );
}

export async function notifyStudentEnrollmentRejected(
  studentNumber: string,
  courseTitle: string,
  reason?: string,
) {
  await sendWhatsAppMessage(
    studentNumber,
    `Hello,\n\nYour enrollment for *"${courseTitle}"* could not be approved.\n\n📝 *Reason:* ${reason || "Payment could not be verified."}\n\nPlease resubmit with a valid payment receipt.`,
    "enrollment_rejected",
  );
}

export async function notifyStudentEnrollmentOnHold(
  studentNumber: string,
  courseTitle: string,
  reason?: string,
) {
  await sendWhatsAppMessage(
    studentNumber,
    `Hello,\n\nYour enrollment for *"${courseTitle}"* has been placed *on hold* pending review.\n\n📝 *Reason:* ${reason || "We require additional information to verify your payment."}\n\nPlease contact our support team to resolve this issue.`,
    "enrollment_on_hold",
  );
}

// ── System Notifications ────────────────────────────────────

export async function notifyDiskUsageHigh(
  managerNumber: string,
  usagePercent: number,
) {
  await sendWhatsAppMessage(
    managerNumber,
    `⚠️ *Disk Usage Alert*\n\nServer disk usage has reached *${usagePercent}%*.\n\nPlease take action to free up space.`,
    "disk_usage_alert",
  );
}
