import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import OpenAI from "openai";
import {Repos2Doc} from "repos2doc";
import fs from "fs";




const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3002;


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


async function generateChapter(chapter, sourceContent, plainContext){
    const response = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
            {
                "role": "user",
                "content": chapter
            },
            {
                "role": "user",
                "content": "Hier ist die Komplette Beschreibung des Projektes. Bediene dich aus diesem Inhalt um den spezifischen Teil der Dokumentation zu erstellen: "
            },
            {
                "role": "user",
                "content": sourceContent
            },
            {
                "role": "user",
                "content": "Ich gebe dir nochmal den Kontext. " + plainContext + " .Kannst Du bitte die feststehende Begriffe stehen lassen, also nicht aus dem englischen übersetzen. Bitte keine Auflistungen und Überschriften verwenden. Einfach nur fließende Sätzte." +
                "Verwende bitte keine abstrakte Begriffe, wie unsere IT-Lösung oder sowas. Versuche die Lösung etwas konkretter zu bennennen, verwende dabei den gegebenen Kontext."
            }
        ],
        temperature: 1,
        max_tokens: 4095,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });

    const docs = response.choices[0].message.content;
    console.log('response', docs);

    return docs;
}


async function generateDocs(plainCode, plainContext){
    const response = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
            {
                "role": "user",
                "content": "Ich möchte aus dem Quellcode eine möglichst fachliche Dokumentation erstellen. Es soll keine technische Beschreibung der Funktionalität sein, sondern eine Fachliche Beschreibung, die vor allem den Nutzen und die fachliche Funktionalität eines Code Abschnits beschreibt."
            },
            {
                "role": "user",
                "content": "Hier ist mein code:"
            },
            {
                "role": "user",
                "content": plainCode
            },
            {
                "role": "user",
                "content": "Bitte erstelle mir einen Teil der fachlichen Dokumentation für diesen konkreten Code. Die Beschreibung sollte keinerlei Technik enthält. Fasse dich dabei nicht zu ausführlich, in wenigen Sätzen also 1 Absatz mit max. 50 Wörtern zusammenfassen Es geht mehr darum eine fachliche Summary dieser einer konkreten Funktionalität zu erstellen."
            },
            {
                "role": "user",
                "content": "Ich gebe dir nochmal den Kontext. " + plainContext + " . Bitte beachte diesen Kontext in deiner Beschreibung. Kannst Du bitte die feststehende Begriffe dabei stehen lassen, also nicht aus dem englischen übersetzen."
            }
        ],
        temperature: 1,
        max_tokens: 4095,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });

    const docs = response.choices[0].message.content;
    console.log('response', docs);

    return docs;
}


async function prompt(prompt, content){
    const response = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
            {
                "role": "user",
                "content": prompt
            },
            {
                "role": "user",
                "content": content
            },
            {
                "role": "user",
                "content": "Kannst Du bitte die feststehende Begriffe dabei stehen lassen, also nicht aus dem englischen übersetzen. Bitte keine Alternativen erstellen und bitte das erfragte Ergebnis zurückliefen, sonst nichts!"
            }
        ],
        temperature: 1,
        max_tokens: 4095,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });

    const docs = response.choices[0].message.content;
    console.log('response', docs);

    return docs;
}

async function loadCodes(repo){
    console.log('load code from repo: ' + repo);

    const r4g = new Repos2Doc()
    const config = r4g.getConfig()
    config['files']['test'] = [ { 'type': 'allow', 'search': 'endsWith', 'strings': [ '.kt' ] } ]


    let result = await r4g.getDocument( {
        repositories: [ repo.replace('https://github.com/', '') ],
        name: 'kafka',
        destinationFolder: './exports/',
        options: [ { description: 'this is a test!', filter: 'test' } ]
    })


    const fileResult = result[0];

    const code = fs.readFileSync(fileResult, 'utf-8');

    const codes = code.split('https://github.com/' + repo.replace('main', 'blob/main'))
        .map(c => ({
            name: c.split('\n').shift().trim(),
            code: c.split('\n').slice(1).join('\n').trim(),
        })).filter(c => c.code);


    fs.unlinkSync(fileResult);

    return codes;
}

app.post('/api/docthis', async (req, res) => {
    //const data = req;

    console.log('received data', req.body);

    const docs = await generateDocs(req.body.value, req.body.context);

    res.json({
        message: 'Erfolgreich verarbeitet',
        data: docs
    });
});

app.post('/api/docchapter', async (req, res) => {
    //const data = req;

    console.log('received chapter data', req.body.chapter);

    const docs = await generateChapter(req.body.chapter, req.body.content, req.body.context);

    res.json({
        message: 'Erfolgreich verarbeitet',
        data: docs
    });
});

app.post('/api/prompt', async (req, res) => {
    //const data = req;

    console.log('received chapter data', req.body.prompt);

    const docs = await prompt(req.body.prompt, req.body.content);

    res.json({
        message: 'Erfolgreich verarbeitet',
        data: docs
    });
});

app.get('/api/repo', async (req, res) => {
    const codes = await loadCodes(req.query.repo);

    res.json({
        message: 'Erfolgreich verarbeitet',
        data: codes
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
