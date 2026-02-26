const WHAPI_TOKEN = process.env.WHAPI_TOKEN;
const WHAPI_BASE_URL = process.env.WHAPI_BASE_URL;

export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string,
): Promise<void> {
  if (!WHAPI_TOKEN || !WHAPI_BASE_URL) {
    console.error(
      "WhatsApp API credentials are not configured. Skipping message.",
    );
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
    }
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
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
  );
}

export async function notifyCoachAccountApproved(coachNumber: string) {
  await sendWhatsAppMessage(
    coachNumber,
    `🎉 Congratulations!\n\nYour Caissa coach application has been *approved*. You can now log into your coach dashboard and start creating courses.`,
  );
}

export async function notifyCoachAccountRejected(
  coachNumber: string,
  reason?: string,
) {
  await sendWhatsAppMessage(
    coachNumber,
    `Hello,\n\nWe have reviewed your coach application. Unfortunately, it has been *rejected* at this time.\n\n📝 *Reason:* ${reason || "Does not meet our current requirements."}\n\nIf you have any questions, please contact our support team.`,
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
  );
}

export async function notifyCoachCourseApproved(
  coachNumber: string,
  courseTitle: string,
) {
  await sendWhatsAppMessage(
    coachNumber,
    `🎉 Great news!\n\nYour course *"${courseTitle}"* has been *approved* by our review team!`,
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
  );
}

export async function notifyCoachCoursePublished(
  coachNumber: string,
  courseTitle: string,
) {
  await sendWhatsAppMessage(
    coachNumber,
    `🚀 Your course *"${courseTitle}"* is now *live on Caissa*!\n\nStudents can now discover and enroll in your course.`,
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
  );
}

export async function notifyStudentEnrollmentApproved(
  studentNumber: string,
  courseTitle: string,
) {
  await sendWhatsAppMessage(
    studentNumber,
    `🎉 Congratulations!\n\nYour enrollment for *"${courseTitle}"* has been *approved*!\n\nYou can now access all course content. Happy learning! 📚`,
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
  );
}
