# Contributing to `node-iqms`

## Status

This SDK is **scaffolding-quality** until validated against a live EnterpriseIQ
instance. The Oracle queries are written from published partner documentation
(Ultra Consultants, TriMech, Constacloud) and the well-known EIQ table names —
they are **not** authoritative. Every query file carries a `TENTATIVE` banner.

The WebAPI driver is a stub. The DELMIAworks WebAPI module is a paid licensed
add-on without public documentation; finalizing that driver requires access to
the vendor SDK and a design-partner instance.

## Workflow

- Fork or branch from `main`.
- Conventional commits (`feat:`, `fix:`, `docs:`, etc.) — `semantic-release`
  drives versioning.
- Run `npm run lint && npm run build && npm test` before pushing.
- Open a PR against `main`. CI runs lint, build, and tests on Node 18/20/22.

## EIQ schema validation

When validating a query against a live tenant:

1. Note the EnterpriseIQ version (e.g. `2024 R1`).
2. Run the query against a read-only Oracle account.
3. If columns differ, update the `TENTATIVE` banner in the query file with the
   confirmed version and add a comment documenting the variation.
4. Add an entry to `CHANGELOG.md` under `### Changed`.

## Testing

Tests use a fake Oracle driver (`tests/mocks/oracle.ts`) — no live database
needed. WebAPI tests use MSW. Avoid adding integration tests that require live
credentials; that belongs in the consuming MCP server's smoke tests.
