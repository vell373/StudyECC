# Tech Selection Harness: Orchestrator & Scoring Engine

**Version**: 1.0  
**Status**: Phase 1-2 Complete  
**Last Updated**: 2026-05-09

---

## Harness Architecture

### Overview
The harness orchestrates three agents (Requirement Analyzer, Technology Proposer, Cost Estimator) and produces a unified decision report with scoring matrix, tradeoff analysis, and final recommendation.

### Agent Pipeline

```
┌──────────────────────────┐
│ Requirement Document     │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────────────────────┐
│ 1. Requirement Analyzer Agent            │
│ - Industry detection                     │
│ - Priority weight calculation            │
│ - Constraint extraction                  │
│ - Conflict detection                     │
└───────────┬──────────────────────────────┘
            │ Output: priority_weights, constraints, conflicts
            │
            ▼
┌──────────────────────────────────────────┐
│ 2. Technology Proposal Agent             │
│ - Filter by constraints                  │
│ - Score candidates by priority fit       │
│ - Rank & select top 3-5                  │
│ - Generate justifications                │
└───────────┬──────────────────────────────┘
            │ Output: ranked candidates + rationale
            │
            ▼
┌──────────────────────────────────────────┐
│ 3. Cost Estimator Agent (Optional)       │
│ - Breakdown infrastructure costs         │
│ - Estimate development team costs        │
│ - Project Year 1/3/5 costs               │
└───────────┬──────────────────────────────┘
            │ Output: cost breakdown per candidate
            │
            ▼
┌──────────────────────────────────────────┐
│ 4. Harness: Unified Scoring & Ranking    │
│ - Build 2D matrix: axes × candidates     │
│ - Score 0-10 per cell (with justification)
│ - Compute weighted composite scores      │
│ - Identify tradeoffs                     │
│ - Generate final recommendation          │
│ - Produce Markdown report                │
└───────────┬──────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────┐
│ Final Recommendation Report (Markdown)   │
│ - Executive summary                      │
│ - Scoring matrix                         │
│ - Priority-weighted scores               │
│ - Tradeoff analysis                      │
│ - Final recommendation (+ rationale)     │
│ - Risk mitigation                        │
│ - Appendix: detailed scoring             │
└──────────────────────────────────────────┘
```

---

## Harness Responsibilities

### 1. Input Validation & Aggregation
- Receive outputs from all three agents
- Validate format + completeness
- Detect missing sections (flag but continue with defaults)
- Merge results into unified data structure

### 2. Unified Scoring Matrix Construction

#### Score Each Candidate on Each Axis (0-10)

For each candidate stack × requirement axis pair:

**Scalability Score**:
- 9-10: Designed for 100K+ concurrent; horizontal auto-scaling native
- 7-8: Handles 10K-100K with standard load balancing
- 5-6: Capable with engineering; limited horizontal scaling
- 3-4: Not recommended for scale; monolithic
- 0-2: Single-machine only

Apply to candidate stacks:
- TypeScript/Node.js → 8/10 (proven at scale, horizontal easy)
- Go → 9/10 (goroutines, minimal overhead)
- Rust → 9/10 (same as Go, even more efficient)
- Python → 7/10 (requires optimization, GIL, async improvements)
- Java → 8/10 (well-optimized, proven, but JVM overhead)
- PHP → 5/10 (can scale but labor-intensive)

**Security Score**:
- 9-10: Memory-safe language; crypto primitives first-class; audit logging native
- 7-8: Good defaults; active security updates; strong libraries
- 5-6: Capable but requires hardening
- 3-4: Known vulnerabilities; older frameworks
- 0-2: Unpatched systems

Apply to candidate stacks:
- Rust → 10/10 (memory-safe by design)
- Java → 9/10 (mature security ecosystem, Spring Security)
- C# → 9/10 (ASP.NET Core security-first)
- Python → 8/10 (PyCA, good libraries, but interpreter vulnerabilities)
- TypeScript/Node.js → 7/10 (Express security requires setup, but libraries available)
- Go → 8/10 (good crypto, but smaller ecosystem)
- PHP → 5/10 (legacy vulnerabilities, less active updates)

**Performance Score** (latency + throughput):
- 9-10: <50ms latency at scale; 100K+ QPS capability
- 7-8: <200ms latency; 10K-100K QPS
- 5-6: <500ms latency; 1K-10K QPS
- 3-4: Latency >1s; scaling limited
- 0-2: Not suitable for performance requirements

Apply to candidate stacks:
- Rust → 10/10 (compiled, minimal overhead)
- Go → 10/10 (compiled, excellent concurrency)
- Java → 8/10 (JVM warmup, but highly optimized)
- C# → 8/10 (JIT compiled, performant)
- TypeScript/Node.js → 8/10 (event-driven, V8 optimization)
- Python → 6/10 (interpreted, slower, but async help)
- PHP → 4/10 (not designed for performance)

**Velocity Score** (time-to-market, learning curve):
- 9-10: Team immediately productive; 1-2 week ramp-up
- 7-8: Good tooling, ecosystem; 3-4 week ramp-up
- 5-6: Adequate ecosystem; 6-8 week ramp-up
- 3-4: Steep learning curve; 10+ week ramp-up
- 0-2: Not suitable for velocity requirements

Apply to candidate stacks:
- TypeScript/Node.js → 9/10 (npm ecosystem, rapid prototyping)
- Python → 9/10 (readable, large ecosystem)
- PHP → 8/10 (cheap hosting, simple deployment)
- Java → 6/10 (verbose, but mature tooling)
- Go → 7/10 (simple syntax, but different paradigm)
- Rust → 4/10 (steep learning curve, borrow checker)
- C# → 7/10 (Visual Studio excellent, but ecosystem smaller than Java)

#### Build 2D Scoring Matrix

```markdown
| Candidate | Scalability | Security | Performance | Velocity | Raw Score | Weighted Score |
|-----------|-------------|----------|-------------|----------|-----------|-----------------|
| Stack A   | 8/10        | 7/10     | 8/10        | 9/10     | 32/40     | 8.2/10 |
| Stack B   | 9/10        | 9/10     | 7/10        | 5/10     | 30/40     | 7.6/10 |
| Stack C   | 7/10        | 8/10     | 9/10        | 6/10     | 30/40     | 7.3/10 |
```

Each score includes 1-2 sentence justification.

### 3. Weighted Composite Score Calculation

For each candidate, compute:
```
composite_score = 
  (scalability_score × scalability_weight) +
  (security_score × security_weight) +
  (performance_score × performance_weight) +
  (velocity_score × velocity_weight)

where weights sum to 1.0, derived from requirement analysis
```

**Example** (SaaS with scalability=0.4, security=0.2, performance=0.2, velocity=0.2):
```
TypeScript/Express:
  = (8 × 0.4) + (7 × 0.2) + (8 × 0.2) + (9 × 0.2)
  = 3.2 + 1.4 + 1.6 + 1.8
  = 8.0/10

Go/Gin:
  = (9 × 0.4) + (8 × 0.2) + (10 × 0.2) + (7 × 0.2)
  = 3.6 + 1.6 + 2.0 + 1.4
  = 8.6/10

Rust/Axum:
  = (9 × 0.4) + (10 × 0.2) + (10 × 0.2) + (4 × 0.2)
  = 3.6 + 2.0 + 2.0 + 0.8
  = 8.4/10
```

### 4. Tradeoff Analysis

For each of the top 3 candidates, identify 2-3 key tradeoffs:

**Tradeoff Identification Algorithm**:
1. Find candidate's lowest-scoring axis
2. Compare to highest-scoring candidate on that axis
3. Phrase as: "Stack X excels at [strength] but is weaker at [weakness], acceptable if [mitigation]"
4. For each weakness, suggest a mitigation strategy

**Example**:
```markdown
## Tradeoff Analysis

| Stack | Primary Strength | Key Weakness | Acceptable? | Mitigation |
|-------|------------------|--------------|-------------|-----------|
| TypeScript/Express | Velocity (9/10) | Learning curve, Node.js async paradigm | Yes if: | Team has JavaScript background, or 4 weeks onboarding acceptable |
| Go/Gin | Performance & Scalability (10/10) | Team hiring difficulty | Conditional | Pair Go expertise with TypeScript/Node.js team (polyglot approach) |
| Rust/Axum | Security & Performance (10/10) | Steep learning curve (10+ weeks) | Only if: | Team committed to Rust long-term, or 6-month onboarding acceptable |
```

### 5. Conflict Resolution Logic

**If requirements conflict** (e.g., "MVP in 2 weeks" + "HIPAA compliance" + "New language"):

1. **Identify conflict**: "Timeline (2 weeks) conflicts with HIPAA audit (20 weeks minimum) + Rust learning curve (10 weeks)"
2. **Apply priority rules**:
   - Hard constraints (compliance, budget) > soft preferences (language preference)
   - Timeline constraint > learning curve (if MVP deadline critical)
3. **Harness action**:
   - Override language preference: Recommend team's existing language
   - Recommend vendor-managed HIPAA infrastructure (compresses timeline)
   - Suggest phased approach: MVP without HIPAA, then add compliance in Phase 2
4. **Output**: Explicit statement in recommendation

**Example output**:
```markdown
## Conflict Resolution

**Identified Conflict**: "Must launch MVP in 2 weeks" + "Requires HIPAA compliance" + "Team wants to learn Rust"

**Decision**: 
- Overriding language preference; recommending TypeScript + Express (team's existing skill)
- Recommending managed HIPAA solution (AWS HealthLake, not custom Rust)
- Rust adoption deferred to Phase 2 (post-MVP)

**Rationale**: 2-week timeline cannot accommodate Rust learning curve (10 weeks) + HIPAA compliance engineering (8+ weeks). TypeScript + managed HIPAA service compresses to 2 weeks.
```

### 6. Final Recommendation Logic

**Selection Algorithm**:
1. Rank candidates by weighted composite score (descending)
2. **Primary recommendation**: Highest scorer
3. **Alternative 1**: 2nd highest (if primary has significant tradeoffs)
4. **Alternative 2**: 3rd highest (contrasting approach)

**Recommendation Statement**:
```markdown
## Final Recommendation

**PRIMARY: [Stack Name]**

**Rationale**: Your project prioritizes [top 2-3 axes] (weights: X%, Y%). This stack scores [score]/10 overall, with:
- [Axis 1]: [score]/10 (highest among candidates)
- [Axis 2]: [score]/10 (competitive)
- [Axis 3]: [score]/10 (acceptable)
- [Axis 4]: [score]/10 (weakness acknowledged)

**Tradeoff**: [Weakness is acceptable because mitigation X is available]

**Alternative 1: [Stack Name]**
- Why: [Different priority axis optimization]
- When to choose: [If primary tradeoff is unacceptable]

**Alternative 2: [Stack Name]**
- Why: [Contrasting approach]
- When to choose: [If budget/timeline constraints change]

**Risk Mitigation for Selected Stack**:
1. [Specific risk] → [Mitigation]
2. [Specific risk] → [Mitigation]
```

---

## Scoring Rubric (Detailed)

### Scalability Dimension (0-10)

| Score | Concurrent Users | Data Volume | Architecture | Technologies | Examples |
|-------|------------------|-------------|--------------|---------------|----------|
| 9-10 | 100K+ natively | 1TB+ | Horizontal, distributed | Microservices, k8s, Go, Rust | Amazon, Google |
| 7-8 | 10K-100K | 100GB-1TB | Horizontal + optimization | Load balancers, Node.js, Python async | Stripe, Vercel |
| 5-6 | 1K-10K | 10GB-100GB | Monolithic + scaling effort | Standard frameworks, Java | Medium-scale SaaS |
| 3-4 | 100-1K | 1GB-10GB | Limited scaling | Single-machine, basic cluster | Small internal tools |
| 0-2 | <100 | <1GB | Single-machine | Embedded systems, legacy | Mobile clients |

### Security Dimension (0-10)

| Score | Memory Safety | Crypto | Audit Logging | Ecosystem | Examples |
|-------|-----------------|--------|----------------|-----------|----------|
| 9-10 | Guaranteed (Rust) | First-class | Native | Mature | Rust, Java, C# |
| 7-8 | Good defaults | Strong libs | Available | Active | Python, Go, TypeScript |
| 5-6 | Requires care | Adequate | Possible | Moderate | Ruby, PHP 8+ |
| 3-4 | Vulnerabilities | Weak | Difficult | Declining | Python 2, older Node |
| 0-2 | Unsafe | None | No support | Abandoned | Legacy systems |

### Performance Dimension (0-10)

| Score | Latency Target | QPS | Throughput | Execution | Examples |
|-------|-----------------|-----|-----------|-----------|----------|
| 9-10 | <50ms | 100K+ | High | Compiled, JIT | Rust, Go, Java |
| 7-8 | <200ms | 10K-100K | Medium-high | Interpreted + optimization | Python async, Node.js |
| 5-6 | <500ms | 1K-10K | Medium | Standard interpreted | Ruby, PHP |
| 3-4 | <2s | 100-1K | Low | Slow interpreted | Python sync, legacy |
| 0-2 | >2s | <100 | Very low | Unsuitable | Not for perf-critical |

### Velocity Dimension (0-10)

| Score | Learning Curve | Ecosystem | Tooling | Time to MVP | Examples |
|-------|-----------------|-----------|---------|-------------|----------|
| 9-10 | <2 weeks | Massive | Excellent | 4-8 weeks | Node.js, Python, PHP |
| 7-8 | 3-4 weeks | Large | Good | 8-12 weeks | Java, C#, Go |
| 5-6 | 6-8 weeks | Moderate | Adequate | 12-16 weeks | Ruby, Elixir |
| 3-4 | 10-12 weeks | Small | Basic | 20+ weeks | Rust, Haskell |
| 0-2 | >16 weeks | Tiny | Poor | 30+ weeks | Niche languages |

---

## Output Format: Markdown Report Template

```markdown
# Tech Selection Report: [Project Name]

**Analysis Date**: [ISO8601]  
**Industry**: [SaaS|HealthCare|IoT|Enterprise]  
**Team Size**: [N engineers]

---

## Executive Summary

[1-2 sentences summarizing the recommendation and why it's optimal for this project]

**Recommended Stack**: [Language + Framework + Database + Infrastructure]

---

## 1. Requirements Analysis

### Inferred Industry
**[Industry]** — Detected from: [keywords used]

### Priority Weights
- Scalability: [0.X] (Importance: [rationale])
- Security: [0.X] (Importance: [rationale])
- Performance: [0.X] (Importance: [rationale])
- Development Velocity: [0.X] (Importance: [rationale])

### Critical Constraints
- Timeline: [X weeks to MVP]
- Team Size: [N engineers]
- Budget Cap: [$X or "Not specified"]
- Existing Stack: [Technologies in place]
- Compliance Requirements: [HIPAA/GDPR/PCI or None]

### Identified Conflicts
[If any, list and describe resolution]

---

## 2. Candidate Technology Stacks

### Stack Overview

| # | Language | Framework | Database | Infrastructure | Industry Fit |
|---|----------|-----------|----------|-----------------|--------------|
| 1 | [Lang] | [FW] | [DB] | [Infra] | [SaaS/HC/IoT/Enterprise] |
| 2 | [Lang] | [FW] | [DB] | [Infra] | [SaaS/HC/IoT/Enterprise] |
| 3 | [Lang] | [FW] | [DB] | [Infra] | [SaaS/HC/IoT/Enterprise] |

---

## 3. Detailed Scoring Matrix

### Quantitative Scores (0-10 per cell)

| Candidate | Scalability | Security | Performance | Velocity | Raw Score |
|-----------|-------------|----------|-------------|----------|-----------|
| **Stack 1** | 9/10 | 7/10 | 8/10 | 9/10 | 33/40 |
| **Stack 2** | 8/10 | 9/10 | 7/10 | 6/10 | 30/40 |
| **Stack 3** | 7/10 | 8/10 | 9/10 | 7/10 | 31/40 |

### Scoring Justifications

#### Stack 1: [Language + Framework + Database + Infrastructure]

**Scalability (9/10)**: 
- Rationale: [Language/framework designed for horizontal scaling, proven at 100K+ users]
- Evidence: [Framework examples, benchmark data]

**Security (7/10)**:
- Rationale: [Good defaults, but requires configuration for compliance]
- Evidence: [Security features, known vulnerabilities, community track record]

**Performance (8/10)**:
- Rationale: [Compiled/optimized, sub-200ms latency achievable]
- Evidence: [Benchmark results, typical QPS capacity]

**Velocity (9/10)**:
- Rationale: [Mature ecosystem, extensive tutorials, fast prototyping]
- Evidence: [npm downloads, Stack Overflow activity, hiring pool size]

---

## 4. Priority-Weighted Composite Scores

**Weights Applied**: Scalability (0.4) + Security (0.2) + Performance (0.2) + Velocity (0.2)

| Candidate | Weighted Score | Rank |
|-----------|-----------------|------|
| **Stack 1** | 8.4/10 | 1 |
| **Stack 2** | 7.6/10 | 2 |
| **Stack 3** | 7.9/10 | 3 |

---

## 5. Tradeoff Analysis

### Stack 1: [Name]
| Aspect | Assessment |
|--------|------------|
| **Strengths** | Scalability (9/10), Velocity (9/10) — best for MVP growth |
| **Weaknesses** | Learning curve for async patterns (4 weeks for Python teams) |
| **Acceptable?** | **Yes**, if: Team has JavaScript background OR can dedicate 4 weeks to onboarding |
| **Risk Mitigation** | Pair with senior TypeScript mentor (outsource first 2 months) |

### Stack 2: [Name]
| Aspect | Assessment |
|--------|------------|
| **Strengths** | Security (9/10), Performance (7/10) — good for regulated industries |
| **Weaknesses** | Velocity (6/10) — slower time-to-market (3-4 weeks longer than Stack 1) |
| **Acceptable?** | **Conditional**, only if: Security requirement overrides timeline pressure |
| **Risk Mitigation** | Use vendor-managed services to compress development timeline |

### Stack 3: [Name]
| Aspect | Assessment |
|--------|------------|
| **Strengths** | Performance (9/10), Security (8/10) — excellent for real-time, high-security needs |
| **Weaknesses** | Learning curve (10+ weeks for new team) |
| **Acceptable?** | **No** for MVP, only if: Budget allows 3-4 month ramp-up OR hire experienced engineers |

---

## 6. Cost Analysis (Phase 2)

### Year 1, Year 3, Year 5 Projections

| Stack | Year 1 | Year 3 | Year 5 | Scaling Pattern | Risk |
|-------|--------|--------|--------|-----------------|------|
| **Stack 1** | $255K | $490K | $780K | Linear | Vendor lock-in (AWS) |
| **Stack 2** | $210K | $432K | $688K | Sublinear | Good economy of scale |
| **Stack 3** | $197K | $398K | $615K | Best efficiency | Hiring difficulty, salary premium |

### Detailed Breakdown: Stack 1 (Year 1)

| Category | Cost | Notes |
|----------|------|-------|
| Infrastructure (compute, DB, storage) | $30K | AWS EC2 + RDS + basic monitoring |
| Development Team (2.5 FTE, 12 weeks MVP) | $200K | $80K/year salary + benefits estimate |
| Operations & DevOps | $10K | Minimal for MVP (self-managed CI/CD) |
| Third-party Services | $5K | Error tracking (Sentry), monitoring (DataDog basic) |
| Contingency (10%) | $10K | Buffer for unexpected costs |
| **Total Year 1** | **$255K** | Cost per user: $25.50 @ 10K users |

---

## 7. Final Recommendation

### PRIMARY: [Stack Name]

**Composite Score**: 8.4/10 (Highest weighted score)

**Why This Stack?**

Your project's top priorities are **[Axis 1] (weight 0.X)** and **[Axis 2] (weight 0.X)**.

This stack excels at both:
- **[Axis 1]**: 9/10 — [specific reason, e.g., "horizontal auto-scaling via k8s"]
- **[Axis 2]**: 9/10 — [specific reason, e.g., "npm ecosystem maturity"]

While weaker at [Axis 3] (7/10), this is **acceptable because** [mitigation rationale]:
- [Mitigation 1]
- [Mitigation 2]

**Cost Analysis**: Year 1 estimated $255K (infrastructure $30K, team $200K). Scales sub-linearly after Year 3 as infrastructure optimization kicks in.

**Timeline**: MVP achievable in 12 weeks with 2-3 engineers (includes 3-4 week JavaScript onboarding for non-JS teams).

**Team Readiness**: [High|Medium|Low] — [Reason, e.g., "Team has TypeScript expertise" or "Requires 4-week Python→JavaScript transition"]

### Tradeoff Assessment
**Key Tradeoff**: Velocity (9/10) comes at the cost of [specific weakness]. **Mitigation**: [mitigation strategy].

**Go/No-Go**: Recommend proceeding if [team accepts tradeoff]. If [tradeoff is unacceptable], consider Alternative 1.

---

### ALTERNATIVE 1: [Stack Name]

**Composite Score**: 7.6/10

**Why Consider This**: Prioritizes [different axis], scoring 9/10 vs. Primary's 7/10.

**When to Choose**: If [constraint change], switch to this stack. Example: "If HIPAA compliance discovered mid-project, migrate to Alternative 1 (on-premise Java stack)."

**Trade-off**: Slower time-to-market (8 weeks vs. 6 weeks), higher Y1 infrastructure cost (+$25K).

---

### ALTERNATIVE 2: [Stack Name]

**Composite Score**: 7.3/10

**Why Consider This**: Offers [contrasting capability], useful if Primary approach fails.

**Fallback Use Case**: "If Go team hiring impossible, use TypeScript + Express as polyglot fallback (cost +$50K/year for contractor expertise)."

---

## 8. Risk Mitigation Plan

| Risk | Impact | Mitigation | Owner |
|------|--------|-----------|-------|
| Team lacks JavaScript experience | High | Hire 1 senior TS engineer + 2-week bootcamp | Tech Lead |
| Scaling issues at 100K users | Medium | Load test at 50K; implement caching before scale | DevOps |
| Security audit failure (if regulated) | High | Add 3rd-party security audit ($50K); use managed HIPAA DB | Security |
| AWS cost overrun (pricing change) | Low | Reserved instances (30% discount); implement cost monitoring | Finance |

---

## 9. 30-Day Action Plan

1. **Week 1**: Establish development environment (Node.js, TypeScript, PostgreSQL, AWS CLI)
2. **Week 2-3**: Core API + database schema (user authentication, core entities)
3. **Week 4**: Integration testing + security review (OWASP Top 10 checklist)
4. **Week 5-6**: MVP feature completion + performance testing (target <200ms latency)
5. **Week 7-8**: Deployment to staging + user acceptance testing

---

## 10. Appendix: Detailed Scoring Rubric

### Why [Stack] scores 8/10 on Scalability

**Criteria**:
- Horizontal scaling architecture: ✓ (stateless API + load balancer)
- Concurrency model: ✓ (event-driven, can handle 10K+ concurrent)
- Data layer scaling: ✓ (PostgreSQL proven to 1TB+ at scale)
- Framework maturity: ✓ (Express used by thousands of production companies)
- Not ✓: Auto-sharding (requires application-level implementation, not built-in)

**Conclusion**: 8/10 because all critical factors present; only minor gaps in database auto-sharding.

[Repeat for all scores...]

---

## 11. How to Use This Report

1. **Executive Review**: Read Executive Summary + Final Recommendation + Risk Mitigation Plan
2. **Technical Review**: Study Scoring Matrix + Tradeoff Analysis + Detailed Justifications
3. **Budget Planning**: Review Cost Analysis section; validate Year 1 budget
4. **Execution**: Follow 30-Day Action Plan; revisit this report at Phase 1 milestones

---

**Report Generated**: [Timestamp]  
**Valid Until**: [90 days]  
**Next Review**: [Date for technology landscape update]
```

---

## Harness Implementation Notes

### Error Handling Strategy

1. **Missing Agent Output**: If one agent fails, harness continues with defaults
   - Missing requirement analysis → Apply balanced weights (0.25/0.25/0.25/0.25)
   - Missing cost estimates → Show "TBD" in cost section, proceed with scoring
   - Missing technology proposals → Use hardcoded default 5 stacks

2. **Format Validation**: Check output matches expected schema
   - If mismatch detected, apply lossy conversion (best-effort parsing)
   - Flag in report: "Agent output format unexpected; results may be incomplete"

3. **Timeout Handling**: If agent takes >60s, use cached results (if available) or fallback

### Conflict Resolution Priority

```
Hard constraints (apply immediately):
  1. Budget cap (absolute floor)
  2. Compliance requirement (HIPAA, etc.)
  3. Timeline constraint (MVP deadline)

Soft preferences (override if conflict):
  4. Language preference ("we prefer Python")
  5. Team expertise ("mostly Java developers")
  6. Trend/shiny appeal ("everyone uses Rust")
```

### Scoring Cache & Consistency

- Lock scoring matrix once generated (no mid-report changes)
- If new information arrives, generate new report (don't patch existing)
- Version control: report timestamp + analysis ID for traceability
- Reproducibility: same input → same output (deterministic, no randomness)
