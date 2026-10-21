export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    require('./scripts/tls-policy.cjs');
  }
}
