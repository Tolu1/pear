import 'dotenv/config';
import { randomInt } from 'crypto';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { betaAccess } from '../src/beta-access/beta-access.schema';
import { MAX_RUNS } from '../src/beta-access/beta-access.constants';
import { sendInvite } from './send-invite';

const db = drizzle({
  client: neon(requireEnv('DATABASE_URL')),
  casing: 'snake_case',
});

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const paint = (code: number) => (s: string | number) =>
  `\x1b[${code}m${s}\x1b[0m`;
const c = {
  green: paint(32),
  red: paint(31),
  yellow: paint(33),
  cyan: paint(36),
  bold: paint(1),
  dim: paint(2),
};

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
}

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function requireFlag(name: string): string {
  const value = flag(name);
  if (!value) throw new Error(`Missing required flag: --${name}`);
  return value;
}

function generateCode(): string {
  let body = '';
  for (let i = 0; i < 4; i++) body += ALPHABET[randomInt(ALPHABET.length)];
  return `PEAR-${body}`;
}

async function mint(): Promise<void> {
  const email = requireFlag('for');
  const name = flag('name');
  const limit = Number(flag('limit') ?? MAX_RUNS);
  const send = !process.argv.includes('--no-send');

  if (!Number.isInteger(limit) || limit < 1)
    throw new Error(
      `--limit must be a whole number of runs, got ${flag('limit')}`,
    );
  if (limit > MAX_RUNS)
    throw new Error(`--limit cannot exceed ${MAX_RUNS}, got ${limit}`);

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    try {
      await db.insert(betaAccess).values({ code, email, runsGranted: limit });
      console.log(
        `\n${c.green('✓')} Minted ${c.bold(c.cyan(code))} for ${email} ${c.dim(`(${limit} runs)`)}`,
      );

      if (!send) {
        console.log(`${c.dim('⊘ Skipped the invite email (--no-send)')}\n`);
        return;
      }

      try {
        await sendInvite({ to: email, code, name });
        console.log(`${c.green('✓')} Invite sent to ${email}\n`);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        console.log(
          `${c.red('✗')} Couldn't send the invite: ${reason}\n  ${c.dim(`The code above is live. Send it to ${email} by hand.`)}\n`,
        );
      }
      return;
    } catch (error) {
      if (attempt === 4) throw error;
    }
  }
}

async function info(): Promise<void> {
  const code = flag('code');
  const email = flag('for');

  const all = process.argv.includes('--all');

  const matches = code
    ? await db.select().from(betaAccess).where(eq(betaAccess.code, code))
    : email
      ? await db.select().from(betaAccess).where(eq(betaAccess.email, email))
      : await db.select().from(betaAccess).orderBy(betaAccess.createdAt);

  const rows = code || all ? matches : matches.filter((row) => row.active);

  if (rows.length === 0) {
    const hidden = matches.length - rows.length;
    console.log(
      hidden > 0
        ? `\nNo active codes ${c.dim(`(${hidden} revoked, --all to see them)`)}\n`
        : '\nNo matching codes\n',
    );
    return;
  }

  console.log();
  for (const row of rows) {
    const remaining = row.runsGranted - row.runsUsed;
    const tone = remaining === 0 ? c.red : remaining <= 5 ? c.yellow : c.green;
    const status = row.active ? '' : `  ${c.red('[revoked]')}`;
    const granted =
      row.runsGranted === MAX_RUNS
        ? ''
        : `  ${c.dim(`(granted ${row.runsGranted})`)}`;
    console.log(
      `${c.bold(c.cyan(row.code))}  ${c.dim(row.email)}  ${tone(`${remaining}/${MAX_RUNS} left`)}${granted}${status}`,
    );
  }
  console.log();
}

async function revoke(): Promise<void> {
  const code = requireFlag('code');

  const [row] = await db
    .update(betaAccess)
    .set({ active: false })
    .where(eq(betaAccess.code, code))
    .returning();

  if (!row) throw new Error(`No such code: ${code}`);
  console.log(`\n${c.yellow('⊘')} Revoked ${c.bold(c.cyan(code))}\n`);
}

const actions: Record<string, () => Promise<void>> = {
  mint,
  info,
  revoke,
};

async function main(): Promise<void> {
  const action = process.argv[2];
  const run = actions[action];
  if (!run) throw new Error(`Unknown action: ${action ?? '(none)'}`);
  await run();
}

main().catch((error) => {
  console.error(`\n${c.red('✗')} ${error.message}\n`);
  process.exit(1);
});
