import { spawn as realSpawn, fork as realFork } from 'child_process';
import createArguments from './lib/create_arguments.js';
import ChildProcessWrapper from './lib/child_process_wrapper.js';

export function createSpawn(spawnFN){

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

const spawn = createSpawn(realSpawn);
const fork = createSpawn(realFork);
export { spawn, fork };

export {
    createArguments as createSpawnArguments, ChildProcessWrapper
};
