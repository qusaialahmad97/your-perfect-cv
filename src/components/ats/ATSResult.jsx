import React from 'react';

// A simple component for a keyword tag
const KeywordTag = ({ text, color = 'blue' }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
  };
  return <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${colorClasses[color]}`}>{text}</span>;
};

const ATSResult = ({ result, onReset }) => {
  const { matchScore, matchedKeywords, missingKeywords, summary } = result;

  const getScoreColor = (score) => {
    if (score > 75) return 'text-green-500';
    if (score > 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl border w-full max-w-4xl mx-auto text-left">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800">Analysis Complete</h2>
        <button onClick={onReset} className="text-sm text-blue-600 hover:underline">← Analyze Another</button>
      </div>

      {/* Score and Summary */}
      <div className="grid md:grid-cols-3 gap-6 mb-8 items-center">
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
          <p className="text-lg font-semibold text-gray-600">Match Score</p>
          <p className={`text-7xl font-bold ${getScoreColor(matchScore)}`}>{matchScore}%</p>
        </div>
        <div className="md:col-span-2">
          <h3 className="text-xl font-bold mb-2">Summary & Advice</h3>
          <p className="text-gray-600">{summary}</p>
        </div>
      </div>
      
      {/* Matched Keywords */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 text-green-700">✅ Matched Skills & Keywords</h3>
        {matchedKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {matchedKeywords.map((kw, i) => <KeywordTag key={i} text={kw} color="green" />)}
          </div>
        ) : (
          <p className="text-gray-500 italic">No strong keyword matches found.</p>
        )}
      </div>

      {/* Missing Keywords */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-red-700">❌ Missing Keywords</h3>
        {missingKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((kw, i) => <KeywordTag key={i} text={kw} color="red" />)}
          </div>
        ) : (
          <p className="text-gray-500 italic">Great job! No critical keywords seem to be missing.</p>
        )}
      </div>
    </div>
  );
};

export default ATSResult;