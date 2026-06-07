import fs from 'fs/promises';
import path from 'path';
import { google, gmail_v1 } from 'googleapis';
import { load } from 'cheerio';
import readline from 'readline';
import { promisify } from 'util';

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

function countAttachments(payload: gmail_v1.Schema$MessagePart): number {
  let count = 0;
  function recurse(parts?: gmail_v1.Schema$MessagePart[]) {
    for (const part of parts || []) {
      if (part.filename && part.filename.length > 0) count++;
      if (part.parts) recurse(part.parts);
    }
  }
  recurse(payload.parts || []);
  return count;
}

function extractMessageBody(payload: gmail_v1.Schema$MessagePart): string | null {
  if (!payload) return null;

  if (payload.body?.data) {
    try { return base64UrlDecode(payload.body.data); } catch {}
  }

  if (payload.parts?.length) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        try { return base64UrlDecode(part.body.data); } catch {}
      }
    }
    for (const part of payload.parts) {
      const res = extractMessageBody(part);
      if (res) return res;
    }
  }

  return null;
}

function extractAfterSpeciaalTeken(body: string | null): string | null {
  if (!body) return null;
  const regex = /1 speciaal teken:\s*(.+)/i;
  const match = body.match(regex);
  return match ? match[1].trim() : null;
}

function extractCode(body: string | null): string | null {
  if (!body) return null;
  const regex = /un signe spécial\)\s*:\s*\n*(.+)/i;
  const match = body.match(regex);
  return match ? match[1].trim() : null;
}

function extractMFACode(htmlBody: string | null): string | null {
  if (!htmlBody) return null;
  const $ = load(htmlBody);
  const targetTd = $('td[align="center"][valign="center"][width="200"][height="55"]');
  const boldTag = targetTd.find('b');
  const code = boldTag.text().trim();
  if (/^[A-Z0-9]{6,}$/i.test(code)) return code;
  return null;
}

async function getManualToken(oAuth2Client: any): Promise<void> {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\nAutorise cette application en visitant cette URL :\n', authUrl);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = promisify(rl.question).bind(rl);
  const code = await question('Entrez le code affiché par Google ici : ');
  rl.close();

  try {
    const { tokens } = await oAuth2Client.getToken(code.trim());
    oAuth2Client.setCredentials(tokens);
    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
    console.log('Token sauvegardé dans', TOKEN_PATH, '\n');
  } catch (err) {
    console.error('Erreur lors de l\'obtention du token:', err);
    process.exit(1);
  }
}

async function getOAuthClient(): Promise<any> {
  const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
  const credentials = JSON.parse(content);
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  try {
    const tokenContent = await fs.readFile(TOKEN_PATH, 'utf-8');
    const token = JSON.parse(tokenContent);
    oAuth2Client.setCredentials(token);
  } catch {
    await getManualToken(oAuth2Client);
  }

  return oAuth2Client;
}

export interface EmailInfo {
  subject: string;
  from: string;
  date: string;
  body: string | null;
  attachmentCount: number;
  speciaalTekenText?: string | null;
  code: string | null;
  MFA: string | null;
}

export async function getLastEmailInfo(): Promise<EmailInfo> {
  const oAuth2Client = await getOAuthClient();
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

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
  const body = extractMessageBody(msg.payload!);
  const attachmentCount = countAttachments(msg.payload!);
  const speciaalTekenText = extractAfterSpeciaalTeken(body);
  const code = extractCode(body);
  const MFA = extractMFACode(body);

  console.log('Texte après "1 speciaal teken:":', speciaalTekenText);

  return { subject, from, date, body, attachmentCount, speciaalTekenText, code, MFA };
}

if (require.main === module) {
  (async () => {
    try {
      const email = await getLastEmailInfo();
      console.log('\nDernier email :', email);
    } catch (err) {
      console.error(err);
    }
  })();
}
