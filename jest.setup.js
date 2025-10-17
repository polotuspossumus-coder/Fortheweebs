// Polyfill for TextEncoder/TextDecoder in Jest (Node)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
