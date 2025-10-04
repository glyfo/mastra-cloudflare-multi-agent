// publisher-agent.ts
import { Agent, createTool } from '@mastra/core';
import type { Context } from 'hono';
import { workersAIModelFactory } from '@providers/workersai';
import { createCopywriterAgent } from '@agents/copywriterAgent';
import { createEditorAgent } from '@agents/editorAgent';
import { z } from 'zod';

export function createPublisherAgent(c: Context) {
	// Pull env off Hono context (Workers style)
	const env = (c as any)?.env ?? {};

	// Create the model via your LLM provider
	const model = workersAIModelFactory(env);

	// Create the agents
	const copywriterAgent = createCopywriterAgent(c);
	const editorAgent = createEditorAgent(c);

	// Convert agents to tools
	const copywriterTool = createTool({
		id: 'copywriter-agent',
		description: 'Calls the copywriter agent to write blog post copy about a specific topic.',
		inputSchema: z.object({
			topic: z.string().describe('Blog post topic'),
		}),
		outputSchema: z.object({
			copy: z.string().describe('Blog post copy'),
		}),
		execute: async ({ context }) => {
			const result = await copywriterAgent.generate(`Create a blog post about ${context.topic}`);
			return {
				copy: result.text,
			};
		},
	});

	const editorTool = createTool({
		id: 'editor-agent',
		description: 'Calls the editor agent to edit blog post copy.',
		inputSchema: z.object({
			copy: z.string().describe('Blog post copy to edit'),
		}),
		outputSchema: z.object({
			copy: z.string().describe('Edited blog post copy'),
		}),
		execute: async ({ context }) => {
			const result = await editorAgent.generate(`Edit the following blog post, only return the edited copy:\n\n${context.copy}`);
			return {
				copy: result.text,
			};
		},
	});

	// Instantiate the agent
	const agent = new Agent({
		name: 'publisherAgent',
		description: 'You are a publisher agent',
		instructions:
			'You are a publisher agent that first calls the copywriter agent to write blog post copy about a specific topic and then calls the editor agent to edit the copy. Just return the final edited copy.',
		model,
		tools: { copywriterTool, editorTool },
	});

	return agent;
}
