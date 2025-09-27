import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:4200' }));
app.use(express.json());

app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
