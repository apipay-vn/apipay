#!/usr/bin/env node

// Dev mode entry point — runs TypeScript directly
import {execute} from '@oclif/core';
await execute({development: true, dir: import.meta.url});
