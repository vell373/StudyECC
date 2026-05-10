# Requirement Analyzer Agent

**Version**: 1.0  
**Status**: Phase 1 - Must-Have  
**Last Updated**: 2026-05-09

---

## Agent Definition

### Core Identity
- **Agent ID**: `requirement-analyzer-v1`
- **Agent Name**: RequirementAnalyzerAgent
- **Role**: Extract project priorities and constraints from requirement documents
- **Responsibility**: Parse unstructured requirements → quantified priority weights (0-10 per axis)

### Input Schema

```json
{
  "project_name": "string (required)",
  "requirement_document": "string (markdown, 3-5 pages typical)",
  "industry_hint": "string (optional: SaaS|HealthCare|IoT|Enterprise|Other)"
}
```

### Processing Logic

#### 1. Industry Detection (Auto or Manual)
Analyze document for industry keywords:
- **SaaS**: "B2B", "B2C", "millions of users", "growth-stage", "viral", "marketplace"
- **HealthCare**: "patient", "HIPAA", "GDPR", "regulated", "medical", "compliance", "audit"
- **IoT**: "edge", "device", "embedded", "real-time", "latency <50ms", "constrained"
- **Enterprise**: "legacy", "ERP", "migration", "10-year lifespan", "stability", "vendor"
- **EdTech**: "users surge", "exam season", "24/7 uptime", "student access", "reliability"

#### 2. Priority Weight Calculation
For each axis, scan document and assign intensity score (0-10), then normalize to weights (sum=1.0):

**Scalability (0-10)**:
- User count: 1K→2pt, 10K→4pt, 100K→6pt, 1M→8pt, 10M→10pt
- Concurrent connections: <100→1pt, 1K→3pt, 10K→6pt, 100K→9pt
- Data volume: KB→1pt, GB→3pt, TB→6pt, PB→9pt
- Growth rate mentions: "exponential"→+3, "expected 10x"→+2, "steady"→+1
- Keywords: "scalable", "billions", "horizontal scaling" → +2 each

**Security (0-10)**:
- Compliance: HIPAA→+3, GDPR→+3, PCI→+2, SOC2→+1, Custom→+1
- Data sensitivity: "PII"→+2, "financial"→+2, "health"→+3, "public"→0
- Multi-tenancy: required→+2
- Encryption: "end-to-end"→+2, "at rest"→+1
- Keywords: "secure", "audited", "compliance", "encrypted" → +1 each

**Performance (0-10)**:
- Latency targets: <500ms→3pt, <200ms→5pt, <100ms→7pt, <50ms→9pt, <10ms→10pt
- Real-time requirements: present→+3
- Throughput: QPS targets, <100→2pt, 1K→4pt, 10K→7pt, 100K→9pt
- Keywords: "fast", "responsive", "low-latency", "real-time" → +1 each

**Development Velocity (0-10)**:
- Timeline: >12 months→2pt, 6-12 months→4pt, 3-6 months→6pt, <3 months→8pt
- MVP pressure: "MVP in X weeks" → min(8, 10-X/2)
- Team: small/startup→+2, experienced→+1, new hires→-2
- Keywords: "fast", "quick", "rapid", "MVP", "iterate" → +1 each

#### 3. Constraint Extraction
- Budget cap: Extract numeric values
- Team size: Count engineers mentioned
- Timeline: Extract weeks/months to MVP
- Existing stack: Identify technologies in place
- Forbidden techs: Extract "no PHP", "no PHP", etc.

#### 4. Conflict Detection
Flag contradictions:
- "MVP in 2 weeks" + "Full HIPAA audit" (timeline vs. compliance)
- "No budget for hiring" + "Must learn Rust" (team constraint vs. tech)
- "Open-source only" + "Needs 24/7 vendor support" (cost vs. support)

---

### Output Schema

```yaml
# Requirement Analysis Output
analysis_id: "string"  # UUID
project_name: "string"
analyzed_at: "ISO8601"

# Industry Classification
inferred_industry: "SaaS|HealthCare|IoT|Enterprise|EdTech|Other"
industry_confidence: 0-1  # 0.9 = very confident

# Priority Weights (sum=1.0)
priority_weights:
  scalability: 0.0-1.0
  security: 0.0-1.0
  performance: 0.0-1.0
  velocity: 0.0-1.0

# Raw Axis Scores (0-10, before normalization)
axis_scores:
  scalability: 0-10
  security: 0-10
  performance: 0-10
  velocity: 0-10

# Critical Constraints
constraints:
  budget_cap: "string or null"  # e.g., "$50K/year"
  team_size: "int"  # engineer count
  timeline_weeks: "int"
  existing_stack: "array of strings"  # e.g., ["PHP", "MySQL"]
  forbidden_techs: "array"

# Conflicting Requirements
conflicts:
  - item: "string"
    reason: "string"
    severity: "high|medium|low"

# Recommendation Angle
recommendation_angle: "string"  # 2-3 sentences on what to optimize for
```

### Key Decision Rules

| Scenario | Action |
|----------|--------|
| Multiple high priorities (all 8+) | Flag conflict; recommend trade-off analysis in harness |
| Budget < $10K/year | Penalize proprietary/commercial solutions in final scoring |
| Timeline < 4 weeks | Boost velocity weight, penalize learning-curve technologies |
| HIPAA/regulated | Increase security weight to 0.4+, flag on-premise requirement |
| "New language adoption" + timeline conflict | Flag as critical conflict; harness applies constraint override |
| Missing document sections | Apply default balanced weights (0.25/0.25/0.25/0.25); flag incompleteness |

---

## Implementation Notes

### Keyword-Based Heuristics
Instead of ML, use curated keyword lists per axis + simple scoring:
- More robust to document structure variations
- Explainable: "Score 7 because document contains: 'scale to 1M users', '10x growth', 'serverless'" 
- Maintainable: Keywords added incrementally

### Normalization Strategy
After summing raw scores (max 40), divide each by 40 to get 0-1 weights:
```
weight_i = axis_score_i / sum(all_axis_scores)
```
Ensures weights always sum to 1.0.

### Graceful Degradation
If document is very sparse (few relevant keywords):
- Use default balanced weights (0.25/0.25/0.25/0.25)
- Flag in output: "Insufficient detail; applying balanced default"
- Still proceed (don't fail)

---

## Example Output

For a SaaS startup project:
```yaml
inferred_industry: "SaaS"
industry_confidence: 0.92

priority_weights:
  scalability: 0.45
  security: 0.15
  performance: 0.20
  velocity: 0.20

axis_scores:
  scalability: 9  # "10M users", "exponential growth"
  security: 3    # "standard compliance"
  performance: 5 # "sub-100ms not critical"
  velocity: 5    # "3-month MVP"

constraints:
  budget_cap: "$500K first year"
  team_size: 6
  timeline_weeks: 12
  existing_stack: ["TypeScript", "Node.js"]

conflicts: []  # No contradictions detected
```

---

## Agent Limitations & Future Extensions

**Current Scope** (Phase 1):
- Keyword-based priority detection only
- No ML-based semantic analysis
- Binary conflict detection (exact/known patterns only)

**Phase 2 Extensions**:
- More nuanced weight calculation (context-aware scoring)
- Predictive constraint checking ("have you considered X?")
- Multi-language requirement document support

**Phase 3 (Optional)**:
- Learn from historical selections (Bayesian update of weights)
- Detect industry-specific compliance gaps
- Suggest priority reordering if contradictions found
