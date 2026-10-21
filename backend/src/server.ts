import {app} from './app.js';import {config} from './config/env.js';
app.listen(config.port,'0.0.0.0',()=>console.log(`Clipora API listening on port ${config.port}`));
