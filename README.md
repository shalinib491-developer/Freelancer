# Scopewise

A small, local-first prototype of a freelancer scope tracker. The sample project uses fictional data. Scope items, request records and the project rate are stored in this browser with `localStorage`.

The **Phase 3 PoC** view brings the supplied project handover, frozen test protocol, evidence index, and demo timeline together. It labels synthetic results, AI-authored evidence, and measures that remain untested.

## Run locally

Open a terminal in this folder and run:

```powershell
python -m http.server 8000
```

Then open <http://localhost:8000> in a browser. No build step or account is needed.

Use **Agreed scope** to edit the reference deliverables and hourly rate. Use **Log a request** to capture a new client ask, match it to a scope item, and estimate additional effort. Open a request to review or copy a draft change summary. The prototype never sends anything to a client.

The PoC figures are a summary of the supplied evidence package; they are not independent validation. Human manual comparison, human effort timing, real-message accuracy, and adoption remain untested.

To clear the demo data and start over, clear this site's local storage in browser settings.
