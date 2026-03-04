import { connectDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import User from "@/models/User";

type AuditCategory =
  | "categories"
  | "coaches"
  | "courses"
  | "enrollments"
  | "students"
  | "managers"
  | "messages"
  | "payments"
  | "platform-fees";

/**
 * Log a manager action to the audit log.
 * This is non-blocking — errors are caught silently so they never break the main flow.
 */
export async function logAction({
  managerId,
  action,
  category,
  targetId,
  targetName,
  details,
}: {
  managerId: string;
  action: string;
  category: AuditCategory;
  targetId?: string;
  targetName?: string;
  details?: string;
}) {
  try {
    await connectDB();

    // Get manager name
    const manager = await User.findById(managerId).select("name").lean();
    const managerName = (manager as any)?.name || "Unknown Manager";

    await AuditLog.create({
      managerId,
      managerName,
      action,
      category,
      targetId,
      targetName,
      details,
    });
  } catch (error) {
    // Never let audit logging break the main flow
    console.error("Audit log error:", error);
  }
}
