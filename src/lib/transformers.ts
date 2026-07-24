import { env } from '@huggingface/transformers';

// Configuration for Transformers.js
// By default, it uses hosted pretrained models and precompiled WASM binaries.

// 1. Specify a custom location for models (defaults to '/models/').
// To use local models, ensure they are placed in the /public/models/ directory.
env.localModelPath = '/models/';

// 2. Control loading of remote models from the Hugging Face Hub:
// Set to 'true' to allow remote fetching, 'false' for local-only.
env.allowRemoteModels = true; 

// 3. Set location of .wasm files. Defaults to using a CDN.
// For self-hosting, place .wasm files in /public/wasm/ and uncomment the following:
// env.backends.onnx.wasm.wasmPaths = '/wasm/';

console.log('Transformers.js environment configured');
