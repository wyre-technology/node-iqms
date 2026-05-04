# 1.0.0 (2026-05-04)


### Bug Fixes

* **add-to-project:** call shared reusable workflow ([#2](https://github.com/wyre-technology/node-iqms/issues/2)) ([d64d5b0](https://github.com/wyre-technology/node-iqms/commit/d64d5b0d1c291b4e2027fab2ab24e7271fd56417))


### Features

* initial scaffold of @wyre-technology/node-iqms ([5c15d15](https://github.com/wyre-technology/node-iqms/commit/5c15d15d6c38d7bea2d1cc1a2c3811a23acce23f))

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
