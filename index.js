'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var spawnArgs = _interopDefault(require('spawn-args'));
var _ = _interopDefault(require('highland'));
var fs = require('fs');
var child_process = require('child_process');

const formatPattern = /(\\?%)\(([\s\S]+?)\)/g;
const space = /[\s\n]+?/g;
const cmdPattern = /(^[\s\n]*?)([^\s]+?)([\s\n]+)/;
const isArray = typeof Array.isArray === 'function'
? Array.isArray
: (a)=>(Object.prototype.toString.call(a)
=== '[object Array]');

function createArguments(input, format){
    const [m, s1, cmd, s2] = input.match(cmdPattern);

    return {
        cmd,
        args: spawnArgs(
            input
            .slice(m.length)
            .replace(space, ' ')
            .replace(formatPattern, (m, $1, $2)=>{
                return $1 === '%'
                ? format[$2] !== void 0
                ? isArray(format[$2])
                ? format[$2].join(' ')
                : format[$2]
                : 'undefined'
                : m;
            })
        )
    };
}

class ChildProcessWrapper {
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
            ? fs.createWriteStream(dest)
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

function createSpawn(spawnFN){

    return function spawn(
        input = '',
        format = {},
        options = {},
        defaults = {}
    ){

        if(typeof input !== 'string'){
            throw new TypeError(`Argument 0 (input) with value ${input} is not a string, or array`);
        }

        if(typeof format !== 'object'){
            throw new TypeError(`Argument 1 (format) with value ${format} is not an object`);
        }

        if(typeof options !== 'object'){
            throw new TypeError(`Argument 2 (options) with value ${options} is not an object`);
        }

        const {cmd, args} = createArguments(
            input,
            format
        );

        const c = spawnFN(
            cmd,
            args,
            options,
            defaults
        );

        return new ChildProcessWrapper(c);
    };
}

const spawn = createSpawn(child_process.spawn);
const fork = createSpawn(child_process.fork);

exports.createSpawn = createSpawn;
exports.spawn = spawn;
exports.fork = fork;
exports.createSpawnArguments = createArguments;
exports.ChildProcessWrapper = ChildProcessWrapper;
