import { createStaticServer } from './server.mjs';
import { distRoot } from './paths.mjs';
const port = Number(process.env.PORT || 4173);
const server = createStaticServer(distRoot);
server.listen(port, '127.0.0.1', () => console.log(`Static artifact preview: http://127.0.0.1:${port}/v2/`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
