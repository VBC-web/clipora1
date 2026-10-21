import type {ErrorRequestHandler} from 'express';
export const errorHandler:ErrorRequestHandler=(err,req,res,_next)=>{const status=Number(err?.status)||400; const message=typeof err?.message==='string'?err.message:'Request failed.'; if(status>=500)console.error('Request failed:',req.method,req.path);res.status(status).json({error:message});};
