# Scroll color branch merge and rollback

- Merged on: 27 October 2026
- Target branch: `main`
- Source branch: `feature/scroll-color-optimization`
- **Merge commit:** `1c70094e360a7670a4e4e439b0de765f22b9ce7a`
- First parent (main before this merge): `b4b0fa5945b1ac1696a1d4815fad8d8e9b0b5141`
- Second parent (merged feature tip): `c28bf9a17966e560902dfad452582b681d5ab937`

## Changes covered by this merge

This merge contains only the five commits from the scroll color optimization branch:

1. `8709cc3` — Shared scroll-driven homepage color transitions.
2. `a201895` — Cached calculations, fewer DOM updates, and scroll regression tests.
3. `5ecca22` — Fixed background canvas and off-screen video pausing.
4. `f84d54b` — Capital section performance improvements and earlier wide-card reveal.
5. `c28bf9a` — CTA contrast and header readability during transitions.

Includes the generated capital background PNG, transition configuration, animation hooks, CTA/header styling, and associated tests. The earlier AI footer work at `b4b0fa5` is part of the first parent and is not removed by reverting this merge.

## Revert only this branch's changes from main

Start with a clean working tree. Run these commands from the frontend repository:

```powershell
git switch main
git pull --ff-only origin main
git revert -m 1 1c70094e360a7670a4e4e439b0de765f22b9ce7a
```

`-m 1` keeps the main-side parent and reverses this merge's changes in a new commit. It preserves unrelated work already on main and does not rewrite history. If later commits edit the same files, resolve conflicts while preserving those later unrelated changes; use `git revert --continue` after staging the resolutions, or `git revert --abort` to cancel.

Review the resulting diff and run the appropriate checks before pushing. Push only when the user explicitly authorizes it:

```powershell
git push origin main
```

Do not reset main to the first parent or force-push: that could remove later unrelated commits. Keep this Markdown file as the rollback record; it is added in a separate documentation commit after the merge. Reverting the merge alone intentionally leaves this record available.

After rollback, merging the same feature tip again will not reapply its changes automatically. To restore the feature later, revert the rollback commit (after reviewing any subsequent edits).
