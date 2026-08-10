import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

// GET all users with admin role
export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("users")
      .where("role", "==", "admin")
      .get();

    const users = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        email: data.email || "",
        displayName: data.name || data.displayName || "",
        role: data.role || "user",
        createdAt: data.createdAt || "",
      };
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST create new admin user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, displayName, role = "admin" } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: displayName || "",
    });

    // Store in Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name: displayName || "",
      displayName: displayName || "",
      role,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      email,
      displayName,
      role,
    });
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    const message = (error as { message?: string })?.message || "Failed to create user";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT update user role
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, role } = body;

    if (!uid || !role) {
      return NextResponse.json({ success: false, error: "uid and role are required" }, { status: 400 });
    }

    await adminDb.collection("users").doc(uid).update({
      role,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, uid, role });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE remove admin user
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    if (!uid) return NextResponse.json({ success: false, error: "uid required" }, { status: 400 });

    await adminAuth.deleteUser(uid);
    await adminDb.collection("users").doc(uid).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 });
  }
}
