import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { admin } from '@/lib/firebase-admin'; // Assuming you have an admin init file
import { Paddle, EventName } from '@paddle/paddle-js';
import crypto from 'crypto';

// Initialize Paddle Admin SDK (if you have one, otherwise this is fine)
// Note: Verification does not require the SDK, just the secret key.

export async function POST(request) {
  const paddleSignature = request.headers.get('paddle-signature');
  const rawRequestBody = await request.text();
  
  // --- IMPORTANT: Get your webhook secret from environment variables ---
  const secret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!paddleSignature || !secret) {
    console.error("Paddle signature or secret is missing.");
    return NextResponse.json({ message: "Configuration error." }, { status: 400 });
  }

  // --- Verify the webhook signature to ensure it's from Paddle ---
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

  // --- Process the verified event ---
  const event = JSON.parse(rawRequestBody);
  const db = getFirestore();

  // We primarily care about subscription creation and updates.
  if (event.event_type === 'subscription.created' || event.event_type === 'subscription.updated') {
    const subscriptionData = event.data;
    const userId = subscriptionData.custom_data?.user_id;

    if (!userId) {
      console.error("Webhook received but no user_id found in custom_data.");
      return NextResponse.json({ message: "Webhook processed, but no user_id." }, { status: 200 });
    }

    try {
      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        paddleSubscriptionId: subscriptionData.id,
        subscriptionStatus: subscriptionData.status, // e.g., 'active', 'past_due'
        subscriptionPeriodEnd: subscriptionData.current_billing_period.ends_at,
      });
      console.log(`Successfully updated subscription for user ${userId} to status: ${subscriptionData.status}`);
    } catch (dbError) {
      console.error(`Firestore update failed for user ${userId}:`, dbError);
      // Still return 200 so Paddle doesn't retry. We will handle this internally.
    }
  }

  // Acknowledge receipt of the event
  return NextResponse.json({ message: "Webhook received." }, { status: 200 });
}