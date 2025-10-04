import { Hono } from 'hono';
import { health } from '@routes/health';
import { publisher } from '@routes/publisher';
import type { AppCtx } from './type';

const app = new Hono<AppCtx>();

app.use('*', async (c, next) => {
	const traceId = crypto.randomUUID();
	c.set('traceId', traceId); // ✅ typed ok
	await next();
});

app.post('/health', health);
app.post('/publisher', publisher);

export default app;
