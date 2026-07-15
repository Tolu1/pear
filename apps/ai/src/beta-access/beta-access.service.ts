import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ValidateResult {
  valid: boolean;
  remaining: number;
  limit: number;
}

export interface ConsumeResult {
  ok: boolean;
  remaining: number;
  limit: number;
}

@Injectable()
export class BetaAccessService {
  constructor(private readonly configService: ConfigService) {}

  validate(code: string): Promise<ValidateResult> {
    return this.call<ValidateResult>('validate', code);
  }

  consume(code: string): Promise<ConsumeResult> {
    return this.call<ConsumeResult>('consume', code);
  }

  private async call<T>(
    action: 'validate' | 'consume',
    code: string,
  ): Promise<T> {
    const baseUrl = this.configService.getOrThrow<string>('BACKEND_URL');
    const res = await fetch(`${baseUrl}/beta-access/${action}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-service-api-key':
          this.configService.getOrThrow<string>('SERVICE_API_KEY'),
      },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      throw new Error(`beta-access ${action} failed: ${res.status}`);
    }
    return (await res.json()) as T;
  }
}
