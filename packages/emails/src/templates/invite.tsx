import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "react-email";

export interface InviteEmailProps {
  code: string;
  name?: string;
  downloadUrl: string;
  videoUrl: string;
}

const INK = "#0E140E";
const YELLOW = "#FFE566";
const CODE_BG = "#FFF2B3";
const CREAM = "#FCF6E6";
const MUTED = "#5B5F52";

export function InviteEmail({
  code,
  name,
  downloadUrl,
  videoUrl,
}: InviteEmailProps) {
  const greeting = name ? `You're early, ${name}.` : "You're early.";

  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>You've been invited to test Pear AI</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={wordmark}>Pear AI</Text>

          <Heading style={heading}>{greeting}</Heading>

          <Text style={paragraph}>
            We're teaching our agent to browse and get things done on its own.
            Point it at any site, give it a goal, and watch it work.
          </Text>

          <Text style={paragraph}>
            It's still learning and will get things wrong. When it does, tell us
            with the bug button or just reply here.
          </Text>

          <Text style={sign}>We hope you like it here.</Text>

          <Hr style={rule} />

          <Section style={codeWrap}>
            <Text style={codeLabel}>Your access code</Text>
            <Text style={codeValue}>{code}</Text>
          </Section>

          <Section style={{ textAlign: "center" }}>
            <Button style={button} href={downloadUrl}>
              Download Pear AI
            </Button>
          </Section>

          <Text style={videoLine}>
            Watch a quick setup:{" "}
            <Link style={link} href={videoUrl}>
              {videoUrl}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

InviteEmail.PreviewProps = {
  code: "PEAR-WR4S",
  name: "Ada",
  downloadUrl: "https://pearextension.com/download/pear-ai-playground/beta",
  videoUrl: "https://youtu.be/iPmaQMEWK1E",
} satisfies InviteEmailProps;

export default InviteEmail;

const body: React.CSSProperties = {
  backgroundColor: CREAM,
  colorScheme: "light only",
  margin: 0,
  padding: "32px 20px",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const container: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: `1px solid ${INK}1A`,
  borderRadius: "14px",
  maxWidth: "520px",
  margin: "0 auto",
  padding: "36px 34px",
};

const wordmark: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 700,
  letterSpacing: "-0.04em",
  color: INK,
  margin: "0 0 22px",
};

const heading: React.CSSProperties = {
  fontSize: "26px",
  fontWeight: 700,
  letterSpacing: "-0.03em",
  color: INK,
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "24px",
  letterSpacing: "-0.01em",
  color: INK,
  margin: "0 0 18px",
};

const codeWrap: React.CSSProperties = {
  backgroundColor: CODE_BG,
  border: `1px solid ${INK}26`,
  borderRadius: "10px",
  padding: "16px 20px",
  margin: "0 0 24px",
  textAlign: "center",
};

const codeLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  color: MUTED,
  margin: "0 0 6px",
};

const codeValue: React.CSSProperties = {
  fontFamily: "'SF Mono', 'Menlo', 'Consolas', monospace",
  fontSize: "24px",
  fontWeight: 700,
  letterSpacing: "0.10em",
  color: INK,
  margin: 0,
};

const button: React.CSSProperties = {
  backgroundColor: YELLOW,
  color: INK,
  border: `1px solid ${INK}`,
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: 700,
  letterSpacing: "-0.08em",
  textDecoration: "none",
  padding: "12px 24px",
  display: "inline-block",
  boxShadow: `3px 3px 0 0 ${INK}`,
};

const videoLine: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: "20px",
  letterSpacing: "-0.01em",
  color: MUTED,
  textAlign: "center",
  margin: "16px 0 0",
};

const link: React.CSSProperties = {
  color: "#8A5A12",
  textDecoration: "underline",
};

const rule: React.CSSProperties = {
  border: "none",
  borderTop: `1px solid ${INK}14`,
  margin: "28px 0",
};

const sign: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "24px",
  letterSpacing: "-0.01em",
  color: INK,
  margin: "0",
};
