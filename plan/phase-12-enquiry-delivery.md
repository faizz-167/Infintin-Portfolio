# Phase 12 — Enquiry Delivery Integration (Deferred)

**Status:** DEFERRED (client decision pending, 2026-10-13)
**Depends on:** Phase 10 (10.7), client decisions on transport, recipient, retention, spam protection
**Outputs:** production `EnquiryTransport` implementation

## Objective

Connect the enquiry form to a confirmed delivery channel so that a success message is shown only after the server confirms receipt (PRD §8.7).

## Subtasks

| ID | Subtask | Status |
| --- | --- | --- |
| 12.1 | Client chooses transport (Server Action + email / third-party endpoint / mailto) | DEFERRED |
| 12.2 | Confirm recipient, retention, consent wording, spam protection | DEFERRED |
| 12.3 | Implement chosen `EnquiryTransport` | DEFERRED |
| 12.4 | Rate limiting + honeypot verification server-side (if server transport) | DEFERRED |
| 12.5 | End-to-end delivery test and failure-path test | DEFERRED |

## Execution plan

1. Present options with trade-offs (already listed in Status.md open questions).
2. Implement behind the existing interface; no UI change except success copy.
3. Server Action path: validate with the same schema as the client, verify honeypot, send via the chosen provider, return typed result; secrets in environment variables only.
4. Test: valid submission arrives at the recipient; provider failure shows error state with values preserved.

## Validation criteria

- [ ] Real submission received at the confirmed recipient.
- [ ] Simulated provider failure shows the error state and preserves values.
- [ ] Success is shown only after a confirmed response.
- [ ] No secrets in client bundle (`grep` built assets for key prefix).
- [ ] Status.md updated.
