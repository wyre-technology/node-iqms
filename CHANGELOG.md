# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial scaffold of `@wyre-technology/node-iqms` SDK.
- Oracle read driver with parameterized query layer for work orders, inventory, BOMs,
  sales orders, purchase orders, schedule, and quality entities. Queries are marked
  TENTATIVE pending design-partner schema validation.
- WebAPI write driver scaffold (DELMIAworks WebAPI module). All write operations are
  stubbed with `NotImplementedError` until access to vendor SDK documentation.
- Public resource classes that route reads to the Oracle driver and writes to the
  WebAPI driver, with a clear `DriverNotConfiguredError` when WebAPI credentials are
  not supplied.
