import fs from 'fs';
import path from 'path';

async function loadOrCreateConfig() {
  const configPath = path.join(process.cwd(), 'tp.nakprc.js');
  if (!fs.existsSync(configPath)) {
    const defaultConfig = `export default {
  // The URL to your Ollama API or other compatible local LLM API
  ollamaUrl: 'http://localhost:11434/api/generate',
  
  // The default model to use
  model: 'claude',
  
  // You can add more configurations here in the future
};
`;
    fs.writeFileSync(configPath, defaultConfig, 'utf-8');
    console.log('Generated default tp.nakprc.js configuration file.\\n');
  }

  const configUrl = new URL(`file://${configPath}`).href;
  const configModule = await import(configUrl);
  return configModule.default || configModule;
}

export async function generateAndScaffoldSteps(topic, cliModel) {
  const config = await loadOrCreateConfig();
  const model = cliModel || config.model || 'claude';
  const ollamaUrl = config.ollamaUrl || 'http://localhost:11434/api/generate';

  console.log(`Generating thinking steps for topic: "${topic}" using model: ${model}...`);
  
  const prompt = `You are a strategic thinking assistant. 
Break down the following topic into 3-5 logical thinking steps. 
Return ONLY a valid JSON array of objects. 
Each object must have two string properties: "name" (a short 2-3 word lowercase summary using underscores instead of spaces, e.g., "understand_problem") and "content" (a detailed paragraph describing this thinking step). 
Do not include markdown formatting or any other text outside the JSON array.
Topic: ${topic}`;

  try {
    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        format: 'json'
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    let jsonStr = data.response;
    
    // Attempt to extract JSON if there's a preamble
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    const steps = JSON.parse(jsonStr);

    if (!Array.isArray(steps) || steps.length === 0) {
      throw new Error("Failed to generate valid steps array.");
    }

    // Determine the next tp directory
    const baseDir = path.join(process.cwd(), 'thinking-patterns');
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    const existingTps = fs.readdirSync(baseDir)
      .filter(name => name.startsWith('tp') && fs.statSync(path.join(baseDir, name)).isDirectory())
      .map(name => parseInt(name.replace('tp', ''), 10))
      .filter(num => !isNaN(num));

    const nextTpNum = existingTps.length > 0 ? Math.max(...existingTps) + 1 : 1;
    const currentTpDir = path.join(baseDir, `tp${nextTpNum}`);
    fs.mkdirSync(currentTpDir, { recursive: true });

    console.log(`Created directory: ${currentTpDir}`);

    // Create steps
    steps.forEach((step, index) => {
      const stepIndex = index + 1;
      const safeName = step.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      const stepDirName = `${stepIndex}_${safeName}`;
      const stepDirPath = path.join(currentTpDir, stepDirName);
      
      fs.mkdirSync(stepDirPath, { recursive: true });
      
      const filePath = path.join(stepDirPath, `${safeName}.md`);
      const fileContent = `# Step ${stepIndex}: ${step.name}\n\n${step.content}\n`;
      
      fs.writeFileSync(filePath, fileContent, 'utf-8');
      console.log(`- Created ${path.relative(process.cwd(), filePath)}`);
    });

    console.log(`\nSuccessfully generated ${steps.length} thinking steps in ${currentTpDir}`);

  } catch (error) {
    console.error("Error generating thinking steps:", error.message);
    process.exit(1);
  }
}
