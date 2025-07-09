import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import PrintableCv from './PrintableCv';

const ResultView = ({
  generatedCvData,
  isLoading,
  errorMessage,
  primaryColor,
  onAccept,
  onGoBack,
}) => {
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current, // ✅ Corrected this line
    documentTitle: `${generatedCvData?.personalInformation?.name?.replace(/\s/g, '_') || 'My_CV'}`,
  });

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg w-full max-w-7xl mx-auto min-h-[300px] relative">
      <h2 className="text-3xl font-extrabold mb-2 text-center">AI-Generated Draft Is Ready!</h2>
      <p className="text-center text-gray-600 mb-6">
        Your new CV version has been auto-saved. You can now tweak this version, or go back to refine your original input.
      </p>

      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-20 rounded-xl">
          <div
            className="animate-spin rounded-full h-16 w-16 border-t-4"
            style={{ borderColor: primaryColor }}
          ></div>
          <p className="text-xl mt-4" style={{ color: primaryColor }}>
            The AI is writing your CV...
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          {errorMessage}
        </div>
      )}

      {generatedCvData && (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <h3 className="text-xl font-bold mb-3 text-center">Next Steps</h3>
            <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
              <button
                onClick={onAccept}
                className="w-full py-3 px-6 text-md font-bold rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Continue & Edit This Version
              </button>

              <button
                onClick={onGoBack}
                className="w-full py-3 px-6 text-md font-bold rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
              >
                Go Back & Refine Input
              </button>

              <button
                onClick={handlePrint}
                className="w-full py-2 px-4 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 mt-4"
              >
                Download PDF of This Draft
              </button>
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <h3 className="text-xl font-bold mb-3 text-center">Draft Preview</h3>
            <div className="h-[70vh] border rounded-lg shadow-md bg-gray-200 overflow-y-auto">
              <PrintableCv ref={componentRef} data={generatedCvData} primaryColor={primaryColor} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultView;
