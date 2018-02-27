const { spawn } = require('../');
const { readdirSync } = require('fs');
const assert = require('assert');

describe('spawn', ()=>{
    it('output should equal readdir output', (done)=>{
        const c = spawn(`ls -a %(quote)`, {
            quote: '-Q'
        }, {
            stdio: [process.stdin, 'pipe', process.stderr]
        });

        c.stdout
        .split('\n')
        .sort()
        .toArray(function(a){
            const files = readdirSync('./')
            .concat(['.', '..'])
            .map(s=>`"${s}"`)
            .concat([''])
            .sort();
            assert.deepEqual(a, files);
            done();
        });
    });
});
