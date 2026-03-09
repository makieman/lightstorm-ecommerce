/**
 * Utility helpers for auth
 */

const isTokenInvalidatedByPasswordChange = (claims, user) => {
  if (!claims || !claims.iat) return false;
  if (!user || !user.passwordChangedAt) return false;

  const tokenIssuedAtMs = claims.iat * 1000;
  const pwdChangedAtMs = new Date(user.passwordChangedAt).getTime();
  return tokenIssuedAtMs < pwdChangedAtMs;
};

module.exports = { isTokenInvalidatedByPasswordChange };
