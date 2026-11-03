import { validMeasurementID } from './measurement-id.model.ts';

const {
  VITE_GA_MEASUREMENT_ID
} = import.meta.env;

export const measurementID = validMeasurementID(VITE_GA_MEASUREMENT_ID ?? '');
