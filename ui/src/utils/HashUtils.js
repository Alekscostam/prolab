const crypto = require('crypto');
const sha256 = require('crypto-js/sha256');
const CryptoJS = require('crypto-js');
const pako = require('pako');
var LZUTF8 = require('lzutf8');

export class HashUtils {
    //data structure from API

    static hashIds(ids) {
        // debugger;
        // const jsonString = JSON.stringify(ids);
        // const compressedString = LZUTF8.compress(jsonString, {outputEncoding: 'Base64'});
        // const hash = sha256(compressedString);
        // const btoac = btoa(hash).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        // return HashUtils.unHashIds(btoac);
    }
    static unHashIds(hash) {
        // const paddedHash = hash + '==='.slice((hash.length + 3) % 4);
        // const base64 = paddedHash.replace(/-/g, '+').replace(/_/g, '/');
        // const hashString = atob(base64);
        // const decompressedString = LZUTF8.decompress(hashString, {inputEncoding: 'Base64'});
        // return JSON.parse(decompressedString);
    }
}

export default HashUtils;
