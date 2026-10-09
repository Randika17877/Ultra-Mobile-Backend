import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// GET all products
export async function GET() {
  try {
    const snapshot = await adminDb.collection("products").orderBy("createdAt", "desc").get();
    const products = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        productId: data.productId || doc.id,
        ...data,
        title: data.title || data.name || "",
        price: data.price || data.basePrice || 0,
        stockCount: data.stockCount || data.totalStock || 0,
        images: data.images || data.imageUrls || [],
        status: data.status ?? data.active ?? true,
      };
    });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST new product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Resolve category details from Firestore
    let categoryName = "";
    let internalCategoryId = "";
    const categoryDocId = body.categoryId || "";

    if (categoryDocId) {
      const catDoc = await adminDb.collection("categories").doc(categoryDocId).get();
      if (catDoc.exists) {
        const catData = catDoc.data();
        categoryName = catData?.name || "";
        internalCategoryId = catData?.categoryId || catDoc.id;
      }
    }

    const docRef = adminDb.collection("products").doc();

    const productData = {
      productId: docRef.id,
      title: body.title || "",
      description: body.description || "",
      price: Number(body.price) || 0,
      stockCount: Number(body.stockCount) || 0,
      categoryId: internalCategoryId || categoryDocId,
      categoryDocId,
      categoryName,
      images: body.images || [],
      attributes: body.attributes || [],
      rating: 0,
      reviewCount: 0,
      status: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await docRef.set(productData);

    // Increment category productCount
    if (categoryDocId) {
      await adminDb
        .collection("categories")
        .doc(categoryDocId)
        .update({ productCount: FieldValue.increment(1) })
        .catch(() => { });
    }

    return NextResponse.json({ success: true, id: docRef.id, ...productData });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json({ success: false, error: "Failed to add product" }, { status: 500 });
  }
}

// PUT update product
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
    }

    const oldProductDoc = await adminDb.collection("products").doc(id).get();
    const oldData = oldProductDoc.data();

    // Resolve new category details if categoryId changed
    if (updateData.categoryId) {
      const catDoc = await adminDb.collection("categories").doc(updateData.categoryId).get();
      if (catDoc.exists) {
        const catData = catDoc.data();
        const newCategoryDocId = updateData.categoryId;
        const newCategoryId = catData?.categoryId || catDoc.id;

        updateData.categoryName = catData?.name || "";
        updateData.categoryDocId = newCategoryDocId;
        updateData.categoryId = newCategoryId;

        // If category changed, update product counts
        const oldCatDocId = oldData?.categoryDocId || oldData?.categoryId;
        if (oldCatDocId && oldCatDocId !== newCategoryDocId) {
          await adminDb.collection("categories").doc(oldCatDocId).update({ productCount: FieldValue.increment(-1) }).catch(() => {});
          await adminDb.collection("categories").doc(newCategoryDocId).update({ productCount: FieldValue.increment(1) }).catch(() => {});
        }
      }
    }

    updateData.updatedAt = new Date().toISOString();
    await adminDb.collection("products").doc(id).update(updateData);
    return NextResponse.json({ success: true, id, ...updateData });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
    }

    const productDoc = await adminDb.collection("products").doc(id).get();
    const catDocId = productDoc.data()?.categoryDocId || productDoc.data()?.categoryId;

    await adminDb.collection("products").doc(id).delete();

    if (catDocId) {
      await adminDb
        .collection("categories")
        .doc(catDocId)
        .update({ productCount: FieldValue.increment(-1) })
        .catch(() => { });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 });
  }
}
