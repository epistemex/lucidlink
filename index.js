#!/usr/bin/env node
/*
 🅢🅞🅤🅡🅒🅔 🅒🅞🅓🅔 🅢🅞🅤🅡🅒🅔 🅒🅞🅓🅔 🅢🅞🅤🅡🅒🅔 🅒🅞🅓🅔 🅢🅞🅤🅡🅒🅔 🅒🅞🅓🅔


          ◆ ◆ ◆ lucidlinks ◆ ◆ ◆

          Open lucid:// links in KDE Dolphin

          index.js (2025-04-15)

          Copyright (c) 2025 Chris Nilsen



 ░░░▒▒▓█ ║▌║║║▌║▌│║║▌█║▌║█▌║█▌║█║▌║█▌║║║│║│║▌║▌█║║█▌║█▌║█║▌│║▌│║▌║▌█ ║ █▓▒▒░░░
*/

'use strict';

const path = require('path');
const { spawn, spawnSync } = require('child_process');

/*
  1. Get lucid2 path
  2. Get and check argument
  3. Get lucid config (for mount point)
  4. Get port number
  5. Format link and open Dolphin with file selected
 */

const lucid2 = spawnSync('which', [ 'lucid2' ], { encoding: 'utf8' })
  .stdout.replace('\n', '');

if ( !lucid2.length ) {
  return console.warn('Please install Lucid Link Classic.');
}

const link = process.argv[ 2 ];
if ( !link ) {
  return console.error('Usage: lucidlink <lucid://....>');
}

if ( !link.toLowerCase().startsWith('lucid://') ) {
  return console.warn('Unsupported link type.');
}

const mountPoint = spawnSync(lucid2, [ 'config' ], { encoding: 'utf8' })
  .stdout
  .split('\n')
  .filter(e => e.startsWith('FileSystem.MountPointLinux'))[ 0 ]
  .replace(/\s\s+/g, ' ')
  .split(' ')[ 1 ];

const instance = spawnSync(lucid2, [ 'list' ], { encoding: 'utf8' })
  .stdout
  .split('\n')
  .filter(e => e.trim().length)[ 1 ]
  .replace(/\s\s+/g, ' ')
  .split(' ');

const id = +instance[ 0 ];
const fileSpace = instance[ 1 ];
const port = +instance[ 2 ];

const linkParts = link.split('/');
const fileId = linkParts[ 4 ];

const url = `http://localhost:${ port }/fsEntry?id=${ fileId }`;

(async function(url) {
  try {
    const result = await fetch(url);
    const json = await result.json();
    const fullPath = path.join(mountPoint, json.path);
    spawn('dolphin', [ '--select', fullPath ], {
      encoding: 'utf8',
      detached: true,
      stdio   : 'ignore'
    });
  }
  catch {
    console.error('Error in link.');
  }
})(url);
