#!/usr/bin/env node

// APIPAY_DASHBOARD_URL=http://localhost:5501 APIPAY_API_URL=http://localhost:5500/v1 ./bin/dev.js setup

// Dev mode entry point — runs TypeScript directly
import { execute } from '@oclif/core';
await execute({ development: true, dir: import.meta.url });
