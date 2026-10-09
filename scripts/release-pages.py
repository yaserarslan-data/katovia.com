"""Explicit artifact-only Pages release. Run baseline, prepare, publish with a release label.
Uses existing credential manager in memory; never writes/logs credentials. No new hosting/billing.
"""
from pathlib import Path
import os,sys,json,subprocess,urllib.request,urllib.error,time,hashlib,concurrent.futures
ROOT=Path(__file__).resolve().parent.parent;os.chdir(ROOT)
os.environ['GIT_TERMINAL_PROMPT']='0';os.environ['GCM_INTERACTIVE']='never'
mode,label=sys.argv[1:3];assert label.isalnum(),'Release label must be alphanumeric'
folder=ROOT/'.cache/releases'/label;folder.mkdir(parents=True,exist_ok=True)
opener=urllib.request.build_opener(urllib.request.ProxyHandler({}))
def git(*args,input=None,env=None):return subprocess.check_output(['git',*args],input=input,env=env).decode().strip()
credential=subprocess.run(['git','credential','fill'],input='protocol=https\nhost=github.com\n\n',text=True,capture_output=True,check=True)
token=dict(line.split('=',1) for line in credential.stdout.splitlines() if '=' in line).get('password');assert token
def api(path):
    req=urllib.request.Request('https://api.github.com/repos/yaserarslan-data/katovia.com/'+path,headers={'Authorization':'Bearer '+token,'User-Agent':'Katovia-release','Accept':'application/vnd.github+json'})
    with opener.open(req,timeout=30) as response:return json.load(response)
def remote():return git('ls-remote','origin','refs/heads/main').split()[0]
def settings():
    value=api('pages');assert value['source']=={'branch':'main','path':'/'} and value['cname']=='katovia.com' and value['public'] and value['https_enforced'];return value
def public(path):
    req=urllib.request.Request('https://katovia.com/'+path,headers={'User-Agent':'Katovia-release-QA','Cache-Control':'no-cache'})
    with opener.open(req,timeout=30) as response:return response.read()
def served(path):return Path(path).suffix.lower() in ['.html','.js','.css','.txt','.jpg','.png','.svg','.json','.xml']
def verify(tree,paths):
    def one(path):
        expected=subprocess.check_output(['git','show',tree+':'+path]);actual=public(path)
        if actual!=expected:raise RuntimeError('Live bytes mismatch: '+path)
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:list(pool.map(one,paths))
def wait(sha):
    for _ in range(60):
        build=api('pages/builds/latest');print('Pages',build['status'],build['commit'],flush=True)
        if build['commit']==sha and build['status']=='built':return build
        if build['commit']==sha and build['status']=='errored':raise RuntimeError('Pages build failed')
        time.sleep(10)
    raise RuntimeError('Pages timeout')
planpath=folder/'plan.json'
if mode=='baseline':
    settings();base=remote();git('fetch','origin','main');build=api('pages/builds/latest');assert build['commit']==base and build['status']=='built'
    paths=[path for path in git('ls-tree','-r','--name-only',base).splitlines() if served(path)]
    verify(base,paths)
    (folder/'known-good.tar').write_bytes(subprocess.check_output(['git','archive','--format=tar',base]))
    plan={'base':base,'paths':paths,'status':'baseline_verified','settings':settings()};planpath.write_text(json.dumps(plan,indent=2));print('Baseline verified',base,len(paths),'served files',flush=True)
elif mode=='prepare':
    plan=json.loads(planpath.read_text());assert plan['base']==remote();settings()
    subprocess.run(['node','scripts/check-artifact.mjs'],check=True)
    preserved={file['path'] for file in json.loads(Path('scripts/legacy-manifest.json').read_text())['files'] if file['path']!='index.html'}
    cleanup=json.loads(Path('scripts/cleanup-phase1-retirements.json').read_text()) if label=='Cleanup1' else None
    if cleanup:assert cleanup['releaseLabel']==label and cleanup['base']==plan['base'] and not cleanup['referenceAudit']['externalIncoming']
    basepaths=set(git('ls-tree','-r','--name-only',plan['base']).splitlines())
    updated=set(cleanup['updatedLegacyPaths']) if cleanup else set()
    paths=[p.relative_to('dist').as_posix() for p in Path('dist').rglob('*') if p.is_file() and (p.relative_to('dist').as_posix() not in preserved or p.relative_to('dist').as_posix() in updated or p.relative_to('dist').as_posix() not in basepaths)]
    env=os.environ.copy();env['GIT_INDEX_FILE']=str(folder/'publication.index');git('read-tree',plan['base'],env=env)
    hashes={}
    for path in paths:
        p=Path('dist')/path;assert not p.is_symlink();data=p.read_bytes();blob=git('hash-object','-w','--stdin',input=data);git('update-index','--add','--cacheinfo',f'100644,{blob},{path}',env=env);hashes[path]=hashlib.sha256(data).hexdigest()
    retired=[]
    if label=='Character1':
        retirement=json.loads(Path('scripts/retired-alphabet-assets.json').read_text())
        assert retirement['releaseLabel']==label and retirement['base']==plan['base']
        for path in retirement['paths']:
            assert path.startswith('katovia-assets/') and Path(path).suffix=='.js' and '/' not in path[len('katovia-assets/'):]
            assert path not in preserved and path not in paths
            previous=subprocess.check_output(['git','show',plan['base']+':'+path])
            assert b'alphabet-lab-v1.0.0' in previous and b'UNICODE LICENSE V3' in previous,'Retirement must target the old Alphabet-only data payload'
            git('update-index','--force-remove',path,env=env);retired.append(path)
    if cleanup:
        for path in cleanup['paths']:
            assert path in basepaths and path not in paths and path not in preserved
            assert (path.startswith('katovia-assets/') and Path(path).suffix in ['.js','.css']) or path in ['assets/apps/balonlubum.jpg','assets/apps/iletisim-analizi.jpg','assets/apps/kare-savaslari.jpg','assets/apps/mental-detox.jpg','laboratuvar/vendor/README.md','laboratuvar/vendor/kjua-0.10.0.min.js','laboratuvar/vendor/kjua-LICENSE.txt']
            git('update-index','--force-remove',path,env=env);retired.append(path)
    source=git('rev-parse','HEAD');release=git('commit-tree',git('write-tree',env=env),'-p',plan['base'],input=f'Publish Katovia master release {label}\n\nTested source: {source}\nArtifact-only release; preserved legacy paths.\n'.encode())
    assert set(git('diff','--name-only',plan['base'],release).splitlines())<=set(paths)|set(retired)
    if cleanup:subprocess.run(['node','scripts/reference-graph.mjs',release],check=True)
    rollback=git('commit-tree',git('rev-parse',plan['base']+'^{tree}'),'-p',release,input=f'Rollback master release {label} to verified production tree\n'.encode())
    assert not git('diff','--name-only',plan['base'],rollback)
    for name,sha in [('release',release),('rollback',rollback)]:git('update-ref',f'refs/heads/codex/katovia-master-{label.lower()}-{name}',sha)
    plan.update(source=source,release=release,rollback=rollback,hashes=hashes,status='prepared',retiredPaths=retired);planpath.write_text(json.dumps(plan,indent=2));print('Prepared',release,'rollback',rollback,flush=True)
elif mode=='publish':
    plan=json.loads(planpath.read_text());assert plan['base']==remote();settings()
    for path,digest in plan['hashes'].items():assert hashlib.sha256((Path('dist')/path).read_bytes()).hexdigest()==digest
    git('push','origin',f'codex/katovia-master-{label.lower()}-rollback')
    pushed=False
    try:
        git('push','origin',plan['release']+':refs/heads/main');pushed=True;plan['build']=wait(plan['release'])
        for retry in range(12):
            try:verify(plan['release'],[p for p in git('ls-tree','-r','--name-only',plan['release']).splitlines() if served(p)]);break
            except Exception:
                if retry==11:raise
                time.sleep(10)
        qa=['node','scripts/qa-language-forge-release.mjs'] if label=='LanguageForge1' else ['node','scripts/live-qa.mjs',label]
        subprocess.run(qa,check=True);settings();plan['status']='published';print('RELEASE VERIFIED',label,flush=True)
    except Exception as error:
        print('Release failed:',str(error),flush=True)
        if pushed or remote()==plan['release']:
            assert remote()==plan['release'],'Remote changed; do not overwrite unrelated work'
            git('push','origin',plan['rollback']+':refs/heads/main');wait(plan['rollback']);verify(plan['rollback'],plan['paths']);plan['status']='rolled_back';print('ROLLBACK VERIFIED',flush=True)
        else:plan['status']='push_failed'
        planpath.write_text(json.dumps(plan,indent=2));sys.exit(1)
    planpath.write_text(json.dumps(plan,indent=2))
else:raise ValueError('Unknown mode')
