import {i18n,t} from '../i18n/index.js';
import {track} from '../core/analytics.js';
import '../styles/tools.css';
import '../styles/new-tools.css';
export function toolUi(root){let dead=false,key='',params={};const removers=[];const status=root.querySelector('[data-tool-status]');const renderStatus=()=>{if(!dead)status.textContent=key?t(key,params):'';};const unsubscribe=i18n.subscribe(renderStatus);root.dataset.ready='true';track('tool_opened',{tool_slug:root.dataset.tool});return {get dead(){return dead;},listen(node,event,fn,options){node.addEventListener(event,fn,options);removers.push(()=>node.removeEventListener(event,fn,options));},status(next,values={}){key=next;params=values;renderStatus();},translate:t,number:(value,options)=>i18n.number(value,options),subscribe(fn){const off=i18n.subscribe(fn);removers.push(off);},dispose(){dead=true;unsubscribe();removers.forEach(fn=>fn());root.dataset.ready='false';}};}
export function canvasBlob(canvas,type='image/png',quality){return new Promise((resolve,reject)=>{canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('image.encodeError')),type,quality);});}
