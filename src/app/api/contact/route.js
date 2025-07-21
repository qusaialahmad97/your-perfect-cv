// src/app/api/contact/route.js

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ContactFormEmail } from '@/emails/ContactFormEmail';

// Initialize Resend with your API key from your .env.local file
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    console.log(`Received contact form submission from ${name} (${email})`);

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      // Use your verified domain. Using a name makes it look more professional.
      from: 'Contact Form <noreply@updates.yourperfectcv.com>',
      to: 'support@yourperfectcv.com', // Your designated support email
      subject: `New Message from ${name} via Your Perfect CV`,
      
      // This is a crucial feature! When you hit "Reply" in your email client,
      // it will automatically reply to the user's email address.
      reply_to: email,

      // Render the React component to HTML
      react: <ContactFormEmail name={name} email={email} message={message} />,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ message: 'Error sending email.' }, { status: 500 });
    }

    console.log('Email sent successfully! ID:', data.id);
    return NextResponse.json({ message: 'Message sent successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}