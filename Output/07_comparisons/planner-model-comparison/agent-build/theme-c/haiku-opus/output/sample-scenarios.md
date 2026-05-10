# Sample Test Scenarios & Expected Outputs

**Version**: 1.0  
**Status**: Phase 1 Complete (5 diverse scenarios)  
**Last Updated**: 2026-05-09

---

## Overview

Five representative test scenarios covering different industries, priority axes, and constraint patterns. Each scenario includes:
1. Requirement document (input)
2. Expected analysis output
3. Expected recommendations
4. Validation criteria (how to verify correctness)

---

## Scenario 1: SaaS Startup — Scalability First

### Input: Project Requirement Document

```markdown
# Project Requirement: Social Media Platform (Startup)

## 1. Project Overview
We're building a social media platform targeting Gen-Z users (15-35).
- Day 1: 10K users (friends & family beta)
- Year 1: 1M users (target: Series A)
- Year 5: 10M+ users (platform scale)

Geographic scope: Initially US, plan to expand globally.

## 2. Functional Requirements
- User profiles (photo, bio, connections)
- Feed (algorithmically personalized)
- Messaging (real-time chat)
- Notifications (push + in-app)
- Media upload (photo/video)

## 3. Non-Functional Requirements

### Scalability
- Expected QPS: 100 (Day 1) → 10K (Year 1) → 100K (Year 5)
- Concurrent users: 10K → 100K → 1M
- Data volume: 1TB (Year 1) → 50TB (Year 5)
- "We need to scale horizontally and quickly"

### Security
- Standard user data encryption (PII not regulated by HIPAA/PCI)
- Social features (reputation, blocking, reporting)
- No compliance mandates

### Performance
- Feed load: <500ms ideal, <2s acceptable
- Messaging: <100ms (real-time)
- Upload: <3s (user expectation)

### Reliability
- Uptime target: 99.5% (acceptable downtime 3.6 hours/month)
- Not mission-critical (unlike HealthCare)

## 4. Team & Constraints
- Team: 3 engineers (1 senior, 2 mid-level)
- Background: JavaScript/Node.js ecosystem
- Timeline: 3-month MVP, Series A pitch
- Budget: $500K seed round (including everything)
- Existing stack: None (greenfield)

## 5. Preferences
- "We want to move fast and iterate quickly"
- "Cloud-first, no on-premise infrastructure"
- "Open-source preferred where possible"
```

### Expected Requirement Analysis Output

```yaml
industry: "SaaS"
industry_confidence: 0.95

priority_weights:
  scalability: 0.45      # "scale to 10M", "horizontal scaling", "exponential growth"
  security: 0.15         # Standard PII only, no compliance
  performance: 0.20      # "real-time", "sub-500ms", "messaging latency"
  velocity: 0.20         # "3-month MVP", "move fast", "Series A pitch"

axis_scores:
  scalability: 9         # 1M→10M users, QPS 100→100K
  security: 3            # Standard security, no compliance
  performance: 5         # Real-time messaging needed
  velocity: 5            # 3-month timeline (moderate pressure)

constraints:
  budget_cap: "$500K"
  team_size: 3
  timeline_weeks: 12
  existing_stack: ["JavaScript"]
  forbidden_techs: []

conflicts: []
recommendation_angle: "Prioritize horizontal scalability and rapid iteration. Choose cloud-native, stateless architecture. Team's JavaScript expertise is major asset — leverage it."
```

### Expected Technology Proposals

```markdown
| # | Language | Framework | Database | Infrastructure | Justification |
|---|----------|-----------|----------|-----------------|---------------|
| 1 | TypeScript | Express.js | PostgreSQL | AWS (EC2+RDS) | Best velocity (9/10) + strong scalability (8/10). Leverages team's JS expertise. Proven at scale (Airbnb, Stripe). |
| 2 | Python | FastAPI | PostgreSQL | GCP (Cloud Run) | Near-equal velocity, better async handling. GCP Cloud Run auto-scaling reduces ops overhead. |
| 3 | Go | Gin | PostgreSQL | Kubernetes (EKS) | Superior scalability (9/10) + performance (10/10). Trade-off: 6-week Go learning curve. |
| 4 | TypeScript | Next.js + API routes | Supabase (PostgreSQL) | Vercel | Ultra-fast deployment (Vercel CI/CD), excellent DX. Trade-off: Vendor lock-in to Vercel, limited customization. |
```

### Expected Scoring Matrix

```markdown
| Candidate | Scalability | Security | Performance | Velocity | Weighted Score |
|-----------|-------------|----------|-------------|----------|-----------------|
| Stack 1 (TS/Express) | 8/10 | 7/10 | 8/10 | 9/10 | 8.2/10 |
| Stack 2 (Python/FastAPI) | 8/10 | 8/10 | 8/10 | 8/10 | 8.0/10 |
| Stack 3 (Go/Gin) | 9/10 | 8/10 | 10/10 | 7/10 | 8.3/10 |
| Stack 4 (TS/Next.js) | 7/10 | 7/10 | 8/10 | 10/10 | 7.8/10 |
```

### Expected Final Recommendation

```markdown
**PRIMARY: TypeScript + Express.js + PostgreSQL + AWS**
Weighted Score: 8.2/10

Rationale: Your project prioritizes scalability (45%) and velocity (20%). This stack scores 9/10 and 8/10 on both axes respectively. JavaScript expertise already in team is major advantage — zero ramp-up time.

Infrastructure: AWS EC2 auto-scaling groups + RDS PostgreSQL provides proven horizontal scaling to 100K+ QPS. Cost: ~$255K Year 1.

Trade-off: Express.js requires careful async handling; not as "battle-tested" as Go for extreme scale. Mitigation: Implement caching layer (Redis) early; load-test at 50K users before Series A.

Alternative 1: Go/Gin + Kubernetes (Score 8.3)
- Choose if: Performance optimization critical; willing to invest 6 weeks in Go learning
- When: After MVP proves product-market fit (Phase 2 optimization)

Alternative 2: Python/FastAPI + GCP Cloud Run (Score 8.0)
- Choose if: Ops overhead unacceptable; prefer managed auto-scaling
- When: If AWS complexity becomes blocker
```

### Validation Criteria

✓ **Industry**: Correctly identified as SaaS (multiple references to "scale", "millions of users")  
✓ **Priority Weights**: Scalability > Velocity > Performance > Security (clear from timeline + growth ambitions)  
✓ **Recommendation**: TypeScript or Go should rank #1 (not Python or exotic languages)  
✓ **Rationale mentions**: Team's JS expertise, 3-month timeline, AWS auto-scaling capability  
✓ **Tradeoff analysis**: Identifies learning curve (Go) vs. platform maturity (TS/Express) tension  

---

## Scenario 2: HealthCare Provider — Security First

### Input: Project Requirement Document

```markdown
# Project Requirement: Patient Data Management System

## 1. Project Overview
Building a patient portal for a 200-bed hospital network. Will manage:
- Patient demographics (name, SSN, contact)
- Medical records (diagnoses, medications, lab results)
- Appointment scheduling
- Secure messaging (patient ↔ provider)

Initial users: 5,000 (hospital staff) + 10,000 (patients)
Growth: Slow, steady 10-15% YoY

Geographic scope: Mid-Atlantic US, single healthcare provider

## 2. Functional Requirements
- Patient authentication (secure login)
- Role-based access control (doctor, nurse, admin, patient)
- Medical records search (HIPAA-compliant audit logging)
- Appointment booking + reminders
- Secure messaging (encrypted end-to-end preferred)
- PDF report generation (test results, discharge summaries)

## 3. Non-Functional Requirements

### Security & Compliance
- **HIPAA Compliance** (Required)
  - Encryption at rest (AES-256)
  - Encryption in transit (TLS 1.3)
  - Audit logging (who accessed what, when)
  - Data retention policies (7+ years)
  - Disaster recovery with encrypted backups
  
- **GDPR** (secondary, for international expansion)
- No third-party data processors (or BAA signed if used)
- Access control: Multi-factor authentication (MFA) mandatory
- Network: On-premise preferred, private cloud acceptable

### Scalability
- User count: 15K initial, 50K Year 5 (slow growth)
- Concurrent users: 500 peak (office hours)
- Data volume: 10GB initial, 200GB Year 5
- NOT a scaling-first project

### Performance
- Search: <2s (not real-time critical)
- Page load: <3s acceptable
- Report generation: <10s for batch

### Reliability
- Uptime: 99.9% (4.4 hours/month downtime acceptable, but minimize)
- 24/7 patient access (no maintenance windows during overnight)
- Disaster recovery: 2-hour RTO (Recovery Time Objective)

## 4. Team & Constraints
- Team: 5 engineers (Java background, 8+ years experience each)
- Current stack: Java 11, Oracle, Spring Framework (legacy ERP)
- Timeline: 18 months to go-live (regulatory approval needed)
- Budget: $800K (infrastructure + team)
- Constraints: Must integrate with existing Oracle ERP (data sync)

## 5. Preferences
- "Stability and vendor support critical. No experimental technologies."
- "Team is Java-comfortable; retraining cost too high"
- "On-premise infrastructure preferred (full data control)"
```

### Expected Requirement Analysis Output

```yaml
industry: "HealthCare"
industry_confidence: 0.98

priority_weights:
  scalability: 0.15      # Slow growth, not scaling concern
  security: 0.50         # HIPAA, encryption, audit logging
  performance: 0.10      # <3s acceptable, not real-time
  velocity: 0.25         # 18-month timeline (generous)

axis_scores:
  scalability: 4         # 15K users, slow growth, not a constraint
  security: 10           # HIPAA, GDPR, MFA, encryption, audit logging
  performance: 3         # No real-time, batch processing OK
  velocity: 4            # 18 months (not urgent), but team expertise + integration complexity

constraints:
  budget_cap: "$800K"
  team_size: 5
  timeline_weeks: 72
  existing_stack: ["Java", "Oracle", "Spring Framework"]
  forbidden_techs: []

conflicts: []
recommendation_angle: "Prioritize security, compliance, and stability. Choose proven platforms with vendor support. Leverage existing Java expertise. Integration with Oracle ERP is key constraint."
```

### Expected Technology Proposals

```markdown
| # | Language | Framework | Database | Infrastructure | Justification |
|---|----------|-----------|----------|-----------------|---------------|
| 1 | Java | Spring Boot | Oracle | On-Premise + AWS PrivateLink | Proven HIPAA compliance (many healthcare orgs). Spring Security mature. Oracle integration native. Stability + vendor support. |
| 2 | Python | Django | PostgreSQL | Private Cloud (Azure Government) | HIPAA-compliant managed services. PostgreSQL OSS, active community. Slightly lower cost than Java/Oracle. |
| 3 | C# | ASP.NET Core | SQL Server | Azure Sovereign Cloud | Enterprise-grade compliance. Microsoft FedRAMP certified. Best for hybrid (on-premise + cloud). |
| 4 | Java | JBoss EAP | Oracle | On-Premise (self-managed) | Maximum control, no vendor lock-in. Requires significant DevOps expertise. |
```

### Expected Scoring Matrix

```markdown
| Candidate | Scalability | Security | Performance | Velocity | Weighted Score |
|-----------|-------------|----------|-------------|----------|-----------------|
| Stack 1 (Java/Spring) | 7/10 | 9/10 | 6/10 | 7/10 | 8.3/10 |
| Stack 2 (Python/Django) | 6/10 | 9/10 | 5/10 | 8/10 | 8.1/10 |
| Stack 3 (C#/ASP.NET) | 7/10 | 9/10 | 7/10 | 6/10 | 8.1/10 |
| Stack 4 (Java/JBoss) | 7/10 | 10/10 | 6/10 | 5/10 | 7.9/10 |
```

**Note**: Weights: Scalability 0.15, Security 0.50, Performance 0.10, Velocity 0.25

### Expected Final Recommendation

```markdown
**PRIMARY: Java + Spring Boot + Oracle + On-Premise (+ AWS PrivateLink)**
Weighted Score: 8.3/10

Rationale: Your project's critical priority is security & compliance (weight 50%). This stack scores 9/10 on security — proven at thousands of HIPAA-compliant healthcare organizations.

Team advantage: Existing Java expertise eliminates ramp-up time. Spring Security framework mature, battle-tested for healthcare. Oracle integration with existing ERP system native (data sync, no middleware complexity).

Infrastructure: On-premise servers in hospital datacenter + AWS PrivateLink for disaster recovery backup. Gives full data control (HIPAA requirement) + vendor-supported managed backups.

Trade-off: Scalability (7/10) is not an issue for your 15K→50K slow growth. Performance adequate for non-real-time application.

Cost estimate: $400K infrastructure (servers, Oracle licensing, on-premise hardening) + $350K team (18-month build) + $50K compliance/audit = $800K total. Aligns with budget cap.

Alternative 1: C# + ASP.NET Core + Azure Sovereign Cloud (Score 8.1)
- Choose if: On-premise not available; prefer cloud + FedRAMP compliance
- Risk: Vendor lock-in to Microsoft, but enterprise support strong

Risk Mitigation Plan:
1. HIPAA audit (3rd-party) at Month 6, Month 12 → confirm compliance trajectory
2. Disaster recovery drills quarterly (RTO 2 hours validation)
3. Encryption key management: Use AWS CloudHSM (FIPS 140-2 validated)
```

### Validation Criteria

✓ **Industry**: Correctly identified as HealthCare (HIPAA, patient data, secure messaging)  
✓ **Priority Weights**: Security (50%) >> others; Scalability (15%) due to slow growth  
✓ **Recommendation**: Java/Spring or C#/ASP.NET should rank #1 (not Node.js or trendy languages)  
✓ **Compliance focus**: HIPAA, audit logging, encryption explicitly mentioned in recommendation  
✓ **Team leverage**: Java expertise highlighted as rationale, not a learning curve  
✓ **Tradeoff**: Acknowledges "scalability not an issue for 15K users" (correct interpretation)  

---

## Scenario 3: IoT/Embedded — Performance First

### Input: Project Requirement Document

```markdown
# Project Requirement: Smart Building Automation System

## 1. Project Overview
IoT platform for building automation (HVAC, lighting, occupancy sensors).
- Hardware: 100,000+ sensors deployed across buildings
- Edge devices: 10,000 gateways (mini-computers at building entrance)
- Cloud backend: Aggregation, analytics, alerting
- Control: Real-time response (<100ms latency from sensor event to action)

## 2. Functional Requirements
- Sensor telemetry ingestion (temperature, motion, CO2)
- Real-time event processing (motion → light on)
- Analytics dashboard (energy consumption trends)
- Alerting (anomaly detection, maintenance prediction)
- Firmware OTA (over-the-air) updates to gateways

## 3. Non-Functional Requirements

### Performance
- Sensor-to-action latency: **<100ms** (critical)
- Throughput: 100K sensors × 1 message/min = 1,666 QPS
- Edge devices: <50ms processing per event
- Memory footprint: <500MB per gateway (constrained hardware)

### Scalability
- Sensors: 100K → 1M over 3 years
- Gateways: 10K → 50K
- Horizontally scalable backend (serverless preferred for burst loads)

### Reliability
- Sensor failure tolerance: System continues with reduced data
- Network disconnection: Edge device queues data locally, syncs when reconnected
- Uptime target: 99.5% (acceptable brief outages; not life-critical)

### Security
- Sensor authentication: TLS mutual cert
- Data: Encryption in transit (no PII, only environmental data)
- Compliance: No HIPAA/GDPR (non-personal data)

## 4. Team & Constraints
- Team: 4 engineers (C/embedded background, 5-10 years)
- Current infrastructure: Custom C code + MQTT brokers
- Timeline: 9 months to MVP (commercial pilot)
- Budget: $400K
- Constraint: Gateways have 512MB RAM, dual-core CPU (ARM-based)

## 5. Preferences
- "Performance is non-negotiable. 100ms latency is hard requirement."
- "We prefer compiled languages (C, Go, Rust)"
- "Edge-first architecture (processing at sensor, not cloud)"
```

### Expected Requirement Analysis Output

```yaml
industry: "IoT"
industry_confidence: 0.96

priority_weights:
  scalability: 0.20      # 100K→1M sensors, but horizontal scaling acceptable
  security: 0.05         # No PII, standard TLS sufficient
  performance: 0.60      # <100ms latency is hard requirement
  velocity: 0.15         # 9-month timeline, moderate pressure

axis_scores:
  scalability: 8         # 100K sensors, need distributed architecture
  security: 3            # Standard TLS, no compliance
  performance: 10        # <100ms latency, real-time critical
  velocity: 4            # 9 months, but C/embedded team will adapt faster

constraints:
  budget_cap: "$400K"
  team_size: 4
  timeline_weeks: 36
  existing_stack: ["C", "MQTT"]
  forbidden_techs: ["Python", "Node.js"]  # Too slow for edge

conflicts: []
recommendation_angle: "Prioritize performance and edge-first architecture. Use compiled languages (Go, C, Rust) for gateways. Cloud backend can be higher-level language (Go, Python) since latency-critical path is edge. Team's C expertise valuable for firmware."
```

### Expected Technology Proposals

```markdown
| # | Language (Edge) | Language (Cloud) | Framework | Database | Justification |
|---|---|---|----------|---------|--------------|
| 1 | Go | Go | Fiber (API) | InfluxDB (time-series) | Go excellent for both edge + cloud. Fast compilation, small binary. InfluxDB optimized for sensor data. |
| 2 | C | Go | Fiber | TimescaleDB (PostgreSQL) | C for maximum edge performance; Go backend. Trade-off: C complexity. |
| 3 | Rust | Rust | Actix-web | InfluxDB | Memory-safe; best performance. Trade-off: Steep learning curve. |
| 4 | C | Python | FastAPI | TimescaleDB | Python for rapid cloud development. Edge remains C (fast). Good balance. |
```

### Expected Scoring Matrix

```markdown
| Candidate | Scalability | Security | Performance | Velocity | Weighted Score |
|-----------|-------------|----------|-------------|----------|-----------------|
| Stack 1 (Go/Go) | 9/10 | 7/10 | 9/10 | 8/10 | 8.8/10 |
| Stack 2 (C/Go) | 9/10 | 7/10 | 10/10 | 6/10 | 8.6/10 |
| Stack 3 (Rust/Rust) | 9/10 | 10/10 | 10/10 | 4/10 | 8.3/10 |
| Stack 4 (C/Python) | 8/10 | 7/10 | 9/10 | 8/10 | 8.4/10 |
```

**Note**: Weights: Performance 0.60, Scalability 0.20, Velocity 0.15, Security 0.05

### Expected Final Recommendation

```markdown
**PRIMARY: Go (Edge) + Go (Cloud) + InfluxDB + Kubernetes (Cloud)**
Weighted Score: 8.8/10

Rationale: Your critical requirement is sub-100ms sensor-to-action latency (weight 60%). This stack achieves:
- **Edge (Go)**: Compiled, minimal overhead, <50ms event processing on 512MB ARM device
- **Cloud (Go)**: Fast API responses, Fiber framework optimized for throughput (100K+ QPS)
- **Database**: InfluxDB time-series designed for sensor data (1M data points/second)

Alternative to C: Go provides ~95% of C's performance with 10x less code complexity. Smaller binary footprint (30MB vs. 100MB+) leaves room for OTA updates on constrained hardware.

Team consideration: C-experienced team will learn Go in 2-3 weeks (syntax familiar). Lower risk than Rust (8+ week learning curve).

Trade-off: Edge processing complexity (state management, local queuing) requires careful design. Mitigation: Use event-driven patterns (familiar to MQTT background).

Cost: $400K total (team $250K for 9 months, cloud infra $75K for pilot, edge hardware $75K)

Alternative 1: Rust/Rust + InfluxDB (Score 8.3)
- Choose if: Memory safety critical + long-term maintenance (5+ years)
- Risk: Learning curve (8-12 weeks) may compress 9-month timeline

Risk Mitigation:
1. Performance testing at 50K sensors (Month 4) → validate <100ms latency
2. Edge device test: Deploy firmware to 10 pilot gateways, measure actual latency
3. Cloud load test: 1M simulated sensors → measure Kubernetes auto-scaling behavior
```

### Validation Criteria

✓ **Industry**: Correctly identified as IoT (sensors, edge devices, real-time, latency <100ms)  
✓ **Priority Weights**: Performance (60%) >> others; Velocity (15%) due to 9-month timeline  
✓ **Recommendation**: Go or C should rank #1 (not Python, Node.js, or high-level languages)  
✓ **Edge-first focus**: Recommendation emphasizes edge processing, gateway firmware  
✓ **Performance numbers**: <50ms edge processing, <100ms sensor-to-action latency explicitly mentioned  
✓ **Constraint handling**: 512MB RAM gateway memory constraint addressed in recommendation  

---

## Scenario 4: Enterprise Migration — Stability First

### Input: Project Requirement Document

```markdown
# Project Requirement: Legacy PHP → Modern Stack Migration

## 1. Project Overview
Migrating 50,000 lines of PHP codebase (7 years old) to modern architecture.
- Current: PHP 7.4 + MySQL + Apache, hosting at Bluehost
- Issues: Slow deployments (manual FTP), no automated testing, security debt
- Goal: Modernize stack, improve developer productivity, enable feature velocity

## 2. Target Architecture
- Monolithic → Microservices (phased)
- Manual deployment → CI/CD
- Testing: Zero → 80% coverage
- Infrastructure: Bluehost → Cloud (AWS preferred)

## 3. Functional Requirements
- All existing features preserved
- Feature parity with legacy system
- No user-visible changes (transparent migration)

## 4. Non-Functional Requirements

### Compatibility & Interoperability
- Data migration: Zero downtime, backward-compatible
- Legacy API compatibility: Phase 1 (6 months) uses adapter layer
- Database: MySQL 5.7 → PostgreSQL (with migration tool)
- Session handling: Redis (distributed sessions)

### Scalability
- Current: 1M requests/month (26 QPS avg)
- Growth target: 10M requests/month (300 QPS avg) within 18 months
- Ability to scale horizontally expected

### Stability & Support
- Uptime: 99.9% (critical e-commerce system)
- Vendor support: Prefer managed services (reduce ops burden)
- Long-term support: 10+ year stack lifespan

### Team Capacity
- Current PHP team: 7 engineers (9-12 years PHP experience)
- Retraining cost: High (cannot afford 3-month learning curve)
- New hires: Willing to hire 2-3 junior engineers (modern stack preference)

## 5. Team & Constraints
- Timeline: 18 months (Phase 1: 6 months parallel migration, Phase 2: cutover, Phase 3: optimization)
- Budget: $1.2M (team + infrastructure + tools)
- Risk tolerance: Low (mission-critical e-commerce, cannot fail)
- Vendor lock-in: Acceptable (managed services preferred over DIY ops)

## 6. Preferences
- "We've used PHP for 7 years. Any language requiring 3+ months onboarding is risky."
- "Stability over innovation. We need proven, boring technology."
- "We're open to polyglot: PHP-compatible backend (quick, familiar) + modern frontend (React)."
```

### Expected Requirement Analysis Output

```yaml
industry: "Enterprise"
industry_confidence: 0.92

priority_weights:
  scalability: 0.20      # Growth to 300 QPS, but not hypergrowth
  security: 0.20         # E-commerce, no compliance, but security debt high
  performance: 0.10      # Current <100ms latency, not critical
  velocity: 0.50         # 18-month migration timeline, feature velocity post-migration

axis_scores:
  scalability: 6         # 1M→10M monthly requests, need horizontal scaling
  security: 7            # Legacy security debt, need hardening
  performance: 5         # No real-time requirements, <500ms acceptable
  velocity: 7            # 18 months (moderate), but team expertise loss risk

constraints:
  budget_cap: "$1.2M"
  team_size: 7
  timeline_weeks: 72
  existing_stack: ["PHP", "MySQL", "Apache"]
  forbidden_techs: ["Rust", "Go"]  # Too steep learning curve

conflicts:
  - "18-month timeline conflicts with 'no 3+ month retraining' constraint. Proposed resolution: Polyglot approach (PHP backend for familiar layer, Node.js/TypeScript for new services). Gradual migration reduces learning curve from 12 weeks to 4 weeks."

recommendation_angle: "Prioritize team continuity and stability. Leverage existing PHP expertise for Phase 1 (parallel migration with adapter layer). Introduce modern languages (TypeScript, Go) in Phase 2+ for new microservices. Managed services reduce ops burden."
```

### Expected Technology Proposals

```markdown
| # | Language (Phase 1) | Language (Phase 2+) | Framework | Database | Justification |
|---|---|---|----------|---------|--------------|
| 1 | PHP 8.1 | TypeScript | Laravel Octane (PHP), Express (TS) | PostgreSQL | PHP preserves team expertise; TypeScript for new services. Gradual migration path. |
| 2 | TypeScript | TypeScript | Express + NestJS | PostgreSQL | Full TypeScript stack from Day 1. Learning curve 6 weeks for team; offset by modern tooling DX. |
| 3 | Python | Python | Django | PostgreSQL | Rapid development, good ORM. Learning curve 8 weeks; lower than new compiled language. |
| 4 | Java | Java | Spring Boot | PostgreSQL | Enterprise-grade stability, mature ecosystem. But vendor lock-in risk and slower onboarding (10 weeks). |
```

### Expected Scoring Matrix

```markdown
| Candidate | Scalability | Security | Performance | Velocity | Weighted Score |
|-----------|-------------|----------|-------------|----------|-----------------|
| Stack 1 (PHP + TS hybrid) | 7/10 | 8/10 | 7/10 | 9/10 | 8.1/10 |
| Stack 2 (TS/Express) | 8/10 | 8/10 | 8/10 | 7/10 | 7.8/10 |
| Stack 3 (Python/Django) | 7/10 | 8/10 | 6/10 | 8/10 | 7.6/10 |
| Stack 4 (Java/Spring) | 8/10 | 9/10 | 7/10 | 5/10 | 7.3/10 |
```

**Note**: Weights: Velocity 0.50, Scalability 0.20, Security 0.20, Performance 0.10

### Expected Final Recommendation

```markdown
**PRIMARY: Polyglot Migration (PHP 8.1 + TypeScript + PostgreSQL + AWS ECS)**
Weighted Score: 8.1/10

Rationale: Your critical challenge is 18-month migration with zero risk of failure. Direct rewrite to TypeScript would require 6-8 week team retraining (unacceptable given mission-critical system).

Proposed approach:
- **Phase 1 (Months 0-6)**: Run old PHP + MySQL alongside new TypeScript backend (adapter layer). Gradually route traffic to TypeScript. No team retraining yet; continue PHP maintenance.
- **Phase 2 (Months 6-12)**: Full cutover to TypeScript. Hire 2-3 junior engineers (TypeScript background). Senior PHP team transitions to TypeScript (now low-risk, learning happens in production support role).
- **Phase 3 (Months 12-18)**: Optimization; extract microservices in TypeScript; retire PHP.

This approach scores 9/10 on velocity because:
- Phase 1 uses familiar PHP (immediate productivity, zero ramp-up)
- Phase 2 introduces TypeScript gradually (team learns while maintaining old system)
- By Phase 3, team is productive in TypeScript (6+ months experience)

Database: PostgreSQL (better tooling than MySQL for analytics, post-migration data analysis).

Infrastructure: AWS ECS (managed container service) reduces ops burden vs. self-managed Kubernetes. Cost: ~$600K over 18 months (team $900K, infra $300K).

Trade-off: Polyglot approach has complexity (two codebases, adapter layer maintenance). Mitigation: Adapter layer is temporary (6 months only); simplified interface (JSON API) reduces coupling.

Alternative 1: Full TypeScript Rewrite (Score 7.8)
- Choose if: Team willing to accept 6-8 week learning curve + risk of slower Phase 1
- When: Post-migration (Phase 2+) for new features

Risk Mitigation:
1. Phase 1 testing: Run A/B test (10% traffic to TypeScript) at Month 2 → measure error rates
2. Database migration drills: Practice MySQL→PostgreSQL migration on copy at Month 3
3. Team skilling: TypeScript training starting Month 2 (parallel to PHP maintenance)
```

### Validation Criteria

✓ **Industry**: Correctly identified as Enterprise (legacy migration, stability, 10-year lifespan)  
✓ **Priority Weights**: Velocity (50%) due to aggressive timeline; Scalability/Security (20% each)  
✓ **Conflict detected**: "No 3+ month retraining" flagged as conflict with full rewrite → polyglot solution proposed  
✓ **Recommendation**: PHP + TypeScript polyglot approach prioritized over full rewrite (respects team constraint)  
✓ **Phased migration**: 3-phase timeline (parallel → cutover → optimize) explicitly described  
✓ **Team consideration**: Learning curve addressed; junior hire strategy proposed  

---

## Scenario 5: EdTech Platform — Reliability First

### Input: Project Requirement Document

```markdown
# Project Requirement: Online Exam Platform (Educational Technology)

## 1. Project Overview
Online platform for university exams and assessments.
- Users: 10K students, 1K faculty, 100 institutions
- Peak load: Exam season (2 weeks × 4 times/year)
  - Normal: 100 concurrent users
  - Peak exam: 5,000 concurrent users (simultaneous exam start)
- Critical requirement: **Zero downtime during exam season**

## 2. Functional Requirements
- Exam delivery (question, answer submission, time tracking)
- Live proctoring (camera feed, audio monitoring)
- Instant grading (auto-grade + manual review)
- Results dashboard (students, faculty)
- Analytics (performance analytics per course)

## 3. Non-Functional Requirements

### Reliability & Availability
- Uptime target: **99.99%** (52 seconds/year downtime) during exam season
- This means: No scheduled maintenance during exam dates (12 weeks/year)
- Auto-failover: <10 seconds to backup (student can re-submit answer without loss)
- Disaster recovery: 4-hour RTO (can restart on backup infrastructure if primary fails)

### Scalability
- Users: 10K → 50K within 5 years (steady growth)
- Peak concurrent: 5K now, 20K in 5 years
- Data: Exam submissions, recordings (video) → high storage

### Performance
- Exam submission: <2s response (student cannot wait longer)
- Results calculation: <30 seconds (real-time feedback expectation)
- Video streaming: <5s startup (proctoring feed)

### Security
- Student data: Name, email, exam answers (sensitive, but not HIPAA)
- No compliance mandate (educational data not regulated like healthcare)
- Authentication: Strong (prevent exam fraud via account takeover)

## 4. Team & Constraints
- Team: 6 engineers (full-stack, JavaScript/Node.js primarily)
- Current stack: Node.js + Express + MongoDB
- Budget: $600K (18-month build)
- Timeline: 12 months to MVP (exam season deadline critical)
- Preference: Minimal operational complexity (small DevOps team)

## 5. Preferences
- "Uptime is non-negotiable. We lose reputation if any exam fails."
- "Our team knows JavaScript well. Retraining is not attractive."
- "We prefer managed services (reduce ops burden) + PaaS if available."
```

### Expected Requirement Analysis Output

```yaml
industry: "EdTech"
industry_confidence: 0.88

priority_weights:
  scalability: 0.15      # 10K→50K, but not hypergrowth
  security: 0.15         # Authentication critical, no major compliance
  performance: 0.20      # <2s submission response, real-time
  velocity: 0.50         # 12-month deadline, MVP for exam season

axis_scores:
  scalability: 7         # 5K→20K concurrent over 5 years
  security: 7            # Authentication, exam fraud prevention
  performance: 7         # <2s submission, <30s results calc
  velocity: 8            # 12-month aggressive timeline, team expertise

constraints:
  budget_cap: "$600K"
  team_size: 6
  timeline_weeks: 52
  existing_stack: ["Node.js", "Express", "MongoDB"]
  forbidden_techs: []

conflicts:
  - "12-month timeline (urgent) conflicts with 99.99% uptime requirement during exam season. Proposed resolution: Use managed PaaS (Heroku, Vercel, Firebase) to achieve HA without ops complexity. Reduces timeline risk."

recommendation_angle: "Prioritize reliability (99.99% uptime) and velocity (12-month deadline). Leverage Node.js team expertise. Use managed services (PaaS, serverless) to achieve HA without dedicated DevOps engineer. Accept proprietary lock-in for operational simplicity."
```

### Expected Technology Proposals

```markdown
| # | Language | Framework | Database | Infrastructure | Justification |
|---|----------|-----------|----------|-----------------|---------------|
| 1 | TypeScript | Next.js + Express | Supabase (PostgreSQL) | Vercel + Cloudflare | Best for reliability + velocity. Vercel auto-scaling, global CDN, 99.99% uptime SLA. Managed PaaS removes ops overhead. |
| 2 | TypeScript | NestJS | MongoDB Atlas | AWS ECS (managed) + RDS failover | Similar reliability to #1, but more ops complexity (ECS vs. Vercel). |
| 3 | Node.js | Express | MongoDB Atlas | Heroku | Simplest for MVP, but lower uptime SLA (99.95%, not 99.99%). |
| 4 | TypeScript | Express | PostgreSQL | AWS (EC2 + RDS Multi-AZ) | Best performance, but highest ops burden (no auto-scaling, requires DevOps expertise). |
```

### Expected Scoring Matrix

```markdown
| Candidate | Scalability | Security | Performance | Velocity | Weighted Score |
|-----------|-------------|----------|-------------|----------|-----------------|
| Stack 1 (Next.js/Vercel) | 9/10 | 8/10 | 9/10 | 10/10 | 9.4/10 |
| Stack 2 (NestJS/AWS) | 8/10 | 8/10 | 8/10 | 7/10 | 7.9/10 |
| Stack 3 (Express/Heroku) | 7/10 | 7/10 | 7/10 | 9/10 | 7.7/10 |
| Stack 4 (Express/AWS EC2) | 8/10 | 8/10 | 9/10 | 6/10 | 7.6/10 |
```

**Note**: Weights: Velocity 0.50, Performance 0.20, Security 0.15, Scalability 0.15

### Expected Final Recommendation

```markdown
**PRIMARY: TypeScript + Next.js + Supabase + Vercel**
Weighted Score: 9.4/10

Rationale: Your project must achieve 99.99% uptime during exam season while delivering MVP in 12 months. This stack excels at both:

- **Reliability**: Vercel's managed platform provides 99.99% uptime SLA (contractual guarantee). Auto-scaling handles peak 5K concurrent without manual intervention. Supabase (PostgreSQL) provides automated failover.
- **Velocity**: Next.js reduces boilerplate; TypeScript team productive immediately. No DevOps engineer needed (Vercel handles deployment, monitoring, scaling). Reduces 12-month risk significantly.
- **Performance**: Vercel's edge CDN (Cloudflare integrated) provides <100ms latency globally. Exam submission <2s easily achievable.

Team advantage: Node.js expertise = immediate productivity. Next.js familiar to Express developers (routing, middleware patterns similar).

Cost: $450K (team $350K, Vercel/Supabase $100K/year managed services). Fits budget.

Trade-off: Vendor lock-in (Vercel proprietary). Mitigation: Next.js is open-source; can migrate to self-hosted Node.js + Kubernetes if needed (1-2 month project).

Alternative 1: NestJS + AWS ECS (Score 7.9)
- Choose if: Vendor lock-in unacceptable; want control over infrastructure
- Risk: Requires DevOps expertise; delays MVP by 4-6 weeks (Kubernetes learning curve)

Risk Mitigation:
1. Load testing: Simulate 5K concurrent users at Month 6 → measure Vercel auto-scaling
2. Failover drills: Test database failover at Month 8 → verify <10-second recovery
3. Exam dry-run: Stage exam for 100 test users 1 week before first real exam
```

### Validation Criteria

✓ **Industry**: Correctly identified as EdTech (exam season, uptime criticality, student access)  
✓ **Priority Weights**: Velocity (50%) due to 12-month deadline; Reliability/Performance (20%/15%) due to uptime SLA  
✓ **Conflict detected**: "12-month timeline" vs. "99.99% uptime" flagged → managed PaaS solution proposed  
✓ **Recommendation**: Vercel + Next.js prioritized over self-managed AWS (respects timeline + reliability constraints)  
✓ **Uptime SLA**: 99.99% explicitly mentioned in recommendation  
✓ **Team leverage**: Node.js expertise highlighted as velocity advantage  

---

## Test Execution & Validation Summary

| Scenario | Industry | Top Priority | Expected Winner | Validation Passed |
|----------|----------|--------------|-----------------|-------------------|
| 1 | SaaS | Scalability | TS/Express or Go | ✓ If TypeScript ranks #1 or #2 |
| 2 | HealthCare | Security | Java/Spring or C#/ASP.NET | ✓ If Java/C# rank #1; security weight ≥0.4 |
| 3 | IoT | Performance | Go, C, or Rust | ✓ If Go/C/Rust rank #1; performance weight ≥0.5 |
| 4 | Enterprise | Velocity (Stability) | PHP/TS polyglot | ✓ If polyglot recommended; conflict flagged |
| 5 | EdTech | Velocity (Reliability) | Vercel/Next.js | ✓ If PaaS recommended; uptime SLA mentioned |

**Overall Validation Rule**: If recommendations differ by industry/priority axis, system is working correctly. If all scenarios recommend same stack → system has failed (indicates lack of differentiation).
