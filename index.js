import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

// Tambahakan setup __dirname untuk ESM (import style)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

function extractText(resp){
    try{
        const text =
            resp?.response?.candidate?.[0]?.content?.part?.[0]?.text ??
            resp?.candidate?.[0]?.content?.parts?.[0]?.text ??
            resp?.response?.candidates?.[0]?.content?.text;
        return text ?? JSON.stringify(resp, null, 2);
    } catch (e) {
        console.error('Error extracting text:', e);
        return JSON.stringify(resp, null, 2);
    }
}

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        if (!Array.isArray(messages)) throw new Error('Invalid messages format. Expected an array.');
        const contents = messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));
        const resp = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents
        });
        res.json({
            result: extractText(resp),
        }); 
    } catch (error) {
        console.error('Error in /api/chat:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});
