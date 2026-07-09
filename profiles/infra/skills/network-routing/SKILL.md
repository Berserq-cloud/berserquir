---
name: network-routing
description: Routing & connectivity discipline — BGP, OSPF, hybrid links, the tunnel classics. Protocol-level (IETF), vendor syntax from memory-long §stack.
---

# Skill: Network Routing & Connectivity

Protocols are standards; only the CLI is vendor. Complements `network-design` (topology) — this is how traffic actually finds its way, on-prem, cloud and hybrid.

## BGP discipline

1. **Never accept or announce routes unfiltered** — explicit prefix lists/route maps both directions; a missing filter is how you become a transit AS for the internet (or blackhole production).
2. eBGP between organizations/domains, iBGP (or an IGP) inside · private ASN ranges for internal use, documented in the codemap · **prepend/communities/local-pref are the tuning knobs** — document intent next to every policy, path selection debugging at 3am is real.
3. Advertise **summaries**, not host routes — route table size is a shared resource · dampening/max-prefix limits on external sessions (protect yourself from the other side's mistakes).

## OSPF discipline

Area 0 is the backbone, everything attaches to it · use stub/NSSA areas to shrink LSA flooding at the edges · **cost follows bandwidth policy, set explicitly** — default auto-cost on mixed link speeds produces surprise paths · adjacency checklist when it won't form: MTU mismatch, area type mismatch, timers, authentication (in that order).

## Hybrid connectivity (cloud ↔ on-prem)

Dedicated link (Direct Connect/ExpressRoute-class) for steady bandwidth + predictable latency; **VPN as backup on a different failure domain** — both running BGP so failover is routing, not runbooks · test the failover path on schedule (an untested backup link is decoration — same law as backups) · asymmetric routing kills stateful firewalls: keep both directions on the same path or design for it.

## The tunnel classics (check before debugging anything else)

**MTU/fragmentation** — tunnels eat bytes; clamp MSS, test with DF-bit pings · DNS split-horizon: internal names resolve internally on both sides · overlapping CIDRs between sites = NAT hell — prevent via the `network-design` CIDR plan, not mitigation.

## Verification

Routing changes are **architectural tier** (never fast-path): peer review + maintenance window + rollback plan · before/after route table diff in the report · monitoring on session state and prefix counts (see `observability` principles).
