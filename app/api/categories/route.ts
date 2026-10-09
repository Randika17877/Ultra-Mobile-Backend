import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await adminDb.collection("categories").orderBy("name", "asc").get();
    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      categoryId: doc.data().categoryId || doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }
    const docRef = adminDb.collection("categories").doc();
    const data = {
      categoryId: docRef.id,
      name: body.name.trim(),
      imageUrl: body.imageUrl?.trim() || "",
      productCount: 0,
      createdAt: new Date().toISOString(),
    };
    await docRef.set(data);
    return NextResponse.json({ success: true, id: docRef.id, ...data });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    updateData.categoryId = id;
    updateData.updatedAt = new Date().toISOString();
    await adminDb.collection("categories").doc(id).update(updateData);
    return NextResponse.json({ success: true, id, ...updateData });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ success: false, error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    await adminDb.collection("categories").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ success: false, error: "Failed to delete category" }, { status: 500 });
  }
}
