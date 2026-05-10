# Theme C: Tech Selection Agent Group — Design Specification

**Version**: 1.0  
**Created**: 2026-05-09  
**For**: Opus Generator implementation  
**Based on**: theme.md  

---

## 1. Overview

The Tech Selection Agent Group is a multi-agent collaborative system that guides CTO/architect decision-making for technology stack selection in new projects. The system integrates requirement analysis, candidate technology proposal, comparative scoring, and tradeoff reasoning into a unified Markdown report. This specification aims to achieve ~75% strict fidelity to Must-Have requirements while enabling ~25% creative extensions in agent design, integration patterns, and output enhancements that demonstrate advanced multi-agent reasoning.

---

## 2. Requirements Breakdown

### 2.1 Must-Have Requirements (Phase 1: Weeks 1-2)

#### 2.1.1 Minimum Agent Count: 2+ Specialized Agents

**Requirements Analysis Agent** (`requirement-analyzer.md`)
- **Input**: Project requirement document (3-5 pages) containing:
  - Project scope (new/greenfield vs. legacy migration)
  - Scale requirements (user count, data volume, growth projections)
  - Security/compliance needs (HIPAA, PCI, SOC2, GDPR, etc.)
  - Performance expectations (latency, throughput, reliability targets)
  - Team composition (size, skill levels, availability)
  - Timeline/deadline constraints
  - Budget envelope (if available)
  
- **Processing Logic**:
  - Parse requirement document to identify explicit constraints
  - Infer priority axis by analyzing language intensity (e.g., "critical security" → security weight +2)
  - Quantify each of four core dimensions on scale 0-10:
    * **Scalability**: Required to support 10K+ concurrent users / petabyte data? → Higher scores
    * **Security**: Regulated industry? Multi-tenant isolation? → Higher scores
    * **Performance**: Real-time requirements? Sub-100ms latency needed? → Higher scores
    * **Development Velocity**: Time-to-market critical? Startup phase? → Higher scores
  - Identify conflicting requirements and flag for harness resolution
  
- **Output Format** (Markdown section):
  ```
  ## Requirement Analysis
  - **Inferred Industry**: [SaaS / HealthCare / IoT / ...]
  - **Priority Axis**: Scalability (8/10) > Security (6/10) > Performance (5/10) > Velocity (7/10)
  - **Critical Constraints**: [Budget cap $X, Team of N, Legacy migration from Y, ...]
  - **Conflicting Requirements**: [List any identified contradictions]
  - **Recommendation Angle**: Focus on technologies that excel in [top 2-3 priorities]
  ```

**Technology Proposal Agent** (`technology-proposer.md`)
- **Input**: Requirement analysis output + priority axis
  
- **Processing Logic**:
  - Maintain curated knowledge base of 30-50 technology stacks across categories:
    * Languages: TypeScript, Python, Go, Rust, Java, C#
    * Backends: Node.js, Django, FastAPI, Spring Boot, ASP.NET, Gin
    * Databases: PostgreSQL, MongoDB, DynamoDB, Cassandra, Firebase
    * Infrastructure: AWS, GCP, Azure, Heroku, Digital Ocean
  - For each of 3-5 candidate stacks, evaluate fit for identified priorities
  - Generate stack recommendations with justification tied to requirement analysis
  
- **Output Format** (Markdown table):
  ```
  | # | Language | Framework | Database | Infrastructure | Fit Rationale |
  |---|----------|-----------|----------|-----------------|---------------|
  | 1 | TypeScript | Express | PostgreSQL | AWS EC2+RDS | Velocity (npm ecosystem) + Scalability (cloud-native) |
  | 2 | Python | FastAPI | MongoDB | GCP | Security (FastAPI best practices) + Dev speed |
  | 3 | Go | Gin | PostgreSQL | Kubernetes | Performance (compiled) + Scalability (goroutines) |
  ```

#### 2.1.2 Harness Implementation (Integration & Scoring Agent)

The harness orchestrates agent outputs and performs unified decision-making.

**Core Responsibilities**:
1. **Result Aggregation**
   - Collect requirement analysis + candidate proposals
   - Validate output formats and completeness

2. **Unified Scoring System**
   - Build 2D matrix: Requirement axes (Scalability, Security, Performance, Velocity) × Candidate stacks
   - Score each candidate 0-10 for each axis (not a simple average; use weighted priorities)
   - Generate a **Priority-Weighted Composite Score**:
     ```
     Final Score = (Scalability Weight × Scalability Score) + 
                   (Security Weight × Security Score) + 
                   (Performance Weight × Performance Score) + 
                   (Velocity Weight × Velocity Score)
     ```
   - Weights derived from requirement analysis priorities (must sum to 1.0)

3. **Tradeoff Analysis**
   - For top 3 candidates, identify 2-3 key tradeoffs:
     * "Stack A: Excellent scalability but steep learning curve (6 weeks onboarding)"
     * "Stack B: Fast time-to-market but limited scaling beyond 100K users"
     * "Stack C: Best security posture but highest infrastructure complexity"
   - Explicitly state which tradeoff is acceptable given project constraints

4. **Final Recommendation**
   - Select 1 primary recommendation + 2 alternatives
   - Justify selection: "Recommended Stack X because [priority axis] is your critical need, and this stack scores 9/10 on that axis while maintaining 7+ on others. Tradeoff: [acknowledge drawback] is acceptable given [constraint]."

**Output Format**:
```
## Scoring Matrix
[2D table: Requirements × Candidates, 0-10 scores + reasoning]

## Priority-Weighted Scores
[Bar chart or table showing final composite scores]

## Tradeoff Analysis
| Stack | Strengths | Weaknesses | Acceptable Risk? |
|-------|-----------|-----------|-----------------|
| A     | Scalability (9/10) | Learning curve | Yes, if team upskilling possible |
| B     | Time-to-market (9/10) | Scale limits | Conditional on growth timeline |

## Final Recommendation
**Primary**: [Stack name + 2-3 sentence justification]
**Rationale**: Optimizes for your priority axis [X] while maintaining acceptable performance on [Y, Z]
**Risk Mitigation**: [for identified tradeoffs]
```

#### 2.1.3 Input Format Specification

**Requirement Document Template** (provided as reference):
```markdown
# Project Requirement Document: [Project Name]

## 1. Project Overview
- Problem statement
- Target user count (day 1, year 1, year 5)
- Geographic scope

## 2. Functional Requirements
- Core features (bullet list)

## 3. Non-Functional Requirements
- Scalability: Expected QPS, concurrent users, data volume
- Security: HIPAA/GDPR/PCI applicable? Multi-tenancy needed?
- Performance: Latency targets, throughput requirements
- Reliability: Uptime SLA, failover strategy

## 4. Team & Constraints
- Team size and skill composition
- Existing technology investments (legacy systems?)
- Timeline to MVP
- Budget envelope (if known)

## 5. Preferences & Constraints
- "We prefer open-source" / "Commercial support required"
- "Must run on edge devices" / "Cloud-first acceptable"
- Any forbidden technologies (e.g., "no PHP")
```

#### 2.1.4 Output Format Specification

All harness outputs must be **single consolidated Markdown report** with sections:
1. Executive Summary (1-2 sentences)
2. Input Analysis (requirement priorities summary)
3. Candidate Stacks Table (3-5 options)
4. Scoring Matrix (axes × candidates)
5. Tradeoff Analysis (3-4 key tensions)
6. Final Recommendation (+ rationale + risk mitigation)
7. Appendix: Detailed Scoring Rubric (why each score)

#### 2.1.5 Sample Tests (Acceptance Criteria)

Implement **2 minimum test scenarios** covering different priority axes:

**Test Scenario A: SaaS (Scalability-First)**
- Input: New social media platform, 10K→10M users, standard security, 3-month MVP
- Expected Output: TypeScript/Node.js + PostgreSQL + AWS or similar (prioritizes velocity + horizontal scalability)
- Success Criterion: Recommended stack receives highest composite score in "Scalability" dimension

**Test Scenario B: HealthCare (Security-First)**  
- Input: Patient data management system, compliance (HIPAA, GDPR), 1K users initially, 18-month timeline
- Expected Output: Python + Django/FastAPI + PostgreSQL + On-premise or private cloud (prioritizes security, compliance, team familiarity)
- Success Criterion: Recommended stack receives highest composite score in "Security" dimension; security-related technologies (e.g., encryption, audit logging) explicitly mentioned

---

### 2.2 Should-Have Requirements (Phase 2: Weeks 3-4)

#### 2.2.1 Third Specialist Agent

**Cost Estimation Agent** (`cost-estimator.md`) — Recommended approach
- **Input**: Candidate technology stacks + project constraints (team size, timeline, scale)
- **Processing Logic**:
  - Break down costs into 3 categories:
    * **Infrastructure**: Compute, storage, egress (year 1 vs. year 5 projections)
    * **Development**: Estimated team hours (based on framework maturity, documentation, ecosystem size)
    * **Operations**: Monitoring, CI/CD, disaster recovery, ongoing maintenance
  - Provide rough cost ranges: "Stack A: $20K-$50K/year (small team, scaling), Stack B: $100K-$300K/year (managed services)"
  - Highlight where cost scales favorably/unfavorably with growth
  
- **Output Format**:
  ```
  ## Cost Estimation
  | Stack | Year 1 (Startup) | Year 3 (Growth) | Development Effort | Operations Complexity |
  |-------|-----------------|-----------------|-------------------|----------------------|
  | A | $50K | $200K | 4 FTE (8 weeks MVP) | Medium (self-managed) |
  | B | $30K | $500K | 3 FTE (6 weeks MVP) | High (managed services) |
  ```

**OR Alternative: Competitive Scoring Agent** (`technology-scorer.md`)
- Applies objective metrics: GitHub stars, npm weekly downloads, job market saturation, TIOBE/RedMonk ranking
- Generates a separate "Market Maturity" score influencing risk assessment
- (Recommended if organization wants data-driven comparison vs. cost projection)

#### 2.2.2 Agent-to-Agent Coordination

Implement explicit **pipeline orchestration**:
1. Requirement Analyzer → generates priority weights + constraints
2. Technology Proposer → accepts priority weights + generates 3-5 candidates
3. [Cost Estimator OR Scorer] → evaluates cost/maturity for each candidate
4. Harness → receives all three outputs, performs unified ranking, generates report

Include explicit **conflict resolution logic**:
- If requirements specify "must use existing PHP team" but analysis prioritizes Rust → Harness flags contradiction and applies constraint override
- If budget is $50K/year but recommended stack costs $150K/year → Harness re-ranks with cost as secondary constraint

#### 2.2.3 Multi-Industry Support

Implement **industry detection logic** in Requirement Analyzer:
- **SaaS** indicators: "B2B/B2C", "millions of users", "growth-stage"
  - Priority axis: Scalability > Velocity > Security > Performance
  - Recommended approach: Cloud-native, horizontally scalable, rapid iteration
  
- **HealthCare** indicators: "patient data", "HIPAA", "regulated", "compliance"
  - Priority axis: Security > Compliance > Reliability > Scalability
  - Recommended approach: On-premise/private cloud, audit logging, encryption-first
  
- **IoT/Embedded** indicators: "edge devices", "constrained resources", "real-time", "latency <50ms"
  - Priority axis: Performance > Reliability > Scalability > Power consumption
  - Recommended approach: Systems languages (Go, Rust, C), minimal overhead, edge-first
  
- **Enterprise** indicators: "existing ERP", "legacy migration", "10+ year lifespan"
  - Priority axis: Interoperability > Stability > Support > Innovation
  - Recommended approach: Established ecosystems, vendor support, standardized platforms

#### 2.2.4 Documentation Standards

**Scoring Rubric** (append to spec):
```
### Scoring Methodology

**Scalability Axis (0-10)**:
- 8-10: Designed for 100K+ concurrent, auto-scaling, sharding built-in (Go, Rust, Kubernetes)
- 6-7: Handles 10K-100K with application-level optimization (Node.js, Python + load balancer)
- 4-5: Capable but requires optimization (Ruby, PHP with proper setup)
- 0-3: Not recommended for high-scale (legacy stacks or single-machine)

**Security Axis (0-10)**:
- 8-10: Crypto libraries first-class, audit logging native, escape hatch prevention (Rust, Java)
- 6-7: Good defaults, active security updates (Python, Go, TypeScript)
- 4-5: Requires hardening, larger attack surface (older frameworks)
- 0-3: Known vulnerabilities or minimal security tooling

[Continue for Performance, Velocity axes...]
```

**Learning Curve & Onboarding** (append to candidate recommendations):
```
### Stack A: TypeScript + Express + PostgreSQL
- Learning Curve: 4 weeks (TypeScript familiarity, async patterns)
- Team Onboarding: Requires Node.js expertise; JavaScript is common
- Risk: None if team has JavaScript background
```

**Technology Lifecycle & Risk**:
```
### Risk Assessment
| Technology | Lifecycle Status | Adoption Trajectory | Risk Level |
|-----------|-----------------|-------------------|-----------|
| Python 3.11 | Stable (10 yrs) | Mainstream | Low |
| Go 1.21 | Stable (10 yrs) | Rising (Cloud-native) | Low-Medium |
| Rust | Stable (8 yrs) | Rapidly rising | Medium (small ecosystem vs. adoption) |
| Kotlin | Stable (7 yrs) | Stable in Android | Medium-High (JVM-only use cases) |
```

---

### 2.3 Nice-to-Have Requirements (Phase 3: Optional Extensions)

#### 2.3.1 Migration Path Analysis
- **For legacy migration scenarios**, estimate:
  - Rewrite vs. gradual migration effort (e.g., "6 months rewrite" vs. "18 months parallel migration")
  - Data schema transformation cost
  - Team downtime / feature freeze risk
  - Rollback plan complexity

#### 2.3.2 Security Scoring (OWASP Top 10 Alignment)
- Rank candidate stacks on built-in defenses against:
  - OWASP A01: Broken Access Control
  - OWASP A02: Cryptographic Failures
  - OWASP A03: Injection (SQL, NoSQL, command injection)
  - A04-A10: Other critical vectors
- Provide security scorecard separate from general scoring matrix

#### 2.3.3 Developer Experience (DX) Scoring
- Quantify from objective signals:
  - GitHub stars (popularity proxy)
  - npm/PyPI weekly downloads (community activity)
  - Stack Overflow questions (knowledge base size)
  - Job market availability (hiring difficulty)
  - Documentation quality (measured by avg. time-to-first-solution)
- Generate "DX Score" (0-10) independent of functional fit; useful for team morale & hiring

#### 2.3.4 AI Model Integration Agent
- **Question**: "Does this project require LLM/inference capabilities?"
- **Decision Tree**:
  - If "yes" → Recommend API-based (OpenAI, Anthropic, Cohere) vs. self-hosted (Ollama, vLLM)
  - Estimate latency impact, cost, compliance (data residency for LLM inference)
  - Suggest stack augmentations (e.g., "TypeScript + OpenAI SDK prefers Node.js 18+")

---

## 3. Recommended Technical Stack

**Implementation Language**: Markdown (`.md` agent definitions within Claude Code Agent framework)

**Agent Count**:
- **Minimum (Phase 1)**: 2 agents (Requirement Analyzer, Technology Proposer)
- **Recommended (Phase 2)**: 3 agents (+ Cost Estimator)

**Harness Framework**: Claude Code Agent SDK  
- Agents defined as `.md` files containing:
  - Agent ID + name
  - System prompt (role, instructions, output format)
  - Input schema (what agent receives)
  - Output schema (what agent produces)
  - Key decision logic (if/then rules or prompt guidance)

**Sample Test Data**: Provide 3-5 requirement document templates representing different industries:
1. **saas-startup.md** (Scalability-first, 3-month MVP)
2. **healthcare-provider.md** (Security-first, HIPAA compliance, 18-month)
3. **iot-embedded.md** (Performance-first, edge devices, real-time)
4. **enterprise-migration.md** (Legacy PHP → modern stack, existing team of 20)
5. **(Optional) EdTech (Reliability-first, 24/7 uptime during exam season)**

**Output Format**: Single Markdown report per project
- Rendering-ready (safe for sharing with stakeholders)
- Sections ordered for executive readability (summary → candidate comparison → recommendation)

---

## 4. Implementation Phase Plan

### Phase 1: Must-Have Completion (Weeks 1-2)

**Objectives**: Deliver 2 agents + harness + sample tests

**Week 1**:
1. Define agent interfaces (input/output schemas)
2. Implement Requirement Analyzer agent
   - Requirement document parsing logic
   - Priority axis calculation
   - Conflict detection
3. Implement Technology Proposer agent
   - Candidate stack selection logic
   - Technology knowledge base (30-50 stacks)
4. Draft harness skeleton:
   - Agent orchestration / result aggregation
   - Scoring matrix generation

**Week 2**:
1. Implement harness scoring system:
   - Weighted composite score calculation
   - Tradeoff analysis logic
2. Create final recommendation algorithm
3. Test on 2 sample requirements (SaaS + HealthCare)
4. Validate output format against spec
5. Debug agent communication / format mismatches

**Acceptance Criteria**:
- ✓ Both agents produce correctly-formatted outputs
- ✓ Harness integrates outputs without errors
- ✓ Scoring matrix explains "why this score" for each cell
- ✓ 2 sample tests produce different recommendations (different priority axes)
- ✓ Final recommendation includes rationale + risk mitigation
- ✓ Report is Markdown-ready for human review

---

### Phase 2: Should-Have Extensions (Weeks 3-4)

**Objectives**: Add 3rd agent + multi-industry support + enhanced docs

**Week 3**:
1. Implement Cost Estimator Agent (or Competitive Scorer)
   - Cost breakdown logic (infrastructure, development, operations)
   - Year 1 vs. Year 5 projections
2. Implement industry detection in Requirement Analyzer
   - Keywords/heuristics for SaaS, HealthCare, IoT, Enterprise
   - Adjust priority weights per industry
3. Add explicit conflict resolution logic to harness
   - "Must-use constraint" overrides analysis
   - Cost vs. capability tradeoff handling

**Week 4**:
1. Create comprehensive scoring rubric (Appendix to spec)
   - Detailed evaluation criteria for each axis
   - Technology lifecycle/risk assessment table
2. Add "Learning Curve & Onboarding" section per candidate
3. Test on 3-5 diverse scenarios (SaaS, HealthCare, IoT, Enterprise, EdTech)
4. Validate multi-industry detection
5. Documentation: Agent decision logic, scoring methodology, results interpretation guide

**Acceptance Criteria**:
- ✓ 3rd agent (cost or scoring) integrated and functional
- ✓ Industry detection working (SaaS vs. HealthCare recommendations differ predictably)
- ✓ Conflict resolution applied when requirements contradict
- ✓ 5-scenario test suite passes (each generates expected priority axis)
- ✓ Scoring rubric explains evaluation methodology
- ✓ Learning curve estimates provided per candidate
- ✓ Multi-industry documentation complete

---

### Phase 3: Nice-to-Have Features (Optional / Time-Permitting)

- Week 5+ (if resources allow):
  1. Migration Path Analysis Agent
  2. OWASP Security Scoring integration
  3. DX Score (GitHub stars, job market, etc.)
  4. AI Model Integration Agent

---

## 5. Quality Criteria (Definition of "Complete")

A system is complete when:

✓ **Agent Independence**: 2-3 agents produce high-quality outputs independently; harness can fetch results autonomously  
✓ **Result Integration**: Harness successfully merges agent outputs without format errors  
✓ **Unified Scoring**: Scoring matrix is present, mathematically consistent, and weights match requirement priorities  
✓ **Explainability**: Every score (0-10) includes 1-2 sentence justification ("Score 8/10 on scalability because Go's goroutines handle 100K+ concurrent users natively")  
✓ **Tradeoff Clarity**: For top 3 candidates, ≥2 key tradeoffs identified with explicit acceptability assessment  
✓ **Differentiated Output**: Different requirement documents produce different recommendations (not all same answer)  
✓ **Multi-Industry Adaptation**: SaaS, HealthCare, IoT projects get different priority axes reflected in final scores  
✓ **Agent Definitions**: Each agent defined in ≤200 lines Markdown (clarity + maintainability)  
✓ **Sample Test Coverage**: 2-5 test scenarios covering distinct priority axes all pass  
✓ **Documentation**: Scoring rubric, agent logic, harness flow documented for future extension  

---

## 6. Edge Cases & Failure Modes

### 6.1 Requirement Contradictions

**Scenario**: "Must launch MVP in 2 weeks" + "Requires HIPAA compliance" + "New language adoption mandatory"

**Harness Response**:
1. Flag contradictions explicitly in report
2. Apply priority override: "Timeline constraint overrides language preference"
3. Recommend fastest-compliant stack (e.g., "Use existing team's language + HIPAA-compatible database")
4. Clearly state mitigation: "Team will use vendor-managed HIPAA infrastructure to compress timeline"

### 6.2 Legacy System Migration

**Scenario**: "Existing PHP codebase (50K lines, 5 engineers), migrating to modern stack"

**Harness Response**:
1. Cost Estimator: "Parallel migration (18 months) vs. rewrite (6 months rewrite + 3-month risk period)"
2. Technology Proposer: Prioritize low-learning-curve candidates for existing PHP team (e.g., Python, not Rust)
3. Scoring matrix: Weight "team onboarding" heavily (8/10 for TypeScript+Node, 4/10 for Rust)
4. Final recommendation: "TypeScript + Express + PostgreSQL (team can leverage JS knowledge, fastest time-to-competency)"

### 6.3 Emerging Technology Risk

**Scenario**: "We want to use Rust because it's the future"

**Harness Response**:
1. Technology Proposer: Include Rust in candidates ✓
2. Scoring matrix:
   - Performance: 10/10 (compiled, minimal overhead)
   - Scalability: 9/10 (efficient concurrency)
   - Velocity: 4/10 (steep learning curve, smaller ecosystem)
   - Security: 10/10 (memory-safe by default)
3. Cost Estimator: "Hiring risk: 20% fewer Rust engineers in market; onboarding 8 weeks vs. 4 weeks for Go"
4. Final recommendation: "Rust excels at performance/security but trades onboarding time. Viable if team commitment confirmed; otherwise Go is 85% as good with 50% faster onboarding."

### 6.4 Severe Budget Constraints

**Scenario**: "Maximum $10K/year all-in, no commercial support"

**Harness Response**:
1. Cost Estimator: Filter candidates to OSS-only + free tier infrastructure (AWS free tier, GCP always-free)
2. Technology Proposer: Recommend stacks known for cost efficiency (Python + open-source DB + free cloud)
3. Scoring matrix: Apply "Cost Constraint Multiplier" (Stack exceeding budget gets max score 6/10)
4. Final recommendation: "Python + FastAPI + SQLite/PostgreSQL + Docker on VPS ($5-10/mo) meets budget; trades managed infrastructure complexity for cost"

### 6.5 Security Constraints (Regulated Industries)

**Scenario**: "Cannot use any third-party SaaS; all data on-premise; FedRAMP Level 4"

**Harness Response**:
1. Cost Estimator: Heavily weight on-premise infrastructure costs (≥$500K/year)
2. Technology Proposer: Filter to stack supporting FedRAMP deployment (AWS GovCloud, Azure Government, etc.)
3. Scoring matrix: Penalize cloud-dependent stacks (0/10 if FedRAMP-incompatible)
4. Final recommendation: "Java + Spring Boot + Oracle + FedRAMP-compliant private cloud. Trade-offs: higher operational burden, but meets security mandate"

### 6.6 Multi-Industry Adaptation Failure

**Scenario**: Agent proposes same tech stack (Node.js + MongoDB) for all projects

**Harness Response** (error handling):
- Requirement Analyzer should detect industry type and adjust weights
- If detection fails: Flag "Multi-industry logic failed; applying default SaaS assumptions"
- Recommendation: Validate industry detection on 5-industry test suite before Phase 2 completion

---

## 7. Agent Design Guidance

### 7.1 Requirement Analyzer Agent

**Key Design Decisions**:

1. **Input Parsing Strategy**:
   - Expect variable document length / structure (3-5 pages doesn't mean exact section order)
   - Use heuristic keyword detection: "HIPAA" → security weight +2, "10M users" → scalability weight +3
   - Fallback: Default to balanced (2.5/2.5/2.5/2.5) if keywords sparse

2. **Priority Calculation**:
   - Explicitly assign weights to each axis (Scalability, Security, Performance, Velocity)
   - Weights must sum to 1.0
   - Export weights as JSON for harness to reference

3. **Conflict Detection**:
   - Identify contradictions: "Timeline < 4 weeks" + "Full compliance audit required"
   - Output conflict list; harness applies constraint priority rules

**Example System Prompt**:
```
You are the Requirements Analysis Agent. Your role is to read project requirements and extract:
1. Inferred industry type (SaaS / HealthCare / IoT / Enterprise / Other)
2. Priority weights (0-10) for: Scalability, Security, Performance, Velocity
3. Hard constraints (budget cap, team size, timeline, existing tech stack)
4. Conflicting requirements (list any tensions)

Output ONLY valid JSON matching the schema below. Do not add explanations.

{
  "industry": "SaaS",
  "priority_weights": {
    "scalability": 0.4,
    "security": 0.2,
    "performance": 0.2,
    "velocity": 0.2
  },
  "constraints": {
    "budget_cap": null,
    "team_size": 5,
    "timeline_weeks": 12,
    "existing_stack": "Django + PostgreSQL"
  },
  "conflicting_requirements": [
    "Timeline (12 weeks) conflicts with HIPAA compliance audit (20 weeks minimum)"
  ]
}
```

### 7.2 Technology Proposer Agent

**Key Design Decisions**:

1. **Knowledge Base Organization**:
   - Organize 30-50 stacks by category (language/framework/DB/infra combinations)
   - Tag each with: maturity (stable/rising/declining), ecosystem size, learning curve, scalability ceiling
   - Example: "TypeScript + Express + PostgreSQL" → tags: [Web, Scalable, Fast-onboarding, Cost-effective]

2. **Candidate Selection Logic**:
   - For each priority weight from Requirement Analyzer:
     - Find top 2-3 stacks excelling on that priority
     - Rank by composite fit across all priorities
   - Output 3-5 candidates, preferably with 1-2 "safe default" + 1-2 "cutting-edge"

3. **Justification Format**:
   - Each candidate should include: "Why this stack for your priorities" (2-3 sentences)
   - Explicitly call out which priority axes this stack optimizes

**Example System Prompt**:
```
You are the Technology Proposal Agent. Given requirement priorities, recommend 3-5 tech stacks.

For each candidate, evaluate:
- Scalability: Can this handle the growth requirements?
- Security: Does this have strong built-in security?
- Performance: Can this meet latency/throughput targets?
- Velocity: How fast can a new team become productive?

Output ONLY a Markdown table (not JSON) with columns:
Rank | Language | Framework | Database | Infrastructure | Justification (2 sentences max)

Do not add preamble or explanation.
```

### 7.3 Harness (Integrating Agent)

**Key Design Decisions**:

1. **Orchestration Model**:
   - Sequential: Requirement Analyzer → Technology Proposer → Cost Estimator → Scoring/Recommendation
   - Allow short feedback loops (if candidates don't match priorities, re-run proposer)

2. **Scoring Matrix Construction**:
   - Build 2D array: [candidates] × [priority axes]
   - Score 0-10 each cell with rubric-based justification
   - Weight each cell by priority weight from Requirement Analyzer
   - Compute composite score: SUM(weight_i × score_i) for each candidate

3. **Tradeoff Identification**:
   - For each candidate, find 1-2 weaknesses (lowest-scoring axes)
   - Phrase as "Stack X excels at [strength] but is weaker at [weakness], acceptable if [mitigation]"

4. **Recommendation Logic**:
   - Select candidate with highest composite score
   - Fallback heuristic: If tied, prefer stack with better onboarding (lower velocity risk)
   - Include 2 alternatives (2nd + 3rd highest scores)

**Example Harness Output**:
```markdown
## Scoring Matrix

| Candidate | Scalability | Security | Performance | Velocity | Weighted Score |
|-----------|-------------|----------|-------------|----------|-----------------|
| Stack A   | 9/10        | 6/10     | 7/10        | 9/10     | 8.2/10 (weights: 0.4, 0.2, 0.2, 0.2) |
| Stack B   | 7/10        | 9/10     | 8/10        | 5/10     | 7.1/10 |

## Final Recommendation

**Stack A: TypeScript + Express + PostgreSQL + AWS**

Rationale: Your project prioritizes scalability (weight 0.4) and velocity (weight 0.2). Stack A scores 9/10 on both, best-in-class. Security (6/10) is acceptable given you don't have regulated data; performance (7/10) is above requirements.

Tradeoff: Stack A requires JavaScript expertise; if your team is primarily Java-experienced, Stack C may be faster to competency (at cost of 1-2 months slower time-to-market).

Recommendation: Proceed with Stack A if your team has JavaScript background OR can hire/upskill 1-2 engineers. If budget for hiring is constrained, reconsider Stack C.
```

---

## 8. Flexibility & Extension Points for Opus Generator

The following areas are intentionally left with room for creative interpretation and enhancement:

1. **Agent Communication Protocol**: Spec defines inputs/outputs but not exact API/format — Generator may use JSON, Markdown tables, structured objects, or hybrid
2. **Scoring Rubric Depth**: Spec provides framework; Generator can expand with more nuanced criteria per technology
3. **Visualization**: Spec requires text output; Generator can add charts, comparison matrices, or interactive elements
4. **Conflict Resolution**: Spec describes scenarios; Generator can implement sophisticated constraint solvers or simple heuristics
5. **Industry-Specific Logic**: Spec mentions 4 industries; Generator can expand or refine industry detection
6. **Agent Count**: Spec requires 2+ for Phase 1; Generator can add more specialized agents (e.g., DevOps agent, Data engineer agent)
7. **Report Structure**: Spec defines sections; Generator can enhance with executive summary, appendices, or recommendation scoring details
8. **Sample Test Quality**: Spec requires 2 tests passing; Generator can create more realistic requirement documents with richer narrative

**Expected Outcome**: Opus Generator produces ~75% of spec requirements + ~25% creative extensions that demonstrate sophisticated multi-agent reasoning, domain knowledge, or novel integration patterns.

---

## 9. Success Metrics

### Acceptance Criteria (Opus Generator Deliverables)

- [ ] 2-3 agent definitions (`.md` files) following Claude Code framework
- [ ] Harness implementation integrating agents + producing unified report
- [ ] Scoring matrix present in output with 0-10 scores + justifications
- [ ] Tradeoff analysis (≥2 key tensions per top 3 candidates)
- [ ] Final recommendation with 2-3 sentence rationale + risk mitigation
- [ ] 2-5 sample test runs on provided requirement documents
- [ ] Different priority axes → different recommendations (SaaS ≠ HealthCare)
- [ ] Complete spec fidelity OR creative extensions clearly labeled
- [ ] Agents ≤200 lines each (readability)
- [ ] Documentation: agent logic + scoring methodology + harness flow

### Quality Gates

- Scoring must be explainable ("Why 8/10 scalability for Stack A?")
- Recommendations must reflect requirement priorities (not arbitrary)
- Test scenarios must produce sensible results (not circular reasoning)
- Output Markdown must render without errors + be stakeholder-ready

---

## Appendix: Scoring Rubric Template

*To be completed by Opus Generator during Phase 2*

### Scalability Dimension (0-10 Scale)

| Score | Characteristics | Examples |
|-------|-----------------|----------|
| 9-10 | Designed for 100K+ concurrent; auto-scaling native; data sharding supported | Go, Rust, Kubernetes-native stacks |
| 7-8 | Handles 10K-100K with optimization; horizontal scaling possible | Node.js, Python + load balancer |
| 5-6 | Capable with engineering effort; scaling harder | Ruby, PHP + optimization |
| 3-4 | Limited scaling without major refactor | Legacy stacks, monolithic |
| 0-2 | Single-machine only; not for scale | Embedded/real-time systems for scale requirements |

### Security Dimension (0-10 Scale)

| Score | Characteristics | Examples |
|-------|-----------------|----------|
| 9-10 | Memory-safe language; crypto primitives first-class; audit logging built-in | Rust, Java, C# |
| 7-8 | Strong defaults; active security updates; good libraries | Python 3, Go, TypeScript |
| 5-6 | Capable but requires hardening; larger attack surface | PHP 8, Ruby 3 |
| 3-4 | Known vulnerabilities; older frameworks | Python 2, legacy Node.js |
| 0-2 | Security afterthought | Unpatched systems, web frameworks from 2000s |

[Continue for Performance, Velocity...]

---

**Document Version**: 1.0  
**Status**: Ready for Opus Generator  
**Next Step**: Generator creates agent implementations + harness + sample tests  
