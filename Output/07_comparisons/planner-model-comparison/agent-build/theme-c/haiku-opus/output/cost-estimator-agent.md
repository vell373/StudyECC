# Cost Estimator Agent

**Version**: 1.0  
**Status**: Phase 2 - Should-Have  
**Last Updated**: 2026-05-09

---

## Agent Definition

### Core Identity
- **Agent ID**: `cost-estimator-v1`
- **Agent Name**: CostEstimatorAgent
- **Role**: Estimate infrastructure, development, and operational costs for technology stacks
- **Responsibility**: Technology candidates + constraints → cost breakdown (Year 1, Year 3, Year 5)

### Input Schema

```json
{
  "proposal_id": "UUID",
  "analysis_id": "UUID",
  "candidates": [
    {
      "stack_id": "string",
      "language": "string",
      "framework": "string",
      "database": "string",
      "infrastructure": "string"
    }
  ],
  "project_constraints": {
    "budget_cap": "string or null",
    "team_size": "int",
    "timeline_weeks": "int",
    "inferred_industry": "string",
    "expected_scale_year1": "int",  # users or requests/day
    "expected_scale_year3": "int",
    "expected_scale_year5": "int"
  }
}
```

---

## Cost Estimation Framework

### Cost Categories

#### 1. Infrastructure Costs
Breakdown per technology + scale:

**Compute (per year)**:
- Serverless (AWS Lambda, GCP Cloud Functions): $10-50K/year (scales with invocations)
- Containerized (ECS, GKE): $20-100K/year (scales with container count)
- EC2/Compute instances: $30-200K/year (scales with instance count + reserved instances)
- On-premise: $100K-1M+/year (includes hardware, power, colocation)

**Database (per year)**:
- Managed (RDS, Cloud SQL, Firestore): $5-50K/year (per GB, IOPS)
- Self-hosted: $2-30K/year (storage) + ops overhead
- NoSQL (MongoDB, DynamoDB): $10-100K/year (pay-per-document)
- Data warehouse (BigQuery, Redshift): $5K-500K+/year (query cost, storage)

**Storage & Egress (per year)**:
- Blob storage: $0.5-5K/year (typical SaaS)
- CDN & egress: $5-50K/year (bandwidth-dependent)
- Backup & DR: $2-10K/year (compliance-dependent)

**Networking (per year)**:
- Load balancers: $2-10K/year
- VPN/Direct Connect: $1-5K/year (enterprise)
- DNS/DDoS: $1-5K/year

**Monitoring & Logging (per year)**:
- APM (DataDog, New Relic): $5-30K/year
- Logging (CloudWatch, Stackdriver): $1-10K/year
- Security scanning: $2-20K/year

#### 2. Development Costs (Year 1)
Estimated team hours to MVP + ongoing:

**MVP Build (one-time)**:
- Framework familiarity: 0-4 weeks overhead
- API design + DB schema: 2-4 weeks
- Core feature build: 8-12 weeks
- Testing + QA: 2-4 weeks
- **Total MVP**: 12-24 weeks for 2-3 FTE

**Staffing Model**:
- Full-time engineers (FTE): $80K-150K salary/benefits
- Contractors: $100-200/hour
- Hiring lag: 4-8 weeks to productive

#### 3. Operational Costs (Year 1+)
Ongoing team + infrastructure management:

**Personnel**:
- DevOps/SRE: 0.5-1 FTE per 10 engineers
- Security: 0.5-1 FTE (compliance-heavy) to 0 FTE (cloud-managed)
- QA/Testing: 0.25-0.5 FTE

**Third-party Services**:
- CI/CD (GitHub Actions, GitLab CI): $0-10K/year
- Error tracking (Sentry, Rollbar): $2-10K/year
- Incident management (PagerDuty): $2-10K/year
- SSL certificates: $200-5K/year

---

## Cost Estimation Tables

### Cost Model by Stack Type

#### TypeScript + Express + PostgreSQL + AWS
```
Year 1 (MVP, 10K users):
  Compute: $20K (2 EC2 t3.medium instances)
  Database: $5K (RDS PostgreSQL, 100GB)
  Storage/CDN: $2K
  Dev team: $200K (2.5 FTE)
  Ops overhead: $10K
  Total: ~$237K

Year 3 (100K users, established):
  Compute: $50K (auto-scaling, 4-8 instances)
  Database: $15K (RDS PostgreSQL, 500GB, read replicas)
  Storage/CDN: $10K
  Dev team: $400K (4 FTE)
  Ops: $15K
  Total: ~$490K

Year 5 (1M users, mature):
  Compute: $100K (8-16 instances + load balancers)
  Database: $30K (RDS PostgreSQL, 2TB)
  Storage/CDN: $30K
  Dev team: $600K (6 FTE)
  Ops: $20K
  Total: ~$780K

Scaling factor: Linear (good economy of scale)
Risk: Moderate (proven ecosystem, vendor lock-in to AWS)
```

#### Python + FastAPI + PostgreSQL + GCP
```
Year 1 (MVP, 10K users):
  Compute: $15K (Cloud Run + auto-scaling)
  Database: $5K (Cloud SQL PostgreSQL)
  Storage: $2K
  Dev team: $180K (2 FTE, Python specialists)
  Ops overhead: $8K
  Total: ~$210K

Year 3 (100K users):
  Compute: $40K (sustained Cloud Run load)
  Database: $12K (Cloud SQL, 400GB)
  Storage: $8K
  Dev team: $360K (3.5 FTE)
  Ops: $12K
  Total: ~$432K

Year 5 (1M users):
  Compute: $80K (GKE cluster for cost efficiency)
  Database: $25K (2TB PostgreSQL)
  Storage: $25K
  Dev team: $540K (5 FTE)
  Ops: $18K
  Total: ~$688K

Scaling factor: Sublinear (good economy of scale, reduced per-user cost)
Risk: Low (vendor lock-in to GCP, but mature services)
```

#### Go + Gin + PostgreSQL + Kubernetes
```
Year 1 (MVP, 10K users):
  Compute: $25K (EKS cluster, minimal nodes)
  Database: $5K (RDS PostgreSQL)
  Storage: $2K
  Dev team: $150K (2 FTE, Go learning curve)
  Ops overhead: $15K (Kubernetes management)
  Total: ~$197K

Year 3 (100K users):
  Compute: $35K (optimized EKS cluster, fewer pods needed)
  Database: $15K (RDS PostgreSQL, 600GB)
  Storage: $8K
  Dev team: $320K (3.2 FTE, now productive)
  Ops: $20K (Kubernetes complexity)
  Total: ~$398K

Year 5 (1M users):
  Compute: $60K (EKS with spot instances)
  Database: $30K (2TB PostgreSQL)
  Storage: $20K
  Dev team: $480K (4.8 FTE)
  Ops: $25K (advanced K8s management)
  Total: ~$615K

Scaling factor: Best-in-class (Go's efficiency)
Risk: Medium-high (Kubernetes complexity, hiring niche)
```

#### Rust + Axum + PostgreSQL + Kubernetes
```
Year 1 (MVP, 10K users):
  Compute: $20K (minimal, highly efficient)
  Database: $5K (RDS PostgreSQL)
  Storage: $2K
  Dev team: $200K (2 FTE, steep learning curve)
  Ops: $10K
  Total: ~$237K

Year 3 (100K users):
  Compute: $25K (stays minimal, excellent efficiency)
  Database: $15K (RDS PostgreSQL, 600GB)
  Storage: $8K
  Dev team: $400K (3.2 FTE, high salary for Rust expertise)
  Ops: $15K
  Total: ~$463K

Year 5 (1M users):
  Compute: $40K (still efficient)
  Database: $30K (2TB PostgreSQL)
  Storage: $20K
  Dev team: $600K (4 FTE, competitive salaries)
  Ops: $20K
  Total: ~$710K

Scaling factor: Best compute efficiency, but high developer cost
Risk: Medium (hiring risk, fewer engineers in market; long-term ROI positive for scale)
```

#### Java + Spring Boot + PostgreSQL + AWS
```
Year 1 (MVP, 10K users):
  Compute: $30K (JVM memory-hungry, 3 EC2 instances)
  Database: $5K (RDS PostgreSQL)
  Storage: $2K
  Dev team: $180K (2 FTE, Java ecosystem mature)
  Ops: $12K
  Total: ~$229K

Year 3 (100K users):
  Compute: $60K (6-10 instances, JVM overhead)
  Database: $15K (RDS PostgreSQL, 500GB)
  Storage: $10K
  Dev team: $360K (3 FTE)
  Ops: $18K
  Total: ~$463K

Year 5 (1M users):
  Compute: $120K (12-20 instances)
  Database: $30K (2TB PostgreSQL)
  Storage: $25K
  Dev team: $540K (4.5 FTE)
  Ops: $25K
  Total: ~$740K

Scaling factor: Linear (JVM resource consumption)
Risk: Low (proven, stable; but compute cost increases linearly)
```

#### On-Premise (Java + Oracle)
```
Year 1 (MVP, 10K users):
  Hardware: $50K (servers, NAS, networking)
  Data center/colocation: $20K/year
  DB licensing (Oracle): $10K/year
  Dev team: $180K (2 FTE)
  DevOps/SRE: $100K (1 FTE, infrastructure heavy)
  Total: ~$360K

Year 3 (100K users):
  Hardware upgrade: $30K (additional servers)
  Data center: $20K/year
  DB licensing: $30K/year (larger licenses)
  Dev team: $360K (3 FTE)
  DevOps: $120K
  Compliance/audit: $20K (security, backups)
  Total: ~$580K

Year 5 (1M users):
  Hardware: $100K (significant hardware investment)
  Data center: $30K/year
  DB licensing: $80K/year
  Dev team: $540K (4.5 FTE)
  DevOps: $150K (2 FTE, DR/failover)
  Compliance: $50K
  Total: ~$950K

Scaling factor: Capital-intensive (upfront hardware cost)
Risk: High operational burden, but no vendor lock-in
```

---

## Constraint-Based Cost Adjustment

### Budget Cap Override
If `budget_cap` specified and all candidates exceed it:
- Flag violation and highlight options:
  - Reduced scope (defer features to Year 2)
  - Hybrid approach (on-premise for data, cloud for app)
  - OSS-only + free tier (Firebase, AWS free tier, Heroku free)

### Timeline Constraint
If `timeline_weeks < 8`:
- Add hiring/onboarding overhead (cannot start with 0 experience)
- Prefer stacks with large ecosystem (more contractors available)
- Increase contingency budget (20-30% for timeline risk)

### Compliance/Security Constraint
If HealthCare/regulated:
- Add security audit costs: $30-100K/year
- Add compliance consulting: $20-50K/year
- Prefer managed services (reduces ops overhead)
- Consider vendor SLA/insurance: $10-20K/year

---

## Output Schema

```yaml
cost_estimation_id: "UUID"
proposal_id: "UUID"
generated_at: "ISO8601"

cost_estimates:
  - stack_id: "TS-EXPRESS-PG-AWS"
    
    # Year 1 breakdown
    year1:
      compute_cost: "$20K"
      database_cost: "$5K"
      storage_cost: "$2K"
      monitoring_cost: "$3K"
      team_cost: "$200K"
      ops_cost: "$10K"
      third_party: "$5K"
      contingency: "$10K"  # 10% buffer
      
      total_cost: "$255K"
      breakdown_by_category:
        infrastructure: "$30K (12%)"
        team: "$200K (78%)"
        operations: "$25K (10%)"
    
    # Year 3 projection
    year3:
      total_cost: "$490K"
      scaling_notes: "Linear scaling with user growth"
    
    # Year 5 projection
    year5:
      total_cost: "$780K"
    
    # Cost efficiency
    cost_per_user_year1: "$25.50"  # /10K users
    cost_per_user_year5: "$0.78"   # /1M users
    
    # Risk factors
    cost_risks:
      - "AWS pricing changes (historical: -10% to +5%/year)"
      - "Team salary inflation (4% annually)"
      - "Infrastructure optimization gains (typical: 15% by Year 3)"
    
    # Budget fit
    fits_budget: true/false
    budget_variance: "$X over/under"

# Summary table
cost_comparison:
  - stack: "TS-EXPRESS-PG-AWS"
    year1: "$255K"
    year3: "$490K"
    year5: "$780K"
    scaling_efficiency: "Linear"
    
  - stack: "PY-FASTAPI-PG-GCP"
    year1: "$210K"
    year3: "$432K"
    year5: "$688K"
    scaling_efficiency: "Sublinear (good)"
    
  - stack: "GO-GIN-PG-K8S"
    year1: "$197K"
    year3: "$398K"
    year5: "$615K"
    scaling_efficiency: "Best-in-class"
    
  - stack: "JAVA-SPRING-PG-AWS"
    year1: "$229K"
    year3: "$463K"
    year5: "$740K"
    scaling_efficiency: "Linear"
    
  - stack: "ON-PREMISE-JAVA-ORACLE"
    year1: "$360K"
    year3: "$580K"
    year5: "$950K"
    scaling_efficiency: "Capital-intensive, no vendor lock-in"

# Recommendations
recommendations:
  - if_under_budget: "All candidates fit within budget cap"
  - if_over_budget: "Candidates X, Y exceed budget; recommend scope reduction or alternate stacks"
  - cost_vs_value: "Rust has best ops costs but highest hiring cost; recommend if 3+ year horizon"
  - scaling_winner: "Go/Gin + GCP best value per user at scale"
```

---

## Implementation Notes

### Why Not Real-Time Pricing?
Using fixed estimates instead of live AWS/GCP APIs:
- Estimates sufficient for comparison (±20% accuracy)
- No API dependency/latency
- Maintainable: update annually based on provider announcements
- Conservative: factor in 10% contingency

### Learning Curve to Team Cost
```
Learning curve (weeks) → Additional salary overhead:
- 0-2 weeks: 0% (already skilled)
- 2-4 weeks: 10% (ramp-up period)
- 4-8 weeks: 25% (significant new learning)
- 8+ weeks: 50% (new language/paradigm)
```

### Scaling Assumptions
By default, assume:
- 10K users → baseline infrastructure
- 100K users → 10x traffic, need more DB replicas
- 1M users → 100x traffic, need caching, CDN, optimization
- Year 1 → MVP, minimal ops
- Year 3 → Some infrastructure optimization
- Year 5 → Full ops maturity

---

## Agent Limitations & Future Extensions

**Current Scope** (Phase 2):
- Fixed cost tables (updated annually)
- Simple linear/sublinear scaling models
- No ML-based cost prediction

**Phase 3+ Extensions**:
- Real-time provider pricing API integration
- Team cost by experience level/location (junior vs. senior)
- Industry-specific cost factors (healthcare compliance audit costs)
- Alternative infrastructure (spot instances, reserved capacity)
- TCO over 5-10 year horizon (includes license renewal, team scaling)
