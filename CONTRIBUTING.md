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

---

# Fortheweebs Contributor Guide

Welcome to Fortheweebs—an immortal remix protocol and creator-first platform. This guide will help you get started contributing to the codebase, testing slabs, and expanding the myth.

---

## 🔧 Setup

1. Clone the repo:

```bash
git clone https://github.com/fortheweebs/protocol.git
```

2. Install dependencies:

```bash
npm install
```

3. Copy and configure environment variables:

```bash
cp .env.example .env
# Edit .env to set your keys and config
```

4. Start the development server:

```bash
npm run dev
```

---

## 🧪 Testing

- Run all unit and integration tests:

```bash
npm test
```

- For end-to-end tests (Cypress):

```bash
npx cypress open
```

---

## 🚀 Contributing

- Fork the repo and create a feature branch.
- Make your changes and add tests.
- Run `npm run lint` to check code style.
- Commit and push your branch.
- Open a pull request with a clear description.

---

## 📚 Resources

- See `API_REFERENCE.md` for endpoint docs.
- See `README.md` for project overview.
- See `CONTRIBUTING.md` for detailed contribution steps.

---
