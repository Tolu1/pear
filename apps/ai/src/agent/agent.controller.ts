import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { AgentServer } from '@repo/agent-core';
import { AGENT_SERVER } from './agent.constants';

@Injectable()
export class AgentController implements OnModuleInit {
  constructor(
    private readonly adapterHost: HttpAdapterHost,
    @Inject(AGENT_SERVER) private readonly server: AgentServer,
  ) {}

  onModuleInit(): void {
    const express = this.adapterHost.httpAdapter.getInstance();
    express.use(
      '/agent',
      createExpressMiddleware({ router: this.server.router }),
    );
  }
}
