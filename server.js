import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const getFile = (name) => path.join(DB_PATH, `${name}.json`);

app.get('/api/:collection', async (req, res) => {
    try {
        const data = await fs.readFile(getFile(req.params.collection), 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/:collection', async (req, res) => {
    try {
        await fs.writeFile(getFile(req.params.collection), JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Storage server running on http://localhost:${PORT}`);
});
