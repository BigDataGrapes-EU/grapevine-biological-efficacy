export interface Correlation {
  sat_prop: string;
  agg_time: string;
  agg_value: string;
  sat_source: string;
  value: number;
}

export interface CorrResult {
  lab_prop: string;
  lab_prop_abr: string;
  correlations: Correlation[];
}

export interface CorrResultData {
  results: CorrResult[];
}

export interface Result {
  property: string;
  value: string;
}

export interface LabResult {
  year: string;
  lab_prop_type: string;
  results: Result[];
}

export interface SatelliteAgg {
  sat_prop: string;
  agg_time: string;
  agg_value: string;
  sat_source: string;
  value: number;
}

export interface SatelliteResult {
  year: string;
  results: SatelliteAgg[];
}

export interface Field {
  sample_id: string;
  Vineyard: string;
  Variety: string;
  Region: string;
  City: string;
  "geocledian_Parcel ID": string;
  lat: number;
  lon: number;
  lab_results: LabResult[];
  satellite_results: SatelliteResult[];
}
