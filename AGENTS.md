## Project entry

- Start with `CONTEXT.md` and load only the domain context needed for the task.
- `POS Memory/` owns canonical business and domain documentation. Confirm current behavior in source and tests before changing code.
- Authority order: confirmed stakeholder requirements, canonical POS Memory, accepted Rules, current runtime source, Graphify structural analysis, then historical phase notes.
- Graphify shows structural relationships; it cannot define or override business requirements.
- Never activate a deferred feature unless the current user request explicitly brings it into scope.
- Preserve `users.role` as the authorization boundary; business Privileges do not grant Admin access.
- Tooling and context work must not change POS business behavior.
- After a completed development phase, update the relevant canonical documents, `HandOff.md`, phase context, and deferred register.
- Prefer the existing architecture and dependencies over new abstractions.
- `graphify-out/graph.json` and `graph.html` are reproducible local artifacts and are ignored; `GRAPH_REPORT.md` is the compact tracked summary.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- `graphify-out/graph.json` and `graph.html` are local generated files. Regenerate them when missing or stale; do not add them to commits.
