export function appendGoogleTag(measurementID: string): void {
  const script = document.createElement('script');

  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementID}`;
  document.head.append(script);
}
