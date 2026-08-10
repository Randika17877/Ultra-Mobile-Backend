import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("orders")
      .orderBy("orderDate", "desc")
      .get();

    const orders = snapshot.docs.map((doc, index) => {
      const data = doc.data();
      // Resolve timestamp to ISO string
      let date = "";
      if (data.orderDate?.toDate) {
        date = data.orderDate.toDate().toISOString();
      } else if (data.orderDate) {
        date = String(data.orderDate);
      }

      // Customer name from shippingAddress or userId
      const customer =
        data.shippingAddress?.name ||
        data.customer ||
        data.userId?.slice(0, 8) ||
        "";

      return {
        id: index + 1,
        docId: doc.id,
        orderId: data.orderId || doc.id,
        customer,
        total: data.totalAmount || data.total || 0,
        status: (data.status || "PENDING").toUpperCase(),
        date,
        orderItems: data.orderItems || [],
        shippingAddress: data.shippingAddress || null,
        billingAddress: data.billingAddress || null,
      };
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
