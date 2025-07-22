// src/components/PageContainer.jsx

import React from 'react';

const PageContainer = ({ children }) => {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </main>
  );
};

export default PageContainer;