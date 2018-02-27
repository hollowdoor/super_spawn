import _ from 'highland';
import { createWriteStream } from 'fs';

export default class ChildProcessWrapper {
    constructor(c){
        this.child = c;
    }
    on(name, cb){
        this.child.on(name, cb);
        return this;
    }
    disconnect(){
        return this.child.disconnect();
    }
    kill(arg){
        return this.child.kill(arg);
    }
    resolve(){
        return new Promise((resolve, reject)=>{
            this.child.on('error', reject);
            this.child.on('exit', code=>{
                if(code){ return reject(code); }
            });
            this.child.on('close', resolve);
        });
    }
    pipeTo(dest){
        return this.stdout.pipe(
            typeof dest === 'string'
            ? createWriteStream(dest)
            : dest
        );
    }
}

function defineGets(props, get){
    props.forEach(prop=>{
        Object.defineProperty(
            ChildProcessWrapper.prototype,
            prop,
            {get:get(prop)}
        );
    });
}

defineGets(['stdin', 'stdout', 'stderr'], prop=>{
    return function(){
        return this.child[prop]
        ? _(this.child[prop])
        : null;
    };
});

defineGets(
    ['channel', 'connected', 'killed', 'pid', 'stdio'],
    prop=>{
        return function(){
            return this.child[prop];
        };
    }
);
