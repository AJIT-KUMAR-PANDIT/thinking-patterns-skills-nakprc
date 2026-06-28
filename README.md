# nakprc - Thinking Patterns CLI Tool

A Node.js command-line interface (CLI) tool designed to dynamically generate and scaffold "thinking steps" using a local Large Language Model (LLM) powered by Ollama.

The tool breaks down a given topic into logical, detailed steps and scaffolds them into an organized markdown directory structure under `thinking-patterns/`.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **Ollama** installed and running locally on `http://localhost:11434`
- A downloaded Ollama model (e.g., `gemma3:1b-it-qat`, `llama3`, `claude`)

---

## 🛠 Testing the Package Locally (Without Publishing to NPM)

You can install and test the package on your local system without publishing it to the NPM registry by using `npm link`.

1. **Navigate to the project directory** (where this `package.json` is located):
   ```bash
   cd /path/to/thinking-patterns-skills-nakprc
   ```

2. **Make the CLI script executable**:
   ```bash
   chmod +x index.js
   ```

3. **Link the package globally**:
   ```bash
   npm link
   ```
   *This creates a symlink in your global `node_modules` folder pointing to this directory, making the `nakprc` command available system-wide.*

4. **Test the command**:
   Open any directory in your terminal and run:
   ```bash
   nakprc tp skills start "How to design a scalable system"
   ```

5. **(Optional) Unlinking**:
   If you ever want to remove the local symlink from your system, run:
   ```bash
   npm unlink -g nakprc
   ```

---

## ⚙️ Configuration

The first time you run `nakprc tp skills start <topic>` in a directory, it will automatically generate a configuration file named `tp.nakprc.js` in that folder. 

You can edit `tp.nakprc.js` to change your local Ollama API URL or specify a default LLM model permanently for that project:

```javascript
export default {
  // The URL to your Ollama API
  ollamaUrl: 'http://localhost:11434/api/generate',
  
  // The default model to use
  model: 'gemma3:1b-it-qat',
};
```

You can also temporarily override the model during runtime using the `-m` flag:
```bash
nakprc tp skills start "Topic" -m llama3
```

---

## 🚀 Deploying / Publishing to NPM

Once you are satisfied with the tool and want to share it with others on the NPM registry, follow these steps:

1. **Login to NPM**:
   ```bash
   npm login
   ```
   *You will be prompted to enter your NPM username, password, and email address.*

2. **Update the version (Optional)**:
   If you make updates, ensure you bump the version in `package.json` before publishing:
   ```bash
   npm version patch  # 1.0.0 -> 1.0.1
   npm version minor  # 1.0.0 -> 1.1.0
   npm version major  # 1.0.0 -> 2.0.0
   ```

3. **Publish the package**:
   ```bash
   npm publish
   ```
   *(Note: The package name `nakprc` must be uniquely available on the NPM registry. If it is already taken, you will need to rename the `name` field in `package.json` before publishing).*

4. **Install globally from NPM**:
   Once successfully published, anyone can install your tool by running:
   ```bash
   npm install -g nakprc
   ```
