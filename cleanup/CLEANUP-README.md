# Cleanup Documentation

This folder contains automated cleanup notes and a record of changes applied by the automated cleanup branch.

What was done:
- Sanitized `.env.local.example` to remove embedded API keys and replace with placeholders.
- Added architecture and roadmap documents under `docs/`.
- Added an OpenAPI spec for core APIs.

Next steps:
- Review the `docs/` files and adapt any platform-specific assumptions.
- Run the full test suite and linters before pushing changes to remote.
- If ok, create a PR from `cleanup/merge-ready` into `main` and require CI checks.
