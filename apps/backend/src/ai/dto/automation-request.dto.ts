// apps/backend/src/ai/dto/automation-request.dto.ts
import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsNumber,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AutomationStartDto {
  @IsString()
  sessionId: string;

  @IsString()
  screenshot: string; // base64

  @IsUrl()
  url: string;

  @IsString()
  html: string;

  @IsOptional()
  @IsString()
  goal?: string;

  @IsOptional()
  @IsObject()
  domContext?: Record<string, any>;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsObject()
  viewport?: {
    width: number;
    height: number;
  };
}

export class ActionResultDto {
  @IsString()
  actionId: string;

  @IsBoolean()
  success: boolean;

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsNumber()
  executionTime?: number;

  @IsOptional()
  @IsObject()
  newState?: Record<string, any>;
}

export class AutomationContinueDto {
  @IsString()
  sessionId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionResultDto)
  actionResults: ActionResultDto[];

  @IsString()
  newScreenshot: string; // base64

  @IsUrl()
  currentUrl: string;

  @IsString()
  newHtml: string;

  @IsOptional()
  @IsObject()
  domContext?: Record<string, any>;
}
