import { lookup } from 'node:dns/promises';
import ipaddr from 'ipaddr.js';
import type { Provider } from '../types/video.js';
const hostProvider: Array<[RegExp, Provider]> = [
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/i,'youtube'],
  [/(^|\.)instagram\.com$/i,'instagram'], [/(^|\.)tiktok\.com$/i,'tiktok'],
  [/(^|\.)facebook\.com$|(^|\.)fb\.watch$/i,'facebook'], [/(^|\.)x\.com$|(^|\.)twitter\.com$/i,'x'],
  [/(^|\.)twitch\.tv$/i,'twitch'], [/(^|\.)kick\.com$/i,'kick'], [/(^|\.)reddit\.com$|(^|\.)redd\.it$/i,'reddit'], [/(^|\.)vimeo\.com$/i,'vimeo']
];
export function parseHttpUrl(raw: string): URL {
  let url: URL; try { url = new URL(raw.trim()); } catch { throw new Error('Enter a valid video URL.'); }
  if (!['http:','https:'].includes(url.protocol)) throw new Error('Only HTTP and HTTPS links are supported.');
  if (!url.hostname || url.username || url.password) throw new Error('This URL is not supported.');
  if (url.port && !['80','443'].includes(url.port)) throw new Error('Only standard web ports are supported.');
  return url;
}
export function detectProvider(raw: string): Provider {
  const url = parseHttpUrl(raw); const host = url.hostname.toLowerCase().replace(/\.$/,'');
  return hostProvider.find(([pattern]) => pattern.test(host))?.[1] ?? 'direct';
}
export function assertPublicAddress(address: string): void {
  if (!ipaddr.isValid(address)) throw new Error('The video host has an invalid network address.');
  const range = ipaddr.parse(address).range();
  if (range !== 'unicast') throw new Error('Links to private or reserved network addresses are not allowed.');
}
export async function validateRemoteTarget(url: URL): Promise<void> {
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g,'');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host === 'metadata.google.internal') throw new Error('This host is not allowed.');
  if (ipaddr.isValid(host)) { assertPublicAddress(host); return; }
  const records = await lookup(host, { all: true, verbatim: true });
  if (!records.length) throw new Error('The video host could not be resolved.');
  for (const record of records) assertPublicAddress(record.address);
}
