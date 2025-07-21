import React from 'react';

// This is a simple, clean React component for your email.
// You can style it with inline styles as is standard for emails.

export const VerifyEmailTemplate = ({ email, verificationLink }) => (
  <div style={{ fontFamily: 'sans-serif', padding: '20px', backgroundColor: '#f4f4f4' }}>
    <div style={{ maxWidth: '600px', margin: 'auto', backgroundColor: 'white', padding: '40px', borderRadius: '8px' }}>
      <h1 style={{ color: '#333' }}>Welcome to Your Perfect CV!</h1>
      <p style={{ color: '#555', fontSize: '16px' }}>
        Hello {email},
      </p>
      <p style={{ color: '#555', fontSize: '16px' }}>
        Thank you for signing up. Please click the button below to verify your email address and activate your account.
      </p>
      <a 
        href={verificationLink} 
        target="_blank" 
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          margin: '20px 0',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        Verify Your Email
      </a>
      <p style={{ color: '#777', fontSize: '14px' }}>
        If you did not create an account, no further action is required.
      </p>
      <p style={{ color: '#777', fontSize: '14px' }}>
        Thanks,<br/>
        The Your Perfect CV Team
      </p>
    </div>
  </div>
);