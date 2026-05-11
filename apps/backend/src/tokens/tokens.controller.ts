import { Controller, Get, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';
import { TokensService } from './tokens.service';
import { TokenMapper } from './token.mapper';
import { TokenResponseDto } from './dto/token-response.dto';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get()
  @ApiOperation({ summary: 'List all supported tokens' })
  findAll(): TokenResponseDto[] {
    const tokens = this.tokensService.findAll();
    return tokens.map(TokenMapper.toResponse);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supported token by id' })
  @ApiNotFoundResponse({ description: 'Token not found' })
  findOne(@Param('id') id: string): TokenResponseDto {
    const token = this.tokensService.findOne(id);
    return TokenMapper.toResponse(token);
  }
}
