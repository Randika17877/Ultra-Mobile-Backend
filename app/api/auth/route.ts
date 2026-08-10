import { NextResponse, NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    if (userDoc.exists && userDoc.data()?.role === "admin") {
      return NextResponse.json({ admin: true }, { status: 200 });
    }
    return NextResponse.json({ admin: false }, { status: 403 });
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}
