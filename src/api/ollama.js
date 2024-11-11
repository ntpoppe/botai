const fetch = require('node-fetch');
const readline = require('readline');

class Ollama {
    async query(question) {
        try {
            const response = await fetch('http://localhost:11434/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: 'gemma2',
                prompt: question,
              }),
            });
        
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Ollama API error: ${errorText}`);
            }

            if (!response.body) {
                throw new Error('No response body received from Ollama API.');
            }
        
            const rl = readline.createInterface({
                input: response.body,
                crlfDelay: Infinity, // Recognize all instances of CR LF ('\r\n') as a single line break
            });

            let answer = '';

            for await (const line of rl) {
                if (line.trim()) {
                    try {
                        const jsonData = JSON.parse(line);
                        const token = jsonData.response || '';
                        answer += token;
                    } catch (parseError) {
                        console.error('Error parsing JSON line:', parseError);
                        continue;
                    }
                }
            }

            return answer;
        } catch (error) {
            console.error('Error querying Ollama:', error);
            throw error;
        }
    }
}

module.exports = Ollama;