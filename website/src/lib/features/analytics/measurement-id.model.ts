const measurementIDPattern = /^G-[A-Z0-9]+$/;

export function validMeasurementID(value: string): string {
  if (!measurementIDPattern.test(value)) {
    return '';
  }

  return value;
}
