// NASA DONKI Configuration & Severity Thresholds

export const DONKI_CONFIG = {
  // Severity classification rules
  STRONG_FLARE_CLASS: 'X',
  MINOR_FLARE_CLASS: 'M',
  STRONG_GST_KP: 7,
  MINOR_GST_KP: 5,

  // Fetch parameters
  LOOKBACK_DAYS: 60,
  MISSION_DAYS_COUNT: 20,
  REQUEST_TIMEOUT_MS: 8000, // 8-second timeout before fallback
  CACHE_TTL_MS: 60 * 60 * 1000, // 1 hour in-memory cache

  // Base endpoints
  PRIMARY_API_BASE: 'https://api.nasa.gov/DONKI',
  FALLBACK_API_BASE: 'https://ccmc.gsfc.nasa.gov/DONKI-API/get',
}

