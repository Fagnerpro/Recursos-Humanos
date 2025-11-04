class AIAnalyzer:
    """
    Stub de análise de conteúdo por IA.
    M2: chamar OpenAI (chat/completions) e validar JSON.
    """
    def analyze_response(self, question: str, response: str, position: str) -> dict:
        base = 70.0
        bonus = 10.0 if len((response or "").split()) > 20 else 0.0
        return {
            "relevance": min(100.0, base + bonus),
            "technical_accuracy": base,
            "communication": min(100.0, base + bonus / 2),
            "summary": f"Resposta analisada (stub) para a posição {position}."
        }
