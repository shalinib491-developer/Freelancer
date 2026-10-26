# Scopewise

A small, local-first prototype of a freelancer scope tracker. The sample project uses fictional data. Scope items, request records and the project rate are stored in this browser with `localStorage`.

## Run locally

Open a terminal in this folder and run:

```powershell
python -m http.server 8000
```

Then open <http://localhost:8000> in a browser. No build step or account is needed.

Use **Agreed scope** to edit the reference deliverables and hourly rate. Use **Log a request** to capture a new client ask, match it to a scope item, and estimate additional effort. Open a request to review or copy a draft change summary. The prototype never sends anything to a client.

To clear the demo data and start over, clear this site's local storage in browser settings.
