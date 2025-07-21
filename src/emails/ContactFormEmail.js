// src/emails/ContactFormEmail.js
import React from 'react';

// This component will be rendered into an HTML email
export const ContactFormEmail = ({ name, email, message }) => (
  <div style={{ fontFamily: 'sans-serif', padding: '20px', backgroundColor: '#f9f9f9' }}>
    <div style={{ maxWidth: '600px', margin: 'auto', backgroundColor: 'white', padding: '40px', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h1 style={{ color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        New Contact Form Submission
      </h1>
      <h3 style={{ color: '#555' }}>
        From: {name}
      </h3>
      <h4 style={{ color: '#555', fontWeight: 'normal' }}>
        Email: <a href={`mailto:${email}`} style={{ color: '#007bff' }}>{email}</a>
      </h4>
      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />
      <p style={{ color: '#333', fontSize: '16px', lineHeight: '1.6' }}>
        Message:
      </p>
      <blockquote style={{ borderLeft: '4px solid #007bff', padding: '10px 20px', margin: '20px 0', backgroundColor: '#f4f7fa' }}>
        <p style={{ color: '#555', whiteSpace: 'pre-wrap' }}>{message}</p>
      </blockquote>
    </div>
  </div>
);