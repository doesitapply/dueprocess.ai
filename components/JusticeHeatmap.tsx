import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { County, GeoJsonData, GeoJsonFeature, TooltipData } from '../types';
import { Tooltip } from './Tooltip';

interface JusticeHeatmapProps {
  geoData: GeoJsonData | null;
  complianceData: County[];
  onCountySelect: (county: County) => void;
  selectedCounty: County | null;
  comparisonList: County[];
  isCompareMode: boolean;
}

const CountyPath: React.FC<{
  feature: GeoJsonFeature;
  pathGenerator: d3.GeoPath<any, any>;
  color: string;
  stroke: string;
  strokeWidth: string;
  onMouseEnter: (event: React.MouseEvent<SVGPathElement>) => void;
  onMouseLeave: () => void;
  onClick: () => void;
}> = React.memo(({ feature, pathGenerator, color, stroke, strokeWidth, onMouseEnter, onMouseLeave, onClick }) => {
  const path = pathGenerator(feature);
  return (
    <path
      d={path || ''}
      fill={color}
      stroke={stroke}
      strokeWidth={strokeWidth}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className="cursor-pointer transition-opacity duration-200"
      style={{ transition: 'fill 0.3s ease, stroke 0.2s ease' }}
    />
  );
});

export const JusticeHeatmap: React.FC<JusticeHeatmapProps> = ({ geoData, complianceData, onCountySelect, selectedCounty, comparisonList, isCompareMode }) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [hoveredFips, setHoveredFips] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // FIX: Corrected typo from SVGSGElement to SVGGElement.
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();
  
  const complianceMap = useMemo(() => {
    const map = new Map<string, County>();
    complianceData.forEach(county => map.set(county.fips, county));
    return map;
  }, [complianceData]);
  
  const comparisonFips = useMemo(() => new Set(comparisonList.map(c => c.fips)), [comparisonList]);

  const colorScale = d3.scaleLinear<string>()
    .domain([0, 50, 75, 100])
    .range(['#FF3366', '#F4C24C', '#00FFCC', '#00FFCC']);

  const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);
  const pathGenerator = d3.geoPath().projection(projection);

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 8])
        .on('zoom', (event) => {
            g.attr('transform', event.transform.toString());
        });

    svg.call(zoom);
    zoomRef.current = zoom;

    return () => {
      svg.on('.zoom', null);
    };
  }, []);

  const handleZoom = (direction: 'in' | 'out') => {
    if (svgRef.current && zoomRef.current) {
      const svg = d3.select(svgRef.current);
      zoomRef.current.scaleBy(svg.transition().duration(250), direction === 'in' ? 1.2 : 0.8);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<SVGPathElement>, county: County) => {
    const { clientX, clientY } = event;
    const svgRect = svgRef.current?.getBoundingClientRect();
    if(svgRect) {
        setTooltip({ x: clientX - svgRect.left, y: clientY - svgRect.top, county });
    }
  };

  if (!geoData) return null;

  return (
    <div className="w-full h-full relative" onMouseLeave={() => setTooltip(null)}>
      <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 975 610">
        <g ref={gRef} className="counties">
          {geoData.features.map(feature => {
            const fips = feature.id;
            const countyData = complianceMap.get(fips);
            
            const isSelected = !isCompareMode && selectedCounty?.fips === fips;
            const isInComparison = isCompareMode && comparisonFips.has(fips);
            const isHovered = hoveredFips === fips;

            let color = 'rgba(55, 65, 81, 0.5)';
            if (countyData) {
              color = colorScale(countyData.compliance_score);
            }

            let stroke = 'var(--bg-dark)';
            let strokeWidth = '0.5';
            if (isSelected) {
              stroke = 'var(--accent)';
              strokeWidth = '2';
            } else if (isInComparison) {
              stroke = 'var(--accent)';
              strokeWidth = '2';
            } else if (isHovered) {
              stroke = 'var(--primary)';
              strokeWidth = '1.5';
            }

            return (
              <CountyPath
                key={fips}
                feature={feature}
                pathGenerator={pathGenerator}
                color={color}
                stroke={stroke}
                strokeWidth={strokeWidth}
                onMouseEnter={(e) => {
                  if (countyData) {
                    setHoveredFips(fips);
                    handleMouseMove(e, countyData);
                  }
                }}
                onMouseLeave={() => {
                  setHoveredFips(null);
                  setTooltip(null);
                }}
                onClick={() => {
                  if(countyData) {
                    onCountySelect(countyData);
                  }
                }}
              />
            );
          })}
        </g>
      </svg>
      {tooltip && <Tooltip data={tooltip} />}
      
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
        <button onClick={() => handleZoom('in')} className="w-8 h-8 rounded-full bg-[#0C0F17]/80 backdrop-blur-md border border-[#00FFFF]/30 text-lg hover:bg-[#00FFFF]/20">+</button>
        <button onClick={() => handleZoom('out')} className="w-8 h-8 rounded-full bg-[#0C0F17]/80 backdrop-blur-md border border-[#00FFFF]/30 text-lg hover:bg-[#00FFFF]/20">-</button>
      </div>

      <div className="absolute bottom-4 left-4 z-10 p-2 bg-[#0C0F17]/80 backdrop-blur-md rounded-lg border border-[#00FFFF]/20">
        <div className="flex items-center gap-2">
          <span className="text-xs">Low</span>
          <div className="w-24 h-2 rounded-full" style={{background: 'linear-gradient(to right, #FF3366, #F4C24C, #00FFCC)'}}></div>
          <span className="text-xs">High</span>
        </div>
        <p className="text-center text-xs text-gray-400 mt-1">Compliance Score</p>
      </div>
    </div>
  );
};