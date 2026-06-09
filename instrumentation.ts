export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.ENABLE_CUSTOM_DNS === 'true') {
    const dns = await import('dns');
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  }
}
