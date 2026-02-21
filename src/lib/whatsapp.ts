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
    // Intentionally not re-throwing — notification failures should never crash the app
  }
}

export async function sendWhatsAppVerificationUpdate(
  phoneNumber: string,
  name: string,
  status: "approved" | "rejected",
  notes?: string,
): Promise<void> {
  const message =
    status === "approved"
      ? `🎉 Congratulations ${name}!\n\nYour Caissa coach application has been *approved*. You can now log into your coach dashboard and start creating courses.`
      : `Hello ${name},\n\nWe have reviewed your coach application. Unfortunately, it has been *rejected* at this time.\n\nReason: ${notes || "Does not meet our current requirements."}\n\nIf you have any questions, please contact our support team.`;

  await sendWhatsAppMessage(phoneNumber, message);
}
