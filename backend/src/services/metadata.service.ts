import { detectProvider, parseHttpUrl, validateRemoteTarget } from '../utils/url-validation.js';
import type { Provider, VideoMetadata } from '../types/video.js';
const platformNames: Record<Provider,string> = {youtube:'YouTube',instagram:'Instagram',tiktok:'TikTok',facebook:'Facebook',x:'X',twitch:'Twitch',kick:'Kick',reddit:'Reddit',vimeo:'Vimeo',direct:'Direct video URL',unknown:'Unknown source'};
const blockedMessage: Record<Provider,string> = {
 youtube:'This release identifies YouTube links but does not download or inspect remote YouTube media. A permitted provider integration is required.',
 instagram:'Instagram media may require authentication or be restricted. This release does not bypass those restrictions.',
 tiktok:'TikTok link detection is available; metadata and downloads require a permitted provider integration.',
 facebook:'Facebook media may be private or authentication-gated. This release does not access restricted media.',
 x:'X link detection is available; metadata and downloads require a permitted provider integration.',
 twitch:'Twitch link detection is available; source-specific metadata and media access are not configured.',
 kick:'Kick link detection is available; source-specific metadata and media access are not configured.',
 reddit:'Reddit link detection is available; source-specific metadata and media access are not configured.',
 vimeo:'Vimeo link detection is available; configure a permitted Vimeo API integration for metadata and media capabilities.',
 direct:'This URL was recognized as a direct media candidate. Only safe, public direct video resources can be inspected; remote trimming is not enabled.'
};
export async function getMetadata(raw: string): Promise<VideoMetadata> {
 const url = parseHttpUrl(raw); const provider = detectProvider(url.toString());
 const result: VideoMetadata = {provider,url:url.toString(),formats:[],capabilities:{metadata:false,thumbnail:false,preview:false,download:false,trim:false,requiresAuthentication:provider!=='direct'},message:blockedMessage[provider]};
 if (provider !== 'direct') return result;
 await validateRemoteTarget(url);
 // HEAD only; redirects are manually revalidated to avoid SSRF through redirect targets.
 let current = url;
 for (let i=0;i<4;i++) {
   await validateRemoteTarget(current);
   const response = await fetch(current, {method:'HEAD',redirect:'manual',signal:AbortSignal.timeout(7000),headers:{'user-agent':'Clipora/1.0 (media metadata inspection)'}});
   if ([301,302,303,307,308].includes(response.status)) {
     const location=response.headers.get('location'); if(!location) throw new Error('The video host returned an invalid redirect.');
     current=new URL(location,current); if(!['http:','https:'].includes(current.protocol)) throw new Error('Redirect protocol is not allowed.'); continue;
   }
   if(!response.ok) { result.message='The source did not allow public metadata inspection. It may require authentication or disallow HEAD requests.'; return result; }
   const type=(response.headers.get('content-type')||'').split(';')[0].toLowerCase();
   if(!type.startsWith('video/')) { result.message='This URL did not identify itself as a direct video resource. Paste a direct video-file URL or upload a file.'; return result; }
   const length=Number(response.headers.get('content-length')||0);
   result.title=current.pathname.split('/').filter(Boolean).pop()||'Direct video';
   result.formats=[{id:'source',container:type.split('/')[1]||'video',label:`Original source (${type})`}];
   result.capabilities={metadata:true,thumbnail:false,preview:false,download:false,trim:false,requiresAuthentication:false};
   result.message=length?`Public video resource detected (${formatBytes(length)}). Remote processing is disabled in this release; upload the file to trim it.`:'Public video resource detected. Remote processing is disabled in this release; upload the file to trim it.';
   return result;
 }
 throw new Error('The source redirected too many times.');
}
function formatBytes(n:number){return n<1024*1024?`${Math.round(n/1024)} KB`:`${(n/1024/1024).toFixed(1)} MB`;}
