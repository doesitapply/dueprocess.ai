import { useState, useEffect } from 'react';
import { json } from 'd3-fetch';
import type { County, GeoJsonData } from '../types';
import { GEOJSON_URL } from '../constants';
import { MOCK_COUNTY_DATA } from '../data/countyData';

export const useMapData = () => {
  const [geoData, setGeoData] = useState<GeoJsonData | null>(null);
  const [complianceData, setComplianceData] = useState<County[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate fetching county data from an API by returning mock data after a short delay
        const fetchCountyData = (): Promise<County[]> => {
          return new Promise(resolve => {
            // Using a timeout to simulate the asynchronous nature of a network request
            setTimeout(() => {
              resolve(MOCK_COUNTY_DATA);
            }, 100); 
          });
        };

        // Fetch both geospatial and compliance data in parallel for better performance
        const [fetchedGeoData, fetchedComplianceData] = await Promise.all([
          json<GeoJsonData>(GEOJSON_URL),
          fetchCountyData() // Use the simulated API call
        ]);

        setGeoData(fetchedGeoData);
        setComplianceData(fetchedComplianceData);

      } catch (err) {
        console.error("Failed to fetch map data:", err);
        const errorMessage = err instanceof Error ? err.message : "Could not load map data.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { geoData, complianceData, loading, error };
};