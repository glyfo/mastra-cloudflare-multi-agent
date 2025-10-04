// models/workers-ai.ts
import { createWorkersAI } from 'workers-ai-provider';

type Env = { AI: Ai };

export function workersAIModelFactory(env: Env) {
	const workersai = createWorkersAI({ binding: env.AI });

	// Mastra expects: ({ runtimeContext, mastra }) => Model
	return function _mastraModel(_args: { runtimeContext: unknown; mastra?: unknown }) {
		return workersai('@hf/nousresearch/hermes-2-pro-mistral-7b', {
			safePrompt: true,
		});
	};
}
