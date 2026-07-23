## [1.0.1](https://github.com/wyre-technology/node-iqms/compare/v1.0.0...v1.0.1) (2026-07-23)


### Bug Fixes

* **build:** ignoreDeprecations for TS7 DTS build breakage (already on ^6.0.3) ([#24](https://github.com/wyre-technology/node-iqms/issues/24)) ([e38dac1](https://github.com/wyre-technology/node-iqms/commit/e38dac17ac989a27e59da01a92b5ae37692526be))
* **ci:** drop Node 18.x from the test matrix (EOL, vitest 4 requires 20.12+) ([#25](https://github.com/wyre-technology/node-iqms/issues/25)) ([2bbee93](https://github.com/wyre-technology/node-iqms/commit/2bbee93bb9daf1fe7e2162df286d822d0631184e))
* **security:** SHA-pin auto-add-to-project.yml [@main](https://github.com/main) -> [@6ae1533dd72f](https://github.com/6ae1533dd72f) (warden C-4) ([#15](https://github.com/wyre-technology/node-iqms/issues/15)) ([03ff076](https://github.com/wyre-technology/node-iqms/commit/03ff0762cbf1c6f7a03d4f48e8d00b2ce72fc529))

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
