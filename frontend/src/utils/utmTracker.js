/**
 * UTM Parameter Extraction & Session Logger Utility
 */
export function initUtmTracker() {
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams = {};

  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
    if (urlParams.has(param)) {
      utmParams[param] = urlParams.get(param);
    }
  });

  if (Object.keys(utmParams).length > 0) {
    sessionStorage.setItem('logiq_utm_data', JSON.stringify(utmParams));
  }
}

export function getUtmData() {
  try {
    return JSON.parse(sessionStorage.getItem('logiq_utm_data') || '{}');
  } catch (e) {
    return {};
  }
}
