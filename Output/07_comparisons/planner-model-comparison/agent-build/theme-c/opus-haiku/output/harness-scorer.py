#!/usr/bin/env python3
"""
Tech Selection Agent Group Harness
Integrates RequirementAnalyzer and TechnologyProposal outputs.
Performs scoring, tradeoff analysis, and generates recommendations.
"""

import json
import sys
from dataclasses import dataclass
from typing import Dict, List, Tuple
from datetime import datetime


@dataclass
class ScoringCell:
    """Individual scoring matrix cell"""
    axis: str
    candidate: str
    score: int
    rationale: str


class TechSelectionHarness:
    """Main harness for tech selection analysis"""

    def __init__(self):
        self.scoring_matrix = []
        self.weights = {}
        self.recommendations = []

    def integrate_analyses(self, requirement_analysis: dict,
                          technology_proposal: dict) -> dict:
        """Integrate requirement and technology outputs"""
        return {
            "analysis_date": datetime.now().isoformat(),
            "requirements": requirement_analysis,
            "candidates": technology_proposal["candidates"],
            "priority_axes": requirement_analysis["priority_axes"]
        }

    def calculate_weights(self, priority_axes: Dict) -> Dict[str, float]:
        """Calculate normalized weights from priority axes scores"""
        total = sum(axis["score"] for axis in priority_axes.values())
        if total == 0:
            # Equal weight fallback
            return {axis: 0.25 for axis in priority_axes.keys()}
        return {axis: axis_data["score"] / total
                for axis, axis_data in priority_axes.items()}

    def score_candidate(self, candidate: dict, priority_axes: Dict) -> Tuple[int, str]:
        """Score technology candidate against priority axes (0-10)"""
        candidate_name = candidate.get("set_name", "Unknown")
        language = candidate.get("language", "")
        framework = candidate.get("framework", "")

        # Scoring logic based on priority axes and candidate properties
        scores = {}

        # Scalability scoring
        scalability_score = 5
        if "Node.js" in language or "Java" in language or "Go" in language:
            scalability_score = 8
        elif "Rust" in language:
            scalability_score = 9
        elif "Python" in language:
            scalability_score = 6
        elif "Ruby" in language or "JavaScript" in language:
            scalability_score = 5
        scores["scalability"] = scalability_score

        # Security scoring
        security_score = 5
        if "Rust" in language or "Java" in language:
            security_score = 9
        elif "Go" in language:
            security_score = 8
        elif "Python" in language:
            security_score = 7
        elif "Node.js" in language:
            security_score = 6
        scores["security"] = security_score

        # Performance scoring
        performance_score = 5
        if "Rust" in language or "C++" in language:
            performance_score = 10
        elif "Go" in language:
            performance_score = 9
        elif "Java" in language or "Node.js" in language:
            performance_score = 7
        elif "Python" in language:
            performance_score = 5
        scores["performance"] = performance_score

        # Development speed scoring
        speed_score = 5
        if "Python" in language or "JavaScript" in language or "Ruby" in language:
            speed_score = 9
        elif "Go" in language or "Java" in language:
            speed_score = 7
        elif "Rust" in language or "C++" in language:
            speed_score = 3
        scores["development_speed"] = speed_score

        # Calculate weighted total
        weights = self.calculate_weights(priority_axes)
        total_weighted = sum(
            scores.get(axis, 5) * weights.get(axis, 0.25)
            for axis in priority_axes.keys()
        )

        return int(total_weighted), candidate_name

    def generate_scoring_matrix(self, candidates: List[dict],
                               priority_axes: Dict) -> str:
        """Generate scoring matrix table in Markdown"""
        matrix_rows = []
        matrix_rows.append("| 軸 / 候補 | " +
                          " | ".join(f"{c['set_name']}" for c in candidates[:3]) +
                          " |")
        matrix_rows.append("|" + "-" * 15 + "|" +
                          "|".join(["-" * 25] * min(3, len(candidates))) + "|")

        for axis in priority_axes.keys():
            row = f"| **{axis.replace('_', ' ').title()}** |"
            for candidate in candidates[:3]:
                lang = candidate.get("language", "")
                if "Rust" in lang:
                    score = 10 if axis == "performance" else 9
                elif "Go" in lang:
                    score = 9 if axis in ["scalability", "performance"] else 8
                elif "Java" in lang:
                    score = 8 if axis == "scalability" else 7
                elif "Python" in lang:
                    score = 9 if axis == "development_speed" else 6
                else:
                    score = 7
                row += f" {score} |"
            matrix_rows.append(row)

        return "\n".join(matrix_rows)

    def generate_tradeoff_analysis(self, candidates: List[dict]) -> str:
        """Generate tradeoff analysis in ◎ and ××format"""
        analysis = []
        for i, candidate in enumerate(candidates[:3], 1):
            name = candidate.get("set_name", "Unknown")
            analysis.append(f"\n**{i}. {name}**\n")

            pros = candidate.get("pros", [])
            for pro in pros[:2]:
                analysis.append(f"  ◎ {pro}")

            cons = candidate.get("cons", [])
            for con in cons[:2]:
                analysis.append(f"  ×× {con}")

        return "\n".join(analysis)

    def recommend_stack(self, integration_result: dict) -> Tuple[dict, str]:
        """Generate final recommendation"""
        candidates = integration_result.get("candidates", [])
        priority_axes = integration_result.get("priority_axes", {})

        if not candidates:
            return {}, "No candidates available for recommendation"

        # Score each candidate
        scored = [(self.score_candidate(c, priority_axes), c)
                  for c in candidates]
        scored.sort(key=lambda x: x[0][0], reverse=True)

        best_score, best_candidate = scored[0]
        recommendation = {
            "recommended_stack": {
                "language": best_candidate.get("language"),
                "framework": best_candidate.get("framework"),
                "database": best_candidate.get("database"),
                "cloud": best_candidate.get("cloud")
            },
            "justification": best_candidate.get("justification"),
            "weighted_score": best_score,
            "ranking": [(s[0][0], c.get("set_name")) for s, c in scored[:3]]
        }

        rationale = f"選定根拠: {best_candidate.get('justification', 'N/A')}"
        return recommendation, rationale

    def generate_report(self, requirement_analysis: dict,
                       technology_proposal: dict) -> str:
        """Generate complete Markdown report"""
        integration = self.integrate_analyses(requirement_analysis,
                                             technology_proposal)
        candidates = integration["candidates"]
        priority_axes = integration["priority_axes"]
        recommendation, rec_rationale = self.recommend_stack(integration)

        report = []
        report.append("# 技術選定レポート\n")

        # Executive Summary
        report.append("## Executive Summary\n")
        best_stack = recommendation.get("recommended_stack", {})
        report.append(
            f"推奨テック スタック: **{best_stack.get('language')} + "
            f"{best_stack.get('framework')} + {best_stack.get('database')}**\n"
            f"スコア: {recommendation.get('weighted_score')}/10\n"
        )

        # Requirements Analysis
        report.append("## 要件分析\n")
        for axis, data in priority_axes.items():
            score = data.get("score", 0)
            reason = data.get("reason", "N/A")
            report.append(f"- **{axis.replace('_', ' ').title()}**: {score}/10 ({reason})\n")

        # Candidates
        report.append("## 候補テック スタック\n")
        for i, candidate in enumerate(candidates[:3], 1):
            name = candidate.get("set_name", "Unknown")
            justification = candidate.get("justification", "")
            report.append(f"\n### {i}. {name}\n")
            report.append(f"{justification}\n")

        # Scoring Matrix
        report.append("\n## スコアリング表\n")
        report.append(self.generate_scoring_matrix(candidates, priority_axes))
        report.append("\n")

        # Tradeoff Analysis
        report.append("\n## トレードオフ分析\n")
        report.append(self.generate_tradeoff_analysis(candidates))
        report.append("\n")

        # Final Recommendation
        report.append("\n## 最終推奨\n")
        report.append(f"**言語**: {best_stack.get('language')}\n")
        report.append(f"**フレームワーク**: {best_stack.get('framework')}\n")
        report.append(f"**データベース**: {best_stack.get('database')}\n")
        report.append(f"**クラウド**: {best_stack.get('cloud')}\n")
        report.append(f"\n**選定理由**: {rec_rationale}\n")

        report.append("\n## 次ステップ\n")
        report.append("1. チームに提案技術の学習計画を立案\n")
        report.append("2. PoC（Proof of Concept）実装で検証\n")
        report.append("3. 4週間後にレビュー・調整\n")

        return "".join(report)


def main():
    """Main entry point"""
    if len(sys.argv) > 2:
        req_file = sys.argv[1]
        tech_file = sys.argv[2]

        with open(req_file) as f:
            requirement_analysis = json.load(f)
        with open(tech_file) as f:
            technology_proposal = json.load(f)

        harness = TechSelectionHarness()
        report = harness.generate_report(requirement_analysis,
                                        technology_proposal)
        print(report)
    else:
        print("Usage: python harness-scorer.py <requirement_json> "
              "<proposal_json>")


if __name__ == "__main__":
    main()
