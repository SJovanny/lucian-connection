export const PICKUP_ADDRESS = "119 rue Lamartine, 97200 Fort-de-France, Martinique";

export const PICKUP_GOOGLE_MAPS_URL =
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(PICKUP_ADDRESS)}`;

export const PICKUP_WAZE_URL =
  `https://www.waze.com/ul?q=${encodeURIComponent(PICKUP_ADDRESS)}&navigate=yes`;
