// src/hooks/usePaddle.js

import { useState, useEffect } from 'react';
import { initializePaddle } from '@paddle/paddle-js';

// This hook will handle initializing Paddle and providing the instance and its ready state.
const usePaddle = () => {
  // State to hold the Paddle instance once it's initialized and ready
  const [paddle, setPaddle] = useState(null);
  
  // State to explicitly track readiness, making it easy for components to check.
  const [isPaddleReady, setIsPaddleReady] = useState(false);

  useEffect(() => {
    // The initializePaddle function returns a promise. We'll use that to set our state.
    initializePaddle({
      environment: 'sandbox', // Or 'production'
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
      eventCallback: function(data) {
        // You can handle paddle events here, e.g., when a checkout is completed.
        console.log('Paddle Event:', data);
      }
    }).then((paddleInstance) => {
      if (paddleInstance) {
        // Once initialization is successful, store the instance in state
        // and set our ready flag to true.
        setPaddle(paddleInstance);
        setIsPaddleReady(true);
        console.log('Paddle.js is initialized and ready!');
      }
    }).catch(error => {
        console.error("Error initializing Paddle:", error);
        // If it fails, we ensure the ready flag is false.
        setIsPaddleReady(false);
    });
  }, []); // The empty dependency array ensures this runs only once

  // Return both the readiness state and the paddle instance.
  return { paddle, isPaddleReady };
};

export default usePaddle;