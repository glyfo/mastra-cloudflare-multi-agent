import type { Context } from 'hono';
import { createPublisherAgent } from '@agents/publisherAgent';

export async function publisher(c: Context) {
	const body = await c.req.json().catch(() => ({} as { message?: string }));
	const message = body.message ?? 'Write a blog post about React JavaScript frameworks. Only return the final edited copy.';

	const agent = createPublisherAgent(c);

	try {
		const reply = await agent.generateVNext(message);
		return c.json({ reply, message });
	} catch (err: any) {
		return c.json({ error: err?.message ?? 'Publisher is sleeping' }, 500);
	}
}
