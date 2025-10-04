// support-agent.ts
import { Agent, createTool } from '@mastra/core';
import type { Context } from 'hono';
import { workersAIModelFactory } from '@providers/workersai';
import { z } from 'zod';

export function makeCopyWriterAgent(c: Context) {
	// Pull env off Hono context (Workers style)
	const env = (c as any)?.env ?? {};

	// Create the model via your LLM provider
	const model = workersAIModelFactory(env);

	// Instantiate the agent
	const agent = new Agent({
		name: 'Copywriter',
		description: 'You are a copywriter agent that writes blog post copy.',
		instructions: 'You are a copywriter agent that writes blog post copy.',
		model,
	});

	return agent;
}

/**
 * Creates a tool that wraps the copywriter agent
 * @param c - Hono context containing env bindings
 * @returns Copywriter tool for use in other agents
 */
export function createCopywriterTool(c: Context<{ Bindings: Env }>) {
	// Create the agent instance
	const copywriterAgent = createCopywriterAgent(c);

	return createTool({
		id: 'copywriter-agent',
		description: 'Calls the copywriter agent to write blog post copy.',
		inputSchema: z.object({
			topic: z.string().describe('Blog post topic'),
		}),
		outputSchema: z.object({
			copy: z.string().describe('Blog post copy'),
		}),
		execute: async ({ context }) => {
			const result = await copywriterAgent.generate(`Create a blog post about ${context.topic}`);
			console.log('Copywriter result:', result.text);
			return {
				copy: result.text,
			};
		},
	});
}
