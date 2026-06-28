#!/usr/bin/env node

import { Command } from 'commander';
import { generateAndScaffoldSteps } from './scaffold.js';

const program = new Command();

program
  .name('nakprc')
  .description('CLI to generate and scaffold thinking steps')
  .version('1.0.0');

const tp = program.command('tp')
  .description('Thinking patterns commands');

const skills = tp.command('skills')
  .description('Skills commands within thinking patterns');

skills.command('start')
  .description('Start generating thinking steps for a given topic')
  .argument('<topic>', 'The topic to generate thinking steps for')
  .option('-m, --model <model>', 'The Ollama model to use')
  .action(async (topic, options) => {
    await generateAndScaffoldSteps(topic, options.model);
  });

program.parse();
