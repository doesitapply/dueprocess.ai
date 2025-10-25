
import React, { useCallback } from 'react';
import type { ViolationType } from '../types';

interface ControlsProps {
  scoreRange: [number, number];
  setScoreRange: (range: [number, number]) => void;
  violationFilter: ViolationType | 'All';
  setViolationFilter: (filter: ViolationType | 'All') => void;
  violationTypes: ViolationType[];
  isCompareMode: boolean;
  setIsCompareMode: (enabled: boolean) => void;
}

export const Controls: React.FC<ControlsProps> = ({ scoreRange, setScoreRange, violationFilter, setViolationFilter, violationTypes, isCompareMode, setIsCompareMode }) => {
  
  const handleMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), scoreRange[1] - 1);
    setScoreRange([newMin, scoreRange[1]]);
  }, [scoreRange, setScoreRange]);

  const handleMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), scoreRange[0] + 1);
    setScoreRange([scoreRange[0], newMax]);
  }, [scoreRange, setScoreRange]);
  
  const rangePercentageMin = (scoreRange[0] / 100) * 100;
  const rangePercentageMax = (scoreRange[1] / 100) * 100;

  return (
    <div className="absolute top-4 left-4 z-10 p-4 bg-[#0C0F17]/80 backdrop-blur-md rounded-lg border border-[#00FFFF]/20 glowing-border flex flex-col md:flex-row items-center gap-6">
      <div className="w-full md:w-64">
        <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Compliance Score</label>
        <div className="relative h-4 flex items-center">
            <div className="relative w-full h-1 bg-gray-700 rounded-full">
                <div className="absolute h-1 bg-[#00FFFF] rounded-full" style={{ left: `${rangePercentageMin}%`, right: `${100 - rangePercentageMax}%` }}></div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={scoreRange[0]}
                    onChange={handleMinChange}
                    className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none top-0 m-0 range-thumb"
                />
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={scoreRange[1]}
                    onChange={handleMaxChange}
                    className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none top-0 m-0 range-thumb"
                />
                <style>{`
                  .range-thumb { z-index: 20; }
                  .range-thumb::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #F4C24C;
                    border: 2px solid #0C0F17;
                    border-radius: 50%;
                    cursor: pointer;
                    pointer-events: auto;
                    margin-top: -7px;
                  }
                  .range-thumb::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    background: #F4C24C;
                    border: 2px solid #0C0F17;
                    border-radius: 50%;
                    cursor: pointer;
                    pointer-events: auto;
                  }
                `}</style>
            </div>
        </div>
        <div className="flex justify-between mt-1">
            <span className="font-mono text-sm text-[#F4C24C]">{scoreRange[0]}</span>
            <span className="font-mono text-sm text-[#F4C24C]">{scoreRange[1]}</span>
        </div>
      </div>
      <div className="w-full md:w-auto">
        <label htmlFor="violation-filter" className="block text-sm font-medium text-[#A0A0A0] mb-1">Violation Type</label>
        <select
          id="violation-filter"
          value={violationFilter}
          onChange={(e) => setViolationFilter(e.target.value as ViolationType | 'All')}
          className="bg-[#0C0F17] border border-[#00FFFF]/30 text-white text-sm rounded-lg focus:ring-[#F4C24C] focus:border-[#F4C24C] block w-full p-2.5"
        >
          <option value="All">All Types</option>
          {violationTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
       <div className="w-full md:w-auto flex flex-col items-center">
        <label className="block text-sm font-medium text-[#A0A0A0] mb-1">Compare Mode</label>
        <label htmlFor="compare-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                id="compare-toggle" 
                type="checkbox" 
                className="sr-only" 
                checked={isCompareMode} 
                onChange={(e) => setIsCompareMode(e.target.checked)} 
              />
              <div className="block bg-gray-600 w-12 h-6 rounded-full"></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${isCompareMode ? 'translate-x-full bg-[#F4C24C]' : ''}`}></div>
            </div>
          </label>
      </div>
    </div>
  );
};
