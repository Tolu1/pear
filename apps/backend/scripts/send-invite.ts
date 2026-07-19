import { renderInviteEmail } from '@repo/emails';
import { Resend } from 'resend';

const FROM_NAME = 'Tolu Olugbesan';
const FROM_EMAIL = 'tolu@pearextension.com';
const DOWNLOAD_URL =
  'https://pearextension.com/download/pear-ai-playground/beta';
const VIDEO_URL = 'https://youtu.be/iPmaQMEWK1E';

interface SendInviteInput {
  to: string;
  code: string;
  name?: string;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
}

function subject(code: string): string {
  return `Your Pear code is ${code}`;
}

function plainText(code: string, name?: string): string {
  const greeting = name ? `You're early, ${name}.` : "You're early.";
  return `${greeting}

We've spent the last few months teaching an agent how to use a browser by
itself. It's early and it's rough, but it's finally worth showing you.

We'd love for you to break it. When something goes wrong just reply to this
email, or hit the bug report button once you're in.

Hope you like it here.

Your access code: ${code}

Download Pear AI:
${DOWNLOAD_URL}

Watch a quick setup:
${VIDEO_URL}
`;
}

export async function sendInvite({
  to,
  code,
  name,
}: SendInviteInput): Promise<void> {
  const resend = new Resend(requireEnv('RESEND_API_KEY'));

  const html = await renderInviteEmail({
    code,
    name,
    downloadUrl: DOWNLOAD_URL,
    videoUrl: VIDEO_URL,
  });

  const { error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: subject(code),
    html,
    text: plainText(code, name),
  });

  if (error) throw new Error(error.message);
}
