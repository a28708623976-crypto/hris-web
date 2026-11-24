import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {execFileSync} from 'node:child_process';
import {unlinkSync} from 'node:fs';
const outfile=fileURLToPath(new URL('./.render-routes.cjs',import.meta.url));
try{await build({entryPoints:['qa/render-routes.tsx'],bundle:true,platform:'node',format:'cjs',packages:'external',outfile,jsx:'automatic'});execFileSync(process.execPath,[outfile],{stdio:'inherit'})}finally{try{unlinkSync(outfile)}catch{}}
