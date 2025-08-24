import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { Resend } from 'resend';
import { VerifyEmailTemplate } from '@/emails/VerifyEmailTemplate';

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { email, password } = await request.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ message: 'Email and password (min 6 characters) are required.' }, { status: 400 });
    }

    const userRecord = await getAuth().createUser({
      email: email,
      password: password,
      emailVerified: false,
    });

    await getFirestore().collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      createdAt: new Date().toISOString(),
      cvs: [],
      paddleSubscriptionId: null,
      subscriptionStatus: 'inactive',
      subscriptionPeriodEnd: null,
    });

    const verificationLink = await getAuth().generateEmailVerificationLink(email);

    try {
      console.log(`Attempting to send verification email to ${email}...`);
      const { data, error } = await resend.emails.send({
        from: 'welcome@updates.yourperfectcv.com',
        to: email,
        subject: 'Verify Your Email for Your Perfect CV',
        react: <VerifyEmailTemplate email={email} verificationLink={verificationLink} />,
      });

      if (error) {
        console.error('Resend API Error:', error);
      } else {
        console.log('Resend successfully sent email. ID:', data.id);
      }
    } catch (emailError) {
      console.error('Caught an exception while trying to send email:', emailError);
    }

    return NextResponse.json({ 
      message: 'Registration successful! A verification email has been sent to your inbox.', 
      uid: userRecord.uid 
    }, { status: 201 });

  } catch (error) {
    let errorMessage = 'An error occurred during registration.';
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'This email address is already in use.';
    }
    console.error('Firebase Registration Error:', error);
    return NextResponse.json({ message: errorMessage }, { status: 400 });
  }
}