export function encodeTarget(target){if(!Number.isInteger(target)||target<0||target>60000)throw new TypeError('target');return `v1.${target}`;}
export function decodeTarget(token){if(typeof token!=='string'||!/^v1\.(0|[1-9]\d{0,4})$/.test(token))throw new TypeError('token');const target=Number(token.slice(3));encodeTarget(target);return target;}
export function compareTarget(actual,target){encodeTarget(actual);encodeTarget(target);return actual<target?'win':actual>target?'lose':'tie';}
