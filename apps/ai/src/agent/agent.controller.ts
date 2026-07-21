import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { AgentServer } from '@repo/agent-core';
import { AGENT_SERVER } from './agent.constants';
import { BetaAccessService } from '../beta-access/beta-access.service';
import { accessCodeGuard } from '../beta-access/access-code.guard';

@Injectable()
export class AgentController implements OnModuleInit {
  constructor(
    private readonly adapterHost: HttpAdapterHost,
    @Inject(AGENT_SERVER) private readonly server: AgentServer,
    private readonly betaAccessService: BetaAccessService,
  ) {}

  onModuleInit(): void {
    const express = this.adapterHost.httpAdapter.getInstance();
    express.use('/agent', accessCodeGuard(this.betaAccessService));
    express.use(
      '/agent',
      createExpressMiddleware({ router: this.server.router }),
    );
  }
}
