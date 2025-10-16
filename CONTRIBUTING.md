## Contributing

Thanks for wanting to help improve Fortheweebs — small, well-tested changes are easiest to review.

Quick checklist for a PR:

- Fork the repository and create a feature branch.
- Keep changes focused and small (one feature / bugfix per PR).
- Run lint and tests locally before opening the PR:

  ```powershell
  npm install
  npm run lint
  npm test
  ```

- If you change UI behavior, add or update unit tests using Vitest and test-library/react.
- If you intentionally change a snapshot, update with `npm test -- -u` and explain why.
- Add a short description and link to any relevant issue in the PR body.

Maintainers: please prefer small, incremental changes and require tests for behavioral changes.
