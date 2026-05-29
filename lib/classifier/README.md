# lib/classifier

Claude-powered language detection + EN translation + comment classification.

Phase 4:
- Single batched call per N comments (default 20).
- System prompt is prompt-cached: taxonomy + language list + few-shot examples.
- Output schema: `{ commentId, language, languageConfidence, translationEn,
  classifier, classifierConfidence, reason }[]`.
- Writes results in one transaction and emits an `AuditEvent(action=CLASSIFIED,
  actor="auto")` per comment.
