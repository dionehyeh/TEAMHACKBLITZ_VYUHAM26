# Security & Governance

## Security Model
1. **Organisation Isolation:** Multi-tenancy strictly enforced at the database level with PostgreSQL Row Level Security (RLS).
2. **Permission Guardrails (Section 11):**
   - Access checked before any LLM prompt ingestion.
   - Bounded browser permissions (B0 - B4).
   - Approval required for high-impact actions (sending external email, form submission commitments, financial changes).
3. **Browser Safety:**
   - Isolated ephemeral browser contexts.
   - Domain allowlists and private-network IP blocking (anti-SSRF).
   - Credential and token redaction from LLM contexts and logs.
4. **Data Privacy:**
   - Employee CVs restricted to authorized HR/managers.
   - Human verification before profile updates.
