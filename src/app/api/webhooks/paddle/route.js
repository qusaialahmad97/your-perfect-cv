import { NextResponse } from 'next/server';
import crypto from 'crypto';

// --- THIS IS THE FIX: Copy the Firebase Admin initialization from your register route ---
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
// --- END OF FIX ---


export async function POST(request) {
  const paddleSignature = request.headers.get('paddle-signature');
  const rawRequestBody = await request.text();
  
  const secret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!paddleSignature || !secret) {
    console.error("Paddle signature or secret is missing.");
    return NextResponse.json({ message: "Configuration error." }, { status: 400 });
  }

  // Verify the webhook signature
  try {
    const [tsPart, h1Part] = paddleSignature.split(';');
    const timestamp = tsPart.split('=')[1];
    const h1 = h1Part.split('=')[1];
    const signedPayload = `${timestamp}:${rawRequestBody}`;
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signedPayload);
    const expectedSignature = hmac.digest('hex');

    if (h1 !== expectedSignature) {
      console.warn("Invalid Paddle signature received.");
      return NextResponse.json({ message: 'Invalid signature.' }, { status: 401 });
    }
  } catch (err) {
    console.error("Error during Paddle signature verification:", err);
    return NextResponse.json({ message: 'Signature verification failed.' }, { status: 400 });
  }

  // Process the verified event
  const event = JSON.parse(rawRequestBody);
  const db = getFirestore(); // Now this function is available
  const userId = event.data.custom_data?.user_id;

  if (!userId) {
    console.error("Webhook received but no user_id found in custom_data.");
    return NextResponse.json({ message: "Webhook processed, but no user_id." }, { status: 200 });
  }

  const userRef = db.collection('users').doc(userId);

  // Handle a Pro Subscription (monthly or yearly)
  if (event.event_type === 'subscription.created' || event.event_type === 'subscription.updated') {
    const sub = event.data;
    let planId = 'free'; // Default
    // Replace with your actual Price IDs from Paddle
    if (sub.items[0].price_id === 'pri_01jyyapwta3majwvc2ezgfbqg5') planId = 'pro_monthly';
    if (sub.items[0].price_id === 'pri_01jyyar1w1y9m3xqzj3gqd1fve') planId = 'pro_yearly';

    await userRef.update({
      paddleSubscriptionId: sub.id,
      subscriptionStatus: sub.status,
      planId: planId,
      subscriptionPeriodEnd: sub.current_billing_period.ends_at,
    });
    console.log(`Updated Pro subscription for user ${userId} to plan ${planId}`);
  }

  // Handle a one-time purchase of ATS Scans
  if (event.event_type === 'transaction.completed') {
    const transaction = event.data;
    // Replace with your actual Price ID for the ATS scan pack
    if (transaction.items[0].price_id === 'pri_01jyyas2y7hvm4s997w6c0pvk3') {
      const { FieldValue } = require('firebase-admin/firestore');
      await userRef.update({
        atsScansRemaining: FieldValue.increment(3)
      });
      console.log(`Added 3 ATS scans to user ${userId}`);
    }
  }

  return NextResponse.json({ message: "Webhook received." }, { status: 200 });
}