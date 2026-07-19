import { render, pretty } from 'react-email';
import { InviteEmail, type InviteEmailProps } from './templates/invite';

export async function renderInviteEmail(
  props: InviteEmailProps,
): Promise<string> {
  return pretty(await render(InviteEmail(props)));
}
