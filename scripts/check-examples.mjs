import {spawnSync} from 'node:child_process';
import {chapters} from '../src/content/chapters.ts';

const examples=chapters.flatMap(chapter=>Object.entries(chapter.sections).flatMap(([mode,sections])=>sections.filter(section=>section.code).map(section=>({name:`${chapter.id}/${mode}/${section.id}`,code:section.code}))));
const execute=process.argv.includes('--execute');
const script=String.raw`
import ast, json, subprocess, sys
examples=json.load(sys.stdin)
execute=sys.argv[1]=='yes'
errors=[]
for example in examples:
    name,code=example['name'],example['code']
    try:
        ast.parse(code,filename=name)
        compile(code,name,'exec')
        if execute:
            result=subprocess.run([sys.executable,'-c',code],capture_output=True,text=True,encoding='utf-8',timeout=60)
            if result.returncode:
                raise RuntimeError(result.stderr[-3000:])
    except Exception as error:
        errors.append(name+': '+str(error))
print(json.dumps({'examples':len(examples),'executed':execute,'failures':errors},ensure_ascii=True,indent=2))
sys.exit(bool(errors))
`;
const result=spawnSync('python',['-X','utf8','-c',script,execute?'yes':'no'],{input:JSON.stringify(examples),encoding:'utf8',maxBuffer:4*1024*1024,env:{...process.env,OMP_NUM_THREADS:'1',MKL_NUM_THREADS:'1'}});
process.stdout.write(result.stdout||'');
process.stderr.write(result.stderr||'');
if(result.error) throw result.error;
process.exit(result.status??1);
