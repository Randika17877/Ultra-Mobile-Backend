import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminMessaging } from "@/lib/firebase-admin";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Retrieve order to get the userId
    const orderRef = adminDb.collection("orders").doc(id);
    const orderDoc = await orderRef.get();
    
    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = orderDoc.data();
    const userId = orderData?.userId;

    // Update the order status
    await orderRef.update({
      status: status.toUpperCase(),
      updatedAt: new Date().toISOString(),
    });

    // Attempt to send FCM notification and save to Firestore if we have a user
    if (userId) {
      // 1. Save notification to Firestore within the user's document
      try {
        await adminDb.collection("users").doc(userId).collection("notifications").add({
          title: "Order Status Updated",
          body: `Your order status has been changed to ${status.toUpperCase()}.`,
          type: "ORDER_STATUS",
          orderId: id,
          status: status.toUpperCase(),
          read: false,
          createdAt: new Date().toISOString(),
        });
      } catch (dbError) {
        console.error("Error saving notification to Firestore:", dbError);
      }

      // 2. Fetch user to get FCM token for push notification
      const userDoc = await adminDb.collection("users").doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        // Check standard token fields
        const fcmToken = userData?.fcmToken || userData?.deviceToken || userData?.pushToken;

        if (fcmToken) {
          try {
            const tokenStr = Array.isArray(fcmToken) ? fcmToken[0] : fcmToken;
            if (typeof tokenStr === 'string' && tokenStr.trim() !== '') {
              await adminMessaging.send({
                notification: {
                  title: "Order Status Updated",
                  body: `Your order status has been changed to ${status.toUpperCase()}.`,
                },
                data: {
                  type: "ORDER_STATUS",
                  orderId: id,
                  status: status.toUpperCase(),
                },
                token: tokenStr,
              });
              console.log(`Notification sent to user ${userId} for order ${id}`);
            }
          } catch (notiError) {
            console.error("Error sending notification:", notiError);
            // We do not fail the request if notification fails
          }
        }
      }
    }

    return NextResponse.json({ success: true, id, status });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection("orders").doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
