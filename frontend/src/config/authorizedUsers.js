// Whitelist of authorized email addresses and domains for LogIQ Industrial Operations Portal

export const AUTHORIZED_EMAILS = [
  'parvmishra44@gmail.com',
  'parv.mishra@factory.io',
  'p.mishra@factory.io',
  'j.vance@factory.io'
];

export const AUTHORIZED_DOMAINS = [
  // Add custom domain if all operators belong to a domain, e.g. 'plant-operations.com'
];

/**
 * Validates whether an email is permitted to access the LogIQ dashboard.
 * @param {string} email 
 * @returns {boolean}
 */
export function isEmailAuthorized(email) {
  if (!email) return false;
  const lowerEmail = email.toLowerCase().trim();

  // 1. Check exact email match in whitelist
  if (AUTHORIZED_EMAILS.some(e => e.toLowerCase() === lowerEmail)) {
    return true;
  }

  // 2. Check allowed domains
  const domain = lowerEmail.split('@')[1];
  if (domain && AUTHORIZED_DOMAINS.some(d => d.toLowerCase() === domain)) {
    return true;
  }

  // 3. Demo Supervisor accounts
  if (lowerEmail.startsWith('p.mishra@') || lowerEmail.startsWith('j.vance@')) {
    return true;
  }

  return false;
}
