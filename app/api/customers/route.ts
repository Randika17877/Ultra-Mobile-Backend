import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    // Fetch users who are NOT admins (regular customers)
    const snapshot = await adminDb.collection("users").get();

    const customers = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          name: data.name || data.displayName || "",
          email: data.email || "",
          profilePicUrl: data.profilePicUrl || data.photoURL || "",
          role: data.role || "user",
          createdAt: data.createdAt || "",
        };
      })
      .filter((u) => u.role !== "admin");

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
