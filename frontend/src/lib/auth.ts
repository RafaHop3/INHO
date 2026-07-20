/**
 * INHO – Auth Token Store (Secure Edition)
 *
 * Access token lives in MEMORY only (module-level variable).
 * JS cannot read the Refresh token — it is stored exclusively in
 * the HttpOnly cookie set by the backend on /auth/login.
 *
 * Why not localStorage?
 *   localStorage is readable by ANY script on the page.
 *   A single XSS payload can steal it silently.
 *   In-memory tokens die with the tab — no persistence = no theft.
 */

// Module-level closure — inaccessible to any external code
let _accessToken: string | null = null;

export const auth = {
  /** Store the access token in memory after login / silent refresh */
  setAccessToken(token: string) {
    _accessToken = token;
  },

  /** Read the in-memory access token */
  getAccessToken(): string | null {
    return _accessToken;
  },

  /** Wipe the in-memory token (on logout or failed refresh) */
  clearAccessToken() {
    _accessToken = null;
  },

  /** True if we have a token in memory AND it's not expired */
  isAuthenticated(): boolean {
    if (!_accessToken) return false;
    return !this.isExpired();
  },

  /**
   * Decode the JWT payload without verifying the signature.
   * Signature verification is the backend's job.
   * We only need the claims (role, sub, exp) for UI rendering.
   */
  parsePayload(): { sub: string; email: string; role: string; exp: number } | null {
    if (!_accessToken) return null;
    try {
      const part = _accessToken.split('.')[1];
      return JSON.parse(atob(part));
    } catch {
      return null;
    }
  },

  isExpired(): boolean {
    const payload = this.parsePayload();
    if (!payload) return true;
    // Add 10s buffer to avoid race conditions at the boundary
    return payload.exp * 1000 < Date.now() + 10_000;
  },
};
