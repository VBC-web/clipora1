import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config/env.js';
import { validateRange } from '../utils/time-validation.js';
import type { ProcessingJob } from '../types/video.js';
export const jobs = new Map<string,ProcessingJob>();
let running=0;
export async function inspectMedia(filePath:string):Promise<{duration:number;container:string}> {
 const args=['-v','error','-show_entries','format=duration,format_name','-of','json',filePath];
 const {stdout}=await run('ffprobe',args,15_000); let data:any;
 try{data=JSON.parse(stdout);}catch{throw new Error('The uploaded file is not a readable video.');}
 const duration=Number(data.format?.duration); if(!Number.isFinite(duration)||duration<=0)throw new Error('Could not determine the video duration.');
 if(duration>config.maxDurationSeconds)throw new Error(`Videos must be ${config.maxDurationSeconds} seconds or shorter.`);
 return {duration,container:String(data.format?.format_name||'video').split(',')[0]};
}
export async function createTrimJob(inputPath:string,originalName:string,startValue:unknown,endValue:unknown,duration:number):Promise<ProcessingJob>{
 const range=validateRange(startValue,endValue,duration,config.maxDurationSeconds);
 if(running>=config.maxConcurrentJobs)throw new Error('The processor is busy. Please try again shortly.');
 const id=randomUUID(); const now=Date.now(); const outputPath=path.join(config.storageDir,`${id}.mp4`);
 const job:ProcessingJob={id,status:'queued',createdAt:now,expiresAt:now+config.retentionMs,inputPath,outputPath,originalName,duration:range.duration}; jobs.set(id,job); running++;
 void (async()=>{job.status='processing';
   try {
    // Re-encode for predictable MP4 output and timestamp accuracy. Inputs are local validated uploads only.
    const args=['-hide_banner','-loglevel','error','-y','-ss',String(range.start),'-i',inputPath,'-t',String(range.duration),'-map','0:v:0?','-map','0:a:0?','-c:v','libx264','-preset','veryfast','-crf','23','-c:a','aac','-movflags','+faststart',outputPath];
    await run('ffmpeg',args,Math.max(30_000,range.duration*5000));
    await fs.access(outputPath); job.status='completed'; job.progress=100;
   }catch(e){job.status='failed';job.error=e instanceof Error?e.message:'Processing failed'; if(job.outputPath)await fs.rm(job.outputPath,{force:true}).catch(()=>{});}
   finally{running=Math.max(0,running-1); await fs.rm(inputPath,{force:true}).catch(()=>{});}
 })(); return job;
}
function run(command:string,args:string[],timeout:number):Promise<{stdout:string;stderr:string}>{return new Promise((resolve,reject)=>{
 const child=spawn(command,args,{shell:false,stdio:['ignore','pipe','pipe']}); let stdout='',stderr='';
 child.stdout.on('data',d=>stdout+=d.toString());child.stderr.on('data',d=>stderr+=d.toString());
 const timer=setTimeout(()=>{child.kill('SIGKILL');reject(new Error('Media processing timed out.'));},timeout);
 child.on('error',()=>{clearTimeout(timer);reject(new Error(`${command} is unavailable. Install FFmpeg and FFprobe on the server.`));});
 child.on('close',code=>{clearTimeout(timer);if(code===0)resolve({stdout,stderr});else reject(new Error(stderr.slice(-800)||`${command} failed.`));});
 });}
export async function cleanupExpired(){const now=Date.now();for(const [id,job] of jobs){if(job.expiresAt<now||job.status==='failed'){jobs.delete(id);for(const file of [job.inputPath,job.outputPath].filter(Boolean) as string[])await fs.rm(file,{force:true}).catch(()=>{});}}}
