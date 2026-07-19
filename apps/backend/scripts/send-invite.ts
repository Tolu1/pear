import { renderInviteEmail } from '@repo/emails';
import { Resend } from 'resend';

const FROM_NAME = 'Tolu Olugbesan';
const FROM_EMAIL = 'tolu@pearextension.com';
const DOWNLOAD_URL = 'https://pearextension.com/download/pear-ai-playground/beta';
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

function plainText(code: string, name?: string): string {
  const greeting = name ? `You're early, ${name}.` : "You're early.";
  return `${greeting}

We're teaching our agent to browse and get things done on its own. Point it at
any site, give it a goal, and watch it work.

It's still learning and will get things wrong. When it does, tell us with the
bug button or just reply here.

We hope you like it here.

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
    subject: "You've been invited to test Pear AI",
    html,
    text: plainText(code, name),
  });

  if (error) throw new Error(error.message);
}
