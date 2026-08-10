import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

/**
 * POST /api/seed-admin
 * Creates the first admin user for Ultra Mobile Admin.
 * Body: { email, password, displayName, secretKey }
 * Protect with a secret key in env: SEED_SECRET
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, displayName, secretKey } = body;

    // Basic protection — require a secret key
    const expectedSecret = process.env.SEED_SECRET || "ultra-mobile-seed-2024";
    if (secretKey !== expectedSecret) {
      return NextResponse.json({ error: "Invalid secret key" }, { status: 403 });
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Check if any admin already exists
    const existing = await adminDb
      .collection("users")
      .where("role", "==", "admin")
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        { error: "An admin user already exists. Use the Users page to add more admins." },
        { status: 409 }
      );
    }

    // Create Firebase Auth user
    let userRecord;
    try {
      userRecord = await adminAuth.createUser({ email, password, displayName: displayName || "Admin" });
    } catch {
      // User might already exist in Auth — fetch them
      userRecord = await adminAuth.getUserByEmail(email);
    }

    // Write to Firestore with admin role
    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name: displayName || "Admin",
      displayName: displayName || "Admin",
      role: "admin",
      createdAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: `Admin user created: ${email}`,
      uid: userRecord.uid,
    });
  } catch (error: unknown) {
    console.error("Seed admin error:", error);
    const message = (error as { message?: string })?.message || "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
