const fetch = require('node-fetch');
global.fetch = fetch;
global.Headers = fetch.Headers;
global.Request = fetch.Request;
global.Response = fetch.Response;

const { Readable } = require('stream');
global.ReadableStream = Readable;

let model = null;
let isModelLoading = false;
const MODEL_ID = 'Xenova/gpt2'; 

// Initialize model
const initModel = async () => {
  if (model) return model;
  
  if (isModelLoading) {
    
    while (isModelLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return model;
  }
  
  try {
    isModelLoading = true;
    console.log('Loading text generation model...');
    
    // Dynamic import instead of require
    const { pipeline } = await import('@xenova/transformers');
    
    // Initialize the pipeline
    model = await pipeline('text-generation', MODEL_ID, {
      quantized: false
    });
    
    console.log('Model loaded successfully');
    isModelLoading = false;
    return model;
  } catch (error) {
    isModelLoading = false;
    console.error('Error loading model:', error);
    throw new Error('Failed to load AI model');
  }
};

// Generate summary using the model
const generateSummary = async (prompt) => {
  try {
    const generator = await initModel();
    
    // Generate text
    const result = await generator(prompt, {
      max_new_tokens: 150,
      temperature: 0.7,
      top_p: 0.9,
      repetition_penalty: 1.2,
      do_sample: true
    });
    
    // Extract the generated text, removing the prompt
    const generatedText = result[0].generated_text.slice(prompt.length);
    
    return generatedText.trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Unable to generate summary at this time. Please try again later.';
  }
};

module.exports = {
  generateSummary,
  initModel
};