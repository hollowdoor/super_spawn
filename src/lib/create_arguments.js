import spawnArgs from 'spawn-args';
const formatPattern = /(\\?%)\(([\s\S]+?)\)/g;
const space = /[\s\n]+?/g;
const cmdPattern = /(^[\s\n]*?)([^\s]+?)([\s\n]+)/;
const isArray = typeof Array.isArray === 'function'
? Array.isArray
: (a)=>(Object.prototype.toString.call(a)
=== '[object Array]');

export default function createArguments(input, format){
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
