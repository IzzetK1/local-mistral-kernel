
interface OllamaResponse {
  response: string;
  done: boolean;
}

export async function runCodeWithOllama(
  code: string, 
  language: string = 'python'
): Promise<string> {
  try {
    // Format a prompt that asks the model to run the code
    const prompt = `
You are a code execution engine. You are given the following ${language} code. 
Please execute the code and return ONLY the output. Do not include any explanations or descriptions.
If there are errors, return only the error message.

\`\`\`${language}
${code}
\`\`\`

Output:
`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as OllamaResponse;
    return data.response.trim();
  } catch (error) {
    console.error('Error running code with Ollama:', error);
    return `Error connecting to Ollama: ${error instanceof Error ? error.message : 'Unknown error'}
    
Make sure Ollama is running and the Mistral model is installed. You can install it with:
ollama pull mistral`;
  }
}

// Helper function to get available models from Ollama
export async function getOllamaModels(): Promise<string[]> {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.models?.map((model: any) => model.name) || [];
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return [];
  }
}
