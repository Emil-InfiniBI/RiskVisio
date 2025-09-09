// Utilities for multi-company (multi-tenant) identification

function sanitize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '')
    .slice(0, 64);
}

// Determine tenant id from URL: ?tenant=acme | /t/acme | subdomain acme.example.com
export function getTenantId(): string | null {
  try {
    const { hostname, pathname, search } = window.location;

    // 1) Query param ?tenant=xyz
    const params = new URLSearchParams(search);
    const qp = params.get('tenant');
    if (qp) return sanitize(qp);

    // 2) Path prefix /t/<tenant>/...
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 2 && parts[0] === 't') {
      return sanitize(parts[1]);
    }

    // 3) Subdomain <tenant>.domain.tld (ignore localhost, IPs)
    const isLocalhost = hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname);
    const labels = hostname.split('.');
    if (!isLocalhost && labels.length > 2) {
      return sanitize(labels[0]);
    }
  } catch {
    // ignore
  }
  return null;
}

export function withTenantPrefix(key: string, namespace?: string, tenantId?: string | null): string {
  const ns = namespace ? `${namespace}:` : '';
  const tenant = tenantId ? `tenant:${tenantId}:` : '';
  return `${ns}${tenant}${key}`;
}
