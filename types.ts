
import type { FeatureCollection, Feature, Geometry } from 'geojson';

export type ViolationType = 'Speedy Trial' | 'Brady' | 'Due Process' | 'Public Records' | 'Eighth Amendment';

export interface County {
  fips: string;
  county: string;
  state: string;
  compliance_score: number;
  violations: {
    [key in ViolationType]?: number;
  };
}

export interface GeoJsonFeature extends Feature<Geometry> {
  id: string;
}

export interface GeoJsonData extends FeatureCollection<Geometry, GeoJsonFeature> {}

export interface TooltipData {
  x: number;
  y: number;
  county: County;
}
