// Read-only publication graph; no working-tree writes or external requests.
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {posix} from 'node:path';
const sha=process.argv[2];if(!/^[a-f0-9]{40}$/.test(sha||''))throw new Error('Supply an exact Git commit');
const files=execFileSync('git',['ls-tree','-r','--name-only',sha]).toString().trim().split('\n');
const packed=execFileSync('git',['cat-file','--batch'],{input:files.map(f=>`${sha}:${f}`).join('\n')+'\n',maxBuffer:30e6});
const retirement=JSON.parse(readFileSync('scripts/cleanup-phase1-retirements.json','utf8')),retired=new Set(retirement.paths),all=new Set([...files,...retired]);let offset=0;const edges=[];
for(const file of files){const end=packed.indexOf(10,offset),size=Number(packed.subarray(offset,end).toString().split(' ')[2]);const body=packed.subarray(end+1,end+1+size).toString();offset=end+2+size;if(!/\.(html|js|css|xml|json|md|txt)$/.test(file))continue;
 for(const match of body.matchAll(/["'`]([^"'`\s]+\.(?:js|css|jpg|png|svg|txt))(?:[?#][^"'`]*)?["'`]/g)){const name=match[1];if(/^https?:/.test(name))continue;const target=name.startsWith('/')?name.slice(1):posix.normalize(posix.join(posix.dirname(file),name));if(all.has(target))edges.push([file,target]);}
}
const existing=files.filter(f=>retired.has(f)),references=edges.filter(([,to])=>retired.has(to));
console.log(JSON.stringify({commit:sha,files:files.length,referenceEdges:edges.length,retiredExisting:existing,retiredReferences:references},null,2));
if(existing.length||references.length)process.exitCode=1;
