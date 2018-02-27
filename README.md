super-spawn
====

Install
---

`npm install super-spawn`

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Contents**

- [Usage](#usage)
- [The exports](#the-exports)
- [The factories](#the-factories)
  - [createSpawn(originalSpawn)](#createspawnoriginalspawn)
  - [spawn like function](#spawn-like-function)
    - [The template syntax](#the-template-syntax)
    - [options, and defaults](#options-and-defaults)
- [The object returned by spawn](#the-object-returned-by-spawn)
  - [ChildProcessWrapper()](#childprocesswrapper)
  - [streams](#streams)
  - [c.pipeTo(dest)](#cpipetodest)
- [About](#about)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

Usage
---

```javascript
const { spawn } = require('super-spawn');
//import { spawn } from 'super-spawn';

//A command and arguments are a string.
const c = spawn(`ls %(quote)`, {
    //Use string formatting
    quote: '-Q'
}, {
    //The options for require('child_process').spawn
    stdio: [process.stdin, 'pipe', process.stderr]
});

console.log('current pid is ', c.pid);
let n = 0;
//stdout, stdin, and stderr return highland streams
c.stdout.split('\n').each(function(x){
    console.log(`file ${++n}`, x);
});
```

Maybe normal spawn isn't enough for you. For example `cross-spawn` will work better for all platforms.

```javascript
const { createSpawn } = require('super-spawn');
const crossSpawn = require('cross-spawn');
//import { createSpawn } from 'super-spawn';
//import crossSpawn from 'cross-spawn';
const spawn = createSpawn(crossSpawn);

spawn(`ls`);
```

The exports
----

```javascript
//spawn, and fork are created by passing
//spawn, and fork from 'child_process' module
//to createSpawn
const {
    spawn,
    fork,
    createSpawn
} = require('super-spawn');
```

The factories
------

### createSpawn(originalSpawn)

`originalSpawn` should be a `spawn`, `fork`, or some spawn like function that conforms to the interface of `spawn` from the [child_process spawn](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) module.

`createSpawn()` returns a **spawn like function**.

### spawn like function

A spawn like function should work mostly like `require('child_process').spawn`. There are some major differences.

The normal `spawn()` has this interface:

`spawn(command, args, options, defaults)`

The spawn like function has this interface:

`spawn(input, format, options, defaults)`

The `input` argument is a cli command that works similar to [require('child_process').exec](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback).

The `input` argument also has a template syntax `'ls %(somePropertyName)'`. The `format` argument should be an object that gets it's property values inserted into the input template syntax.

#### The template syntax

Using `%(property)` in a string does template interpolation on the `format` object. Use `\\%()` to escape the template syntax.

#### options, and defaults

The `options`, and `defaults` arguments are the same as regular [child_process spawn](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options).


The object returned by spawn
---------------

### ChildProcessWrapper()

`ChildProcessWrapper()` instances wrap a child process returned by a spawn that's wrapped by `createSpawn()`.


```javascript
//c = new ChildProcessWrapper(child_process);
const c = spawn('ls');
```

`ChildProcessWrapper()` instances have all the properties, and functions as a regular child process plus some extras.

### streams

`c.stdout`, `c.stdin`, and `c.stderr` each return a [highland](http://highlandjs.org/) stream.

### c.pipeTo(dest)

Pipe to stdout to a stream, or name a file to pipe to.

```javascript
const { spawn } = require('super-spawn');
const fs = require('fs');

const c = spawn('ls');
c.pipeTo('filename');
```
Or create a stream manually.
```javascript
c.pipeTo(fs.createWriteStream('filename'));
```

About
---

`super-spawn` tries to be a little more helpful than just regular [child_process spawn](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options), and [child_process fork](https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options).
