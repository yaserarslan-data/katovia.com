import {createStorage} from '../../core/storage.js';
import {reconstructProject} from './reconstruct.js';
import {validateProject} from './model.js';
export function projectStorage(getBackend){const adapter=createStorage({namespace:'katovia:language-forge',version:1,...(getBackend?{getBackend}:{})});return {load(){try{const p=adapter.get('active');return p?reconstructProject(p):null;}catch{return null;}},save(project){return adapter.set('active',validateProject(project));},clear(){return adapter.remove('active');}};}
