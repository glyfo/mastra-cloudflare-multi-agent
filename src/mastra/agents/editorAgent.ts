// support-agent.ts
import { Agent } from '@mastra/core';
import type { Context } from 'hono';
import { workersAIModelFactory } from '@providers/workersai';

export function createEditorAgent(c: Context) {
	// Pull env off Hono context (Workers style)
	const env = (c as any)?.env ?? {};

	// Create the model via your LLM provider
	const model = workersAIModelFactory(env);

	// Instantiate the agent
	const agent = new Agent({
		name: 'Editor',
		description: 'You are an editor agent that edits blog post copy.',
		instructions: 'You are an editor agent that edits blog post copy.',
		model,
	});

	return agent;
}
