import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AgentServer } from '@repo/agent-core';
import { AgentController } from './agent.controller';
import { AGENT_SERVER } from './agent.constants';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AGENT_SERVER,
      inject: [ConfigService],
      useFactory: async (config: ConfigService): Promise<AgentServer> => {
        const apiKey = config.getOrThrow<string>('ANTHROPIC_API_KEY');
        const server = new AgentServer({
          llm: {
            provider: 'anthropic',
            options: {
              model: 'claude-sonnet-4-20250514',
              apiKey,
              temperature: 0,
              promptCaching: true,
            },
          },
        });
        await server.init();
        return server;
      },
    },
    AgentController,
  ],
  exports: [AGENT_SERVER],
})
export class AgentModule {}
