
import React, { useState, useMemo, useCallback } from 'react';
import { JusticeHeatmap } from './components/JusticeHeatmap';
import { InsightSidebar } from './components/InsightSidebar';
import { Controls } from './components/Controls';
import { useMapData } from './hooks/useMapData';
import type { County, ViolationType } from './types';
import { VIOLATION_TYPES } from './constants';

const App: React.FC = () => {
  const { geoData, complianceData, loading } = useMapData();
  
  // Selection State
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [comparisonList, setComparisonList] = useState<County[]>([]);

  // Filter State
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
  const [violationFilter, setViolationFilter] = useState<ViolationType | 'All'>('All');
  
  // Mode State
  const [isInsightMode, setIsInsightMode] = useState(true);
  const [isCompareMode, setIsCompareMode] = useState(false);

  const filteredComplianceData = useMemo(() => {
    return complianceData.filter(county => {
      const score = county.compliance_score;
      const inRange = score >= scoreRange[0] && score <= scoreRange[1];
      if (!inRange) return false;

      if (violationFilter !== 'All') {
        return Object.keys(county.violations).includes(violationFilter);
      }
      
      return true;
    });
  }, [complianceData, scoreRange, violationFilter]);

  const handleCountySelect = useCallback((county: County) => {
    if (isCompareMode) {
      setComparisonList(prev => {
        const isSelected = prev.find(c => c.fips === county.fips);
        if (isSelected) {
          return prev.filter(c => c.fips !== county.fips);
        }
        if (prev.length < 3) {
          return [...prev, county];
        }
        // TODO: Add a user notification for max selection
        return prev; 
      });
      setSelectedCounty(null);
    } else {
      // If the same county is clicked again, deselect it. Otherwise, select the new one.
      setSelectedCounty(prev => (prev?.fips === county.fips ? null : county));
      setComparisonList([]);
    }
  }, [isCompareMode]);
  
  const handleRegenerate = () => {
    if (isCompareMode && comparisonList.length > 0) {
      setComparisonList([...comparisonList]);
    } else if (!isCompareMode && selectedCounty) {
      setSelectedCounty({...selectedCounty});
    }
  }
  
  const handleSetCompareMode = (enabled: boolean) => {
    setIsCompareMode(enabled);
    setSelectedCounty(null);
    setComparisonList([]);
  };

  const isSidebarOpen = isInsightMode && ((!isCompareMode && selectedCounty !== null) || (isCompareMode && comparisonList.length >= 2));

  return (
    <div className="flex flex-col h-screen bg-[#0C0F17] text-gray-300 overflow-hidden">
      <header className="p-4 border-b border-[#00FFFF]/20 flex items-center justify-between z-20 bg-[#0C0F17]/80 backdrop-blur-sm">
        <h1 className="text-2xl font-display glowing-text text-[#00FFFF]">DueProcess.ai Justice Heatmap</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-[#A0A0A0]">AI INSIGHT MODE</span>
          <label htmlFor="insight-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                id="insight-toggle" 
                type="checkbox" 
                className="sr-only" 
                checked={isInsightMode} 
                onChange={() => setIsInsightMode(!isInsightMode)} 
              />
              <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isInsightMode ? 'translate-x-full bg-[#00FFFF]' : ''}`}></div>
            </div>
          </label>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col relative">
          <Controls 
            scoreRange={scoreRange}
            setScoreRange={setScoreRange}
            violationFilter={violationFilter}
            setViolationFilter={setViolationFilter}
            violationTypes={VIOLATION_TYPES}
            isCompareMode={isCompareMode}
            setIsCompareMode={handleSetCompareMode}
          />
          <div className="flex-1 w-full h-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg className="animate-spin h-10 w-10 text-[#00FFFF] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="font-display text-lg text-[#F4C24C]">Loading Geospatial Data...</p>
                </div>
              </div>
            ) : (
              <JusticeHeatmap 
                geoData={geoData}
                complianceData={filteredComplianceData}
                onCountySelect={handleCountySelect}
                selectedCounty={selectedCounty}
                comparisonList={comparisonList}
                isCompareMode={isCompareMode}
              />
            )}
          </div>
          {isCompareMode && comparisonList.length > 0 && (
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 p-3 bg-[#0C0F17]/80 backdrop-blur-md rounded-lg border border-[#F4C24C]/30 glowing-border flex items-center gap-4 animate-fade-in-up">
               <h3 className="font-display text-[#F4C24C] text-sm whitespace-nowrap">Comparing ({comparisonList.length}/3):</h3>
               <div className="flex items-center gap-2">
                 {comparisonList.map(c => (
                   <div key={c.fips} className="flex items-center gap-1 bg-gray-700/50 px-2 py-1 rounded">
                     <span className="text-xs text-white">{c.county}</span>
                     <button onClick={() => handleCountySelect(c)} className="text-gray-400 hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                     </button>
                   </div>
                 ))}
               </div>
                {comparisonList.length < 2 && <p className="text-xs text-gray-400">Select at least one more county to analyze.</p>}
             </div>
          )}
        </main>
        
        <InsightSidebar 
          data={isCompareMode ? comparisonList : selectedCounty}
          isOpen={isSidebarOpen}
          onClose={() => {
            setSelectedCounty(null);
            // Don't clear comparison list on close, only hide sidebar
          }}
          onRegenerate={handleRegenerate}
        />
      </div>
    </div>
  );
};

export default App;
