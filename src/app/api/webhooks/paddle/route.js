import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

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
      return NextResponse.json({ message: "Config error." }, { status: 400 });
    }

    // Signature verification
    const [tsPart, h1Part] = paddleSignature.split(';');
    const timestamp = tsPart.split('=')[1];
    const h1 = h1Part.split('=')[1];
    const signedPayload = `${timestamp}:${rawRequestBody}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signedPayload);
    const expectedSignature = hmac.digest('hex');

    if (h1 !== expectedSignature) {
      return NextResponse.json({ message: 'Invalid signature.' }, { status: 401 });
    }

    const event = JSON.parse(rawRequestBody);
    console.log(`Webhook Received - Event Type: ${event.event_type}`);
    
    const db = getFirestore();
    const userId = event.data.custom_data?.user_id;

    if (!userId) {
      console.error("Webhook Error: No user_id found. Cannot update user.");
      return NextResponse.json({ message: "Webhook processed, no user_id." }, { status: 200 });
    }
    
    console.log(`Processing webhook for User ID: ${userId}`);
    const userRef = db.collection('users').doc(userId);

    // --- CONSOLIDATED LOGIC ---
    // Handle both initial subscription payments and one-time purchases
    if (event.event_type === 'transaction.completed') {
      const transaction = event.data;
      const priceId = transaction.items[0].price.id;

      console.log(`Processing transaction.completed for Price ID: ${priceId}`);

      // Check if it's the Pro Monthly subscription
      if (priceId === 'pri_01jyyapwta3majwvc2ezgfbqg5') {
        await userRef.update({
          subscriptionStatus: 'active',
          planId: 'pro_monthly',
        });
        console.log(`SUCCESS: Activated Pro Monthly for user ${userId}`);
      } 
      // Check if it's the Pro Yearly subscription
      else if (priceId === 'pri_01jyyar1w1y9m3xqzj3gqd1fve') {
        await userRef.update({
          subscriptionStatus: 'active',
          planId: 'pro_yearly',
        });
        console.log(`SUCCESS: Activated Pro Yearly for user ${userId}`);
      }
      // Check if it's the ATS Scan Pack
      else if (priceId === 'pri_01jyyas2y7hvm4s997w6c0pvk3') {
        await userRef.update({
          atsScansRemaining: FieldValue.increment(3)
        });
        console.log(`SUCCESS: Added 3 ATS scans to user ${userId}`);
      } else {
        console.log(`Transaction for an unhandled Price ID (${priceId}). No action taken.`);
      }
    } 
    // Handle recurring subscription updates (e.g., renewals, cancellations)
    else if (event.event_type === 'subscription.updated') {
        const sub = event.data;
        await userRef.update({
            subscriptionStatus: sub.status, // e.g., 'active', 'past_due', 'canceled'
            subscriptionPeriodEnd: sub.current_billing_period.ends_at,
        });
        console.log(`SUCCESS: Updated subscription status for user ${userId} to ${sub.status}`);
    } else {
      console.log(`Webhook event type "${event.event_type}" is not handled. No action taken.`);
    }

    return NextResponse.json({ message: "Webhook received and processed." }, { status: 200 });

  } catch (error) {
    console.error("CRITICAL WEBHOOK ERROR:", error);
    return NextResponse.json({ message: "An internal error occurred." }, { status: 500 });
  }
}