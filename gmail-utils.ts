import fs from 'fs/promises';
import path from 'path';
import { google, gmail_v1 } from 'googleapis';
import { load } from 'cheerio';

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

function extractHTMLBody(payload: gmail_v1.Schema$MessagePart): string | null {
  let result: string | null = null;

  function recurse(part?: gmail_v1.Schema$MessagePart) {
    if (!part) return;
    if (part.mimeType === 'text/html' && part.body?.data) {
      result = base64UrlDecode(part.body.data);
    }
    if (part.parts) part.parts.forEach(p => recurse(p));
  }

  recurse(payload);
  return result;
}

async function authorize(): Promise<gmail_v1.Gmail> {
  const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
  const credentials = JSON.parse(content);
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  const tokenContent = await fs.readFile(TOKEN_PATH, 'utf-8');
  const token = JSON.parse(tokenContent);
  oAuth2Client.setCredentials(token);

  return google.gmail({ version: 'v1', auth: oAuth2Client });
}

function extractTextAndLinks(html: string): { text: string; links: string[] } {
  const $ = load(html);
  const text = $('body').text().replace(/\s+/g, ' ').trim();
  const links: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) links.push(href);
  });
  return { text, links };
}

export async function getLastEmailInfo(): Promise<{ text: string; links: string[]; subject: string; from: string; date: string }> {
  const gmail = await authorize();

  const listRes = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 1,
    includeSpamTrash: true,
  });

  const messages = listRes.data.messages || [];
  if (messages.length === 0) throw new Error('Aucun message trouvé.');

  const msgId = messages[0].id!;
  const msgRes = await gmail.users.messages.get({
    userId: 'me',
    id: msgId,
    format: 'full',
  });

  const msg = msgRes.data;
  const headers = msg.payload?.headers || [];

  const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || '';
  const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value || '';
  const date = headers.find(h => h.name?.toLowerCase() === 'date')?.value || '';

  const body = extractHTMLBody(msg.payload!);
  if (!body) return { text: '', links: [], subject, from, date };

  const { text, links } = extractTextAndLinks(body);
  return { text, links, subject, from, date };
}

export async function waitForEmailWithSubject(
    expectedSubject: string,
    timeoutMs = 90_000,
    pollIntervalMs = 5_000
): Promise<{ text: string; links: string[]; subject: string; from: string; date: string }> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        const gmail = await authorize();
        const listRes = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 5,
            includeSpamTrash: true,
        });
        const messages = listRes.data.messages || [];
        for (const msg of messages) {
            const msgRes = await gmail.users.messages.get({ userId: 'me', id: msg.id!, format: 'full' });
            const headers = msgRes.data.payload?.headers || [];
            const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || '';
            if (subject === expectedSubject) {
                const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value || '';
                const date = headers.find(h => h.name?.toLowerCase() === 'date')?.value || '';
                const body = extractHTMLBody(msgRes.data.payload!);
                if (!body) return { text: '', links: [], subject, from, date };
                const { text, links } = extractTextAndLinks(body);
                return { text, links, subject, from, date };
            }
        }
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
    throw new Error(`Email avec sujet "${expectedSubject}" non reçu après ${timeoutMs / 1000}s.`);
}
