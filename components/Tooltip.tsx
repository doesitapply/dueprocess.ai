import React from 'react';
import type { TooltipData } from '../types';

interface TooltipProps {
  data: TooltipData;
}

export const Tooltip: React.FC<TooltipProps> = ({ data }) => {
  const { x, y, county } = data;
  const top3Violations = Object.entries(county.violations)
    // FIX: The violation counts (`a` and `b`) can be undefined, causing an arithmetic error during sorting.
    // Use the nullish coalescing operator (??) to provide a default value of 0.
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
    .slice(0, 3);
  
  return (
    <div
      className="absolute p-3 rounded-md bg-[#0C0F17]/90 border border-[#00FFFF]/30 shadow-lg pointer-events-none transition-transform duration-100 ease-out"
      style={{ 
        left: `${x}px`, 
        top: `${y}px`,
        transform: 'translate(15px, 15px)',
        minWidth: '200px',
        maxWidth: '300px'
      }}
      aria-live="polite"
    >
      <h3 className="font-bold text-lg text-white font-display">{county.county}, {county.state}</h3>
      <p className="text-[#F4C24C] font-semibold">
        Compliance Score: <span className="text-xl">{county.compliance_score}</span>
      </p>
      <div className="mt-2 border-t border-[#00FFFF]/20 pt-2">
        <h4 className="text-sm font-semibold text-[#A0A0A0] mb-1">Top Violations:</h4>
        <ul className="text-xs space-y-1">
          {top3Violations.map(([type, count]) => (
            <li key={type} className="flex justify-between">
              <span>{type}</span>
              <span className="font-mono text-[#F4C24C]">{count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
