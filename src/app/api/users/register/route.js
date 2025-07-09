// src/app/api/users/register/route.js

import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore'; // For saving user profiles

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

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    // Use Firebase Admin to create the user in Firebase Authentication
    const userRecord = await getAuth().createUser({
      email: email,
      password: password,
    });

    // Also, create a user document in Firestore to store their CVs
    const db = getFirestore();
    await db.collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      createdAt: new Date().toISOString(),
      cvs: [] // Start with an empty array for CVs
    });

    return NextResponse.json({ message: 'User registered successfully!', uid: userRecord.uid }, { status: 201 });

  } catch (error) {
    let errorMessage = 'An error occurred during registration.';
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'This email address is already in use.';
    }
    console.error('Registration Error:', error.message);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}