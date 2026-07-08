---
status: draft
version: 0.1.0
owner: qa
---

# TESTS — <Project Name>

<!-- VERIFY layer. qa defines the bar; execution tiers author the tests. -->

## Pyramid & targets

<!-- Adjust per project. Defaults: -->

| Layer | Share | Framework | Coverage target |
|-------|-------|-----------|-----------------|
| Unit | 70% | | 85% (core logic) |
| Integration | 20% | | — |
| E2E | 10% | | critical paths only |

## Conventions

<!-- File naming, location (colocated vs test dir), fixture strategy, what NEVER to mock. -->

## Definition of Done (testing gate)

- [ ] New logic has unit tests · changed behavior has updated tests
- [ ] EARS criteria of the feature map to at least one test each
- [ ] Suite green locally before any commit
- [ ] No test skipped/`.only` left behind · no coverage-config edits to pass (hook-enforced)
