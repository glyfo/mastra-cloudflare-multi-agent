// support-agent.ts
import { Agent, createTool } from '@mastra/core';
import type { Context } from 'hono';
import { workersAIModelFactory } from '@providers/workersai';
import { createCopywriterAgent } from '@agents/copywriterAgent';
import { createEditorAgent } from '@agents/editorAgent';
import { z } from 'zod';

export function createpublisherAgent(c: Context) {
	// Pull env off Hono context (Workers style)
	const env = (c as any)?.env ?? {};

	// Create the model via your LLM provider
	const model = workersAIModelFactory(env);

	// Create the tools
	const copywriterTool = createCopywriterTool(c);
	const editorTool = createEditorTool(c);

	// Instantiate the agent
	const agent = new Agent({
		name: 'publisherAgent',
		description: 'You are an publisher agent',
		instructions:
			'You are a publisher agent that first calls the copywriter agent to write blog post copy about a specific topic and then calls the editor agent to edit the copy. Just return the final edited copy.',
		model,
		tools: { copywriterTool, editorTool },
	});

	return agent;
}

/**
 * Creates a tool that wraps the copywriter agent
 * @param c - Hono context containing env bindings
 * @returns Copywriter tool for use in other agents
 */
export function createCopywriterTool(c: Context) {
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
			console.log('copywriter result', result.text);
			return {
				copy: result.text,
			};
		},
	});
}

/**
 * Creates a tool that wraps the copywriter agent
 * @param c - Hono context containing env bindings
 * @returns Copywriter tool for use in other agents
 */
export function createEditorTool(c: Context) {
	const editorAgent = createEditorAgent(c);

	// Create the copywriter agent instance
	return createTool({
		id: 'editor-agent',
		description: 'Calls the editor agent to edit blog post copy.',
		inputSchema: z.object({
			copy: z.string().describe('Blog post copy'),
		}),
		outputSchema: z.object({
			copy: z.string().describe('Edited blog post copy'),
		}),
		execute: async ({ context }) => {
			const result = await editorAgent.generate(`Edit the following blog post only returning the edited copy: ${context.copy}`);
			console.log('editor result', result.text);
			return {
				copy: result.text,
			};
		},
	});
}
