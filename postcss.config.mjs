/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // --- THIS IS THE FIX ---
    // Change 'tailwindcss' to '@tailwindcss/postcss'
    '@tailwindcss/postcss': {},
    // --- END OF FIX ---
    
    autoprefixer: {},
  },
};

export default config;