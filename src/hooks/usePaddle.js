// src/hooks/usePaddle.js

import { useEffect } from 'react';
import { initializePaddle, Paddle } from '@paddle/paddle-js';

// This hook will handle initializing Paddle on the client side
const usePaddle = () => {
  useEffect(() => {
    // Initialize Paddle.js
    initializePaddle({
      environment: 'sandbox', // Use 'production' when you go live
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
      // You can add event callbacks here if needed
      // eventCallback: function(data) { ... }
    }).then((paddleInstance) => {
      if (paddleInstance) {
        // The paddleInstance is available for use here
        // For example, you could store it in a context or state if needed globally
        console.log('Paddle.js is initialized and ready!');
      }
    }).catch(error => {
        console.error("Error initializing Paddle:", error);
    });
  }, []); // The empty dependency array ensures this runs only once

  return null; // This hook doesn't need to return anything, it just runs the setup
};

export default usePaddle;