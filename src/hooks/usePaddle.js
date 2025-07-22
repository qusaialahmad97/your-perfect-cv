// src/hooks/usePaddle.js

import { useState, useEffect } from 'react';
import { initializePaddle } from '@paddle/paddle-js';

// --- CHANGE 1: The hook now accepts an object with an onCheckoutComplete callback ---
const usePaddle = ({ onCheckoutComplete } = {}) => {
  const [paddle, setPaddle] = useState(null);
  const [isPaddleReady, setIsPaddleReady] = useState(false);

  useEffect(() => {
    initializePaddle({
      environment: 'sandbox',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
      // --- CHANGE 2: Implement the eventCallback to handle events ---
      eventCallback: function(data) {
        console.log('Paddle Event:', data);
        
        // We listen specifically for the 'checkout.completed' event
        if (data.name === 'checkout.completed') {
          // If the component provided a handler function, we call it now.
          if (onCheckoutComplete) {
            onCheckoutComplete(data.data); // Pass the event details to the handler
          }
        }
      }
    }).then((paddleInstance) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
        setIsPaddleReady(true);
        console.log('Paddle.js is initialized and ready!');
      }
    }).catch(error => {
        console.error("Error initializing Paddle:", error);
        setIsPaddleReady(false);
    });
  // --- CHANGE 3: Add the callback to the dependency array ---
  }, [onCheckoutComplete]); 

  return { paddle, isPaddleReady };
};

export default usePaddle;