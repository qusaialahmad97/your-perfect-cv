import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore'; // Import FieldValue

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

export async function POST(request) {
  try {
    const paddleSignature = request.headers.get('paddle-signature');
    const rawRequestBody = await request.text();
    const secret = process.env.PADDLE_WEBHOOK_SECRET;

    if (!paddleSignature || !secret) {
      console.error("Webhook Error: Paddle signature or secret is missing.");
      return NextResponse.json({ message: "Config error." }, { status: 400 });
    }

    // --- Signature verification (no changes needed here) ---
    const [tsPart, h1Part] = paddleSignature.split(';');
    const timestamp = tsPart.split('=')[1];
    const h1 = h1Part.split('=')[1];
    const signedPayload = `${timestamp}:${rawRequestBody}`;
    const hmac = crypto.createHmac('sha265', secret);
    hmac.update(signedPayload);
    const expectedSignature = hmac.digest('hex');

    if (h1 !== expectedSignature) {
      console.warn("Webhook Warning: Invalid Paddle signature.");
      return NextResponse.json({ message: 'Invalid signature.' }, { status: 401 });
    }
    // --- End verification ---

    const event = JSON.parse(rawRequestBody);
    
    // --- ADDED DEBUG LOGGING ---
    console.log(`Webhook Received - Event Type: ${event.event_type}`);
    console.log("Full Event Data:", JSON.stringify(event.data, null, 2));
    // --- END DEBUG LOGGING ---

    const db = getFirestore();
    const userId = event.data.custom_data?.user_id;

    if (!userId) {
      console.error("Webhook Error: No user_id found in custom_data. Cannot update user.");
      return NextResponse.json({ message: "Webhook processed, but no user_id found." }, { status: 200 });
    }
    
    console.log(`Processing webhook for User ID: ${userId}`);
    const userRef = db.collection('users').doc(userId);

    // Handle a Pro Subscription
    if (event.event_type === 'subscription.created' || event.event_type === 'subscription.updated') {
      console.log("Processing subscription event...");
      const sub = event.data;
      let planId = 'free';
      if (sub.items[0].price.id === 'pri_01jyyapwta3majwvc2ezgfbqg5') planId = 'pro_monthly';
      if (sub.items[0].price.id === 'pri_01jyyar1w1y9m3xqzj3gqd1fve') planId = 'pro_yearly';

      await userRef.update({
        paddleSubscriptionId: sub.id,
        subscriptionStatus: sub.status,
        planId: planId,
        subscriptionPeriodEnd: sub.current_billing_period.ends_at,
      });
      console.log(`SUCCESS: Updated Pro subscription for user ${userId} to plan ${planId}`);
    }

    // Handle a one-time purchase of ATS Scans
    else if (event.event_type === 'transaction.completed') {
      console.log("Processing transaction event...");
      const transaction = event.data;
      if (transaction.items[0].price.id === 'pri_01jyyas2y7hvm4s997w6c0pvk3') {
        await userRef.update({
          atsScansRemaining: FieldValue.increment(3)
        });
        console.log(`SUCCESS: Added 3 ATS scans to user ${userId}`);
      } else {
        console.log("Transaction was for a different product, no action taken.");
      }
    } else {
      console.log(`Webhook event type "${event.event_type}" is not handled. No action taken.`);
    }

    return NextResponse.json({ message: "Webhook received and processed." }, { status: 200 });

  } catch (error) {
    console.error("CRITICAL WEBHOOK ERROR:", error);
    return NextResponse.json({ message: "An internal error occurred." }, { status: 500 });
  }
}