import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { NewsletterSubscriber } from "@/models/NewsletterSubscriber";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Basic email validation regex
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 },
      );
    }

    await connectDB();

    // Check if the email already exists
    const existingSubscriber = await NewsletterSubscriber.findOne({ email });
    if (existingSubscriber) {
      return NextResponse.json(
        { error: "This email is already subscribed!" },
        { status: 409 }, // Conflict
      );
    }

    const newSubscriber = await NewsletterSubscriber.create({ email });

    return NextResponse.json(
      { success: true, message: "Successfully subscribed to the newsletter!" },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Newsletter Subscription Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 },
    );
  }
}
