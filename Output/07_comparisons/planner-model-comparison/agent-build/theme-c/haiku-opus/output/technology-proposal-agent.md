# Technology Proposal Agent

**Version**: 1.0  
**Status**: Phase 1 - Must-Have  
**Last Updated**: 2026-05-09

---

## Agent Definition

### Core Identity
- **Agent ID**: `technology-proposer-v1`
- **Agent Name**: TechnologyProposalAgent
- **Role**: Recommend technology stacks optimized for project priorities
- **Responsibility**: Priority weights + constraints → 3-5 ranked stack candidates

### Input Schema

```json
{
  "analysis_id": "string",
  "project_name": "string",
  "inferred_industry": "SaaS|HealthCare|IoT|Enterprise|EdTech",
  "priority_weights": {
    "scalability": 0.0-1.0,
    "security": 0.0-1.0,
    "performance": 0.0-1.0,
    "velocity": 0.0-1.0
  },
  "constraints": {
    "budget_cap": "string or null",
    "team_size": "int",
    "timeline_weeks": "int",
    "existing_stack": ["string"],
    "forbidden_techs": ["string"]
  }
}
```

---

## Technology Knowledge Base

### Curated Stack Registry (30+ combinations)

Each technology stack is represented as:
```yaml
Stack ID: "[Language]-[Framework]-[Database]-[Infrastructure]"
Tags: [category1, category2, ...]
Maturity: "stable|rising|experimental"
Learning Curve: "weeks"
Ecosystem Size: 1-5
Strengths: 
  - axis: score (0-10)
Weaknesses:
  - axis: score (0-10)
Cost Range: "low|medium|high"
```

### Tier 1: Proven Cloud-Native Stacks (Recommended for SaaS)

| ID | Language | Framework | Database | Infrastructure | Maturity | Scalability | Security | Performance | Velocity |
|----|----------|-----------|----------|-----------------|----------|-------------|----------|-------------|----------|
| TS-EXPRESS-PG-AWS | TypeScript | Express.js | PostgreSQL | AWS (EC2+RDS) | Stable (8y) | 8 | 7 | 8 | 9 |
| PY-FASTAPI-PG-GCP | Python | FastAPI | PostgreSQL | GCP (Cloud Run) | Stable (3y) | 8 | 8 | 8 | 8 |
| GO-GIN-PG-K8S | Go | Gin | PostgreSQL | Kubernetes | Stable (13y) | 9 | 8 | 9 | 7 |
| RUST-AXUM-PG-K8S | Rust | Axum | PostgreSQL | Kubernetes | Rising (5y) | 10 | 10 | 10 | 4 |
| JAVA-SPRING-PG-AWS | Java | Spring Boot | PostgreSQL | AWS | Stable (15y) | 8 | 9 | 7 | 6 |

### Tier 2: Developer-Friendly Stacks (High Velocity)

| ID | Language | Framework | Database | Infrastructure | Velocity | Scalability |
|----|----------|-----------|----------|-----------------|----------|-------------|
| JS-NEXTJS-SUPABASE-VERCEL | JavaScript | Next.js | PostgreSQL | Vercel/Supabase | 10 | 8 |
| PY-DJANGO-PG-HEROKU | Python | Django | PostgreSQL | Heroku | 8 | 6 |
| TS-NESTJS-MONGO-AWS | TypeScript | NestJS | MongoDB | AWS | 7 | 8 |
| PHP-LARAVEL-MYSQL-SHARED | PHP | Laravel | MySQL | Shared hosting | 8 | 5 |

### Tier 3: Performance-First Stacks (IoT, Real-time)

| ID | Language | Framework | Database | Infrastructure | Performance | Scalability |
|----|----------|-----------|----------|-----------------|-------------|-------------|
| GO-FIBER-REDIS-EDGE | Go | Fiber | Redis | Edge (Cloudflare) | 10 | 9 |
| RUST-ACTIX-SQLITE-EMBEDDED | Rust | Actix-web | SQLite | Embedded | 10 | 7 |
| C-CUSTOM-LEVELDB-BARE | C | Custom | LevelDB | Bare metal | 10 | 8 |

### Tier 4: Security-First Stacks (HealthCare, Compliance)

| ID | Language | Framework | Database | Infrastructure | Security | Compliance |
|----|----------|-----------|----------|-----------------|----------|-----------|
| JAVA-SPRING-ORACLE-PREMISE | Java | Spring Boot | Oracle | On-Premise | 9 | High |
| PY-DJANGO-PG-PRIVATE | Python | Django | PostgreSQL | Private Cloud | 9 | High |
| CSHARP-ASPNET-SQLSERVER-AZURE | C# | ASP.NET | SQL Server | Azure Sovereign | 9 | High |

### Tier 5: Enterprise Stacks (Legacy Integration)

| ID | Language | Framework | Database | Infrastructure | Stability | Ecosystem |
|----|----------|-----------|----------|-----------------|-----------|-----------|
| JAVA-JBOSS-ORACLE-PREMISE | Java | JBoss EAP | Oracle | On-Premise | 10 | 5 |
| DOTNET-ASPNET-SQLSERVER-HYBRID | .NET | ASP.NET | SQL Server | Hybrid | 10 | 4 |

---

## Candidate Selection Algorithm

### Step 1: Filter by Constraints
- Remove stacks containing forbidden technologies
- Remove stacks exceeding budget cap (if known)
- Remove stacks with learning curve > timeline constraint
- Prioritize stacks matching existing team expertise

### Step 2: Score by Priority Weights
For each remaining stack, compute priority-aligned score:
```
candidate_fit = Σ(weight_i × strength_score_i)

where:
  weight_i = from requirement analysis
  strength_score_i = stack's score on axis i (0-10)
```

### Step 3: Rank & Select
- Rank candidates by fit score (descending)
- Select top 3-5 candidates
- Ensure diversity: include 1-2 "safe defaults" + 1-2 "cutting-edge"
- Balance recommendations across maturity levels

### Step 4: Justify Each Candidate
For each selected candidate, generate 2-3 sentence justification:
- Which priorities does it optimize?
- Why is it appropriate for this industry/constraints?
- What's the key trade-off compared to alternatives?

---

## Output Schema

```yaml
proposal_id: "UUID"
analysis_id: "UUID"  # Reference to requirement analysis
project_name: "string"
generated_at: "ISO8601"

candidates:
  - rank: 1
    stack_id: "string"
    language: "string"
    framework: "string"
    database: "string"
    infrastructure: "string"
    
    # Alignment with priorities
    priority_fit_score: 0.0-10.0
    rationale: "string (2-3 sentences)"
    
    # Pros & cons
    optimizes_for:
      - "Scalability: handles 10M+ users with horizontal auto-scaling"
      - "Velocity: npm ecosystem + TypeScript tooling mature"
    
    trade_offs:
      - "Learning curve: 4 weeks for JavaScript newcomers"
      - "Cost: AWS infrastructure scales linearly with traffic"
    
    fit_breakdown:
      scalability_fit: 8/10
      security_fit: 7/10
      performance_fit: 8/10
      velocity_fit: 9/10
    
    # Team compatibility
    team_readiness: "low|medium|high"
    team_readiness_reason: "string"
    
    # Industry suitability
    industry_recommendation: "recommended|suitable|acceptable|alternative"
    
    # Cost estimate (preliminary)
    estimated_cost_year1: "string"
    estimated_dev_weeks: "int"

  # [repeat for candidates 2-5]
```

---

## Decision Rules by Industry

### SaaS (Scalability → Velocity > Security > Performance)
- **Weight priorities**: Scalability 0.4+, Velocity 0.3+
- **Prefer**: Cloud-native, auto-scaling, rapid iteration
- **Safe defaults**: TypeScript/Express or Python/FastAPI
- **Cutting edge**: Go/Gin or Rust/Axum (if team willing)
- **Key trade-off**: On-premise (better control) vs. Cloud (faster scaling)

### HealthCare (Security > Compliance > Reliability > Scalability)
- **Weight priorities**: Security 0.35+, Velocity ≤0.15
- **Prefer**: On-premise, strong audit logging, compliance-first
- **Safe defaults**: Java/Spring or Python/Django
- **Avoid**: Trendy/experimental languages (hiring risk)
- **Key trade-off**: Faster onboarding (use team's known language) vs. best security posture

### IoT/Embedded (Performance > Reliability > Scalability > Velocity)
- **Weight priorities**: Performance 0.35+, Velocity ≤0.15
- **Prefer**: Systems languages (Go, Rust, C), minimal overhead
- **Safe defaults**: Go for IoT backends, C for firmware
- **Cutting edge**: Rust for memory-critical edge applications
- **Key trade-off**: Compiled languages (slower dev) vs. interpreted (slower execution)

### Enterprise (Stability > Interoperability > Support > Innovation)
- **Weight priorities**: Scalability/Security 0.3 each, Velocity 0.1
- **Prefer**: Vendor-supported, long-term stability, ecosystem maturity
- **Safe defaults**: Java/Spring or C#/ASP.NET
- **Avoid**: Experimental or rapidly-evolving frameworks
- **Key trade-off**: Innovation speed vs. stability/support

### EdTech (Reliability > Velocity > Scalability > Security)
- **Weight priorities**: Reliability 0.35, Velocity 0.3
- **Prefer**: Robust uptime, fast iteration for feature launches
- **Safe defaults**: TypeScript/Express or Python/FastAPI
- **Consider**: CDN/edge caching for global access, multi-region failover
- **Key trade-off**: Complexity (HA infrastructure) vs. simplicity (single-region)

---

## Implementation Notes

### Why No ML Ranking?
Deterministic keyword/weight-based selection:
- Fully explainable: "This stack ranked #1 because it scores 8/10 on scalability (your top priority, weight 0.4)"
- Auditable: Show exact scoring for each axis
- Maintainable: Update thresholds without retraining

### Tie-Breaking
If multiple stacks have similar fit scores:
1. Prefer stack with **highest velocity score** (faster onboarding)
2. If still tied: Prefer **most stable** (longer ecosystem history)
3. If still tied: Prefer **larger ecosystem** (more hiring pool)

### Learning Curve Constraint
```python
if timeline_weeks < 4 and learning_curve_weeks > 2:
  penalize_candidate()  # Prioritize known technologies
```

### Assumption Validation
Before proposing, check:
- Is suggested language in team's existing stack? (Bonus points)
- Is framework actively maintained? (No deprecated choices)
- Are ecosystem resources available? (GitHub stars >5K, active maintenance)

---

## Example Outputs

### Example 1: SaaS Startup
```yaml
candidates:
  - rank: 1
    stack_id: "TS-EXPRESS-PG-AWS"
    language: "TypeScript"
    framework: "Express.js"
    database: "PostgreSQL"
    priority_fit_score: 8.7/10
    rationale: "Optimizes scalability (8/10) and velocity (9/10) — critical for your 3-month MVP with 10M-user growth. AWS EC2+RDS provides proven horizontal scaling."
    optimizes_for:
      - "Velocity: npm ecosystem mature, extensive tutorials, TypeScript reduces bugs"
      - "Scalability: horizontal load balancing well-understood, stateless architecture"
    trade_offs:
      - "Learning curve: requires JavaScript async/await mastery (3-4 weeks for Python teams)"

  - rank: 2
    stack_id: "GO-GIN-PG-K8S"
    priority_fit_score: 8.5/10
    rationale: "Higher performance (9/10) than TypeScript, comparable scalability. Trade-off: Go less familiar (6-week onboarding vs. 3-4 weeks for TypeScript)."
```

### Example 2: HealthCare Provider
```yaml
candidates:
  - rank: 1
    stack_id: "JAVA-SPRING-ORACLE-PREMISE"
    priority_fit_score: 8.9/10
    rationale: "Meets HIPAA compliance (9/10 security) and on-premise requirement. Java ecosystem mature for healthcare (extensive compliance tooling)."
    industry_recommendation: "recommended"
    team_readiness: "high"  # Existing Java team

  - rank: 2
    stack_id: "PY-DJANGO-PG-PRIVATE"
    priority_fit_score: 8.2/10
    rationale: "Faster velocity (8/10 vs 6/10 for Java) if team knows Python. Private cloud acceptable alternative to on-premise."
```

---

## Agent Limitations & Future Extensions

**Current Scope** (Phase 1):
- Static knowledge base (~30 stacks)
- Deterministic ranking (no ML)
- No ecosystem-wide metrics (GitHub stars, job market)

**Phase 2 Extensions**:
- Cost Estimator Agent (infrastructure, team, operations costs)
- Market Maturity Scorer (GitHub activity, npm downloads, hiring difficulty)
- Learning curve from first-principles (syntax complexity, paradigm shift)

**Phase 3 (Optional)**:
- Real-time ecosystem health metrics
- Team skills auto-detection from GitHub/CV
- Automatic stack variant generation (e.g., "what if we use MongoDB instead?")
