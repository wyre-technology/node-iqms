# `@wyre-technology/node-iqms`

Node.js / TypeScript client library for **IQMS / DELMIAworks** (EnterpriseIQ),
the manufacturing ERP from Dassault Systèmes.

> **Status:** Scaffolding. Oracle queries are written from public partner
> documentation and have **not** been validated against a live EnterpriseIQ
> instance. The WebAPI driver is a stub. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Why two drivers

EnterpriseIQ has two realistic integration surfaces, and most shops need both:

| Driver | Capability | Availability |
|--------|-----------|--------------|
| **Oracle** | Read-only queries against the EIQ schema | Universal — every install has it |
| **WebAPI** | Transactional writes (create work orders, post production, inventory adjustments) | Licensed add-on; not every customer owns it |

`IqmsClient` exposes a single resource surface and routes each call to the
appropriate driver. If a write is attempted without WebAPI configured, the
client throws a clear `DriverNotConfiguredError`.

## Install

```bash
npm install @wyre-technology/node-iqms
```

Configure `.npmrc` so npm can resolve the `@wyre-technology` scope from
GitHub Packages:

```
@wyre-technology:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

The `oracledb` package requires the **Oracle Instant Client** to be installed
on the host running the SDK. See [Oracle's installation guide](https://node-oracledb.readthedocs.io/en/latest/user_guide/installation.html).

## Quick start

```ts
import { IqmsClient } from '@wyre-technology/node-iqms';

const client = new IqmsClient({
  oracle: {
    user: 'eiq_readonly',
    password: process.env.IQMS_ORACLE_PASSWORD!,
    connectString: 'eiq-db.example.com:1521/EIQ',
  },
  // Optional — omit to run in read-only mode
  webapi: {
    baseUrl: 'https://eiq-app.example.com/webapi',
    username: 'integration-svc',
    password: process.env.IQMS_WEBAPI_PASSWORD!,
  },
});

const openWorkOrders = await client.workorders.list({ status: 'open', limit: 50 });
const wo = await client.workorders.get(12345);
```

## Errors

```ts
import {
  IqmsError,
  AuthenticationError,
  NotFoundError,
  DriverNotConfiguredError,
  NotImplementedError,
  OracleError,
} from '@wyre-technology/node-iqms';
```

## License

Apache-2.0
