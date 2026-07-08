---
name: network-design
description: Network architecture discipline — segmentation, routing, perimeter, traffic control. Cloud-agnostic; vendor constructs from memory-long §stack.
---

# Skill: Network Design

Universal concepts — VPC/VNet/subnet syntax comes from `memory-long §stack`, the topology discipline doesn't change.

## Segmentation (the foundation)

1. **Three-tier minimum**: public (ingress only: LBs, gateways) · private (workloads) · data (stores — no route to internet). Workloads never carry public IPs directly.
2. **CIDR planning is forever**: allocate non-overlapping ranges with room to grow, per environment AND per region — renumbering later is a migration project. Document the plan in the codemap.
3. Environment isolation at the network level (separate VPCs/VNets, not just subnets) — dev cannot reach prod data, ever.

## Traffic control

- **Deny by default, both directions.** Every allow rule names its purpose (rule without justification fails review).
- Egress is controlled, not open: NAT for updates, explicit allowlists for external APIs. Unrestricted egress is exfiltration-ready.
- East-west traffic between services is scoped (security groups referencing groups, network policies) — a compromised pod/VM shouldn't reach everything.

## Topology patterns

Hub-and-spoke for shared services (inspection, DNS, VPN) over full-mesh peering (N² rules) · load balancing at the right layer (L4 vs L7 — know why) · DNS is critical infrastructure: private zones for internal, health-checked records for failover.

## Review checklist

New network path → who initiates, what port, which direction, why · public exposure → architect sign-off (never fast-path, per instructions) · flow logs enabled where the platform bills sanely.
