/* Public configuration. Insert only the deployed Google Apps Script web-app URL.
 * Do not include Google Sheet IDs, folder IDs, or API secrets.
 * Visitors are linked directly to Google-hosted proof submission, not an iframe. */
window.OURGLASS_PAYMENT_FORM_URL = "https://script.google.com/macros/s/AKfycbw-uOAS3TlrvrDmihg5j6EvMARKkX5mNyriDN0fZvpFlbUx07YOLCf90gHoyVoE3FnP6A/exec";
/* Invitation contacts are sent directly to the owner-controlled Apps Script doPost intake. */
window.OURGLASS_INVITATION_POST_URL = "https://script.google.com/macros/s/AKfycbw-uOAS3TlrvrDmihg5j6EvMARKkX5mNyriDN0fZvpFlbUx07YOLCf90gHoyVoE3FnP6A/exec";
/* Donation POST route has been deployed and tested with proof intake; retain server-side verification. */
window.OURGLASS_SMART_MOVE_POST_READY = true;
