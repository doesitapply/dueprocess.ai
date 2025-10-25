
import React, { useState, useEffect } from 'react';
import type { County } from '../types';
import { getInsightStream, getComparisonInsightStream } from '../services/geminiService';

interface InsightSidebarProps {
  data: County | County[] | null;
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: () => void;
}

export const InsightSidebar: React.FC<InsightSidebarProps> = ({ data, isOpen, onClose, onRegenerate }) => {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!data || !isOpen) {
      return;
    }
    
    // Create a controller to abort the stream if the component unmounts or data changes
    const abortController = new AbortController();

    const fetchInsight = async () => {
      setLoading(true);
      setError(null);
      setInsight('');
      try {
        const stream = Array.isArray(data)
          ? await getComparisonInsightStream(data)
          : await getInsightStream(data);

        for await (const chunk of stream) {
           if (abortController.signal.aborted) break;
          setInsight(prev => prev + chunk.text);
        }
      } catch (e) {
        if (!abortController.signal.aborted) {
          setError('Failed to generate insight. Please try again.');
          console.error(e);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchInsight();
    
    return () => {
      abortController.abort();
    }

  }, [data, isOpen]);

  const sidebarClasses = `
    fixed top-0 right-0 h-full w-full md:w-1/3 lg:w-1/4
    bg-[#0C0F17]/90 backdrop-blur-lg border-l-2 border-[#00FFFF]/30 glowing-border
    transform transition-transform duration-300 ease-in-out z-30 p-6 flex flex-col
    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
  `;

  const isComparison = Array.isArray(data);
  const singleCounty = !isComparison ? data : null;
  const comparisonList = isComparison ? data : [];

  return (
    <div className={sidebarClasses}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display glowing-text text-[#00FFFF]">{isComparison ? 'Comparison' : 'AI Insight'}</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-[#00FFFF]/20 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#A0A0A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {data && (
        <>
          <div className="mb-4">
            {singleCounty && (
              <>
                <h3 className="text-xl font-bold text-white">{singleCounty.county}, {singleCounty.state}</h3>
                <p className="text-[#F4C24C]">Compliance Score: {singleCounty.compliance_score}</p>
              </>
            )}
            {isComparison && (
               <div>
                 <h3 className="text-xl font-bold text-white mb-2">Comparing:</h3>
                 <ul className="space-y-1 text-sm">
                   {comparisonList.map(c => (
                     <li key={c.fips}>{c.county}, {c.state} - <span className="text-[#F4C24C]">Score: {c.compliance_score}</span></li>
                   ))}
                 </ul>
               </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            {loading && <LoadingSpinner />}
            {error && <p className="text-[#FF3366]">{error}</p>}
            {insight && <p className="text-gray-300 whitespace-pre-wrap">{insight}</p>}
          </div>
          <button 
            onClick={onRegenerate}
            disabled={loading}
            className="mt-4 w-full bg-[#00FFFF]/20 text-[#00FFFF] font-bold py-2 px-4 rounded-lg border border-[#00FFFF]
            hover:bg-[#00FFFF]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Regenerate Insight'}
          </button>
        </>
      )}
    </div>
  );
};

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-2 text-center text-[#A0A0A0]">
    <div className="w-8 h-8 border-4 border-[#00FFFF] border-t-transparent rounded-full animate-spin"></div>
    <p>Gemini is analyzing data...</p>
  </div>
);
