# 🤝 Contributing to CivicOS

Thank you for your interest in contributing to **CivicOS**! We welcome contributions from developers of all skill levels.

---

## 🚀 Quick Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/civicos.git
   cd Civicos
   ```

2. **Install dependencies using Bun:**
   ```bash
   bun install
   ```

---

## 🌿 Git Branching Convention

We use topic-focused branches for all contributions. Avoid working directly on `main`.

| Branch Type | Naming Pattern | Example |
| :--- | :--- | :--- |
| **Documentation** | `docs/<short-description>` | `docs/roadmap-update`, `docs/setup-guide` |
| **New Feature** | `feature/<feature-name>` | `feature/citizen-search`, `feature/auth-jwt` |
| **Bug Fix** | `fix/<issue-name>` | `fix/login-validation`, `fix/table-pagination` |

---

## 💬 Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(scope): add new feature`
- `fix(scope): fix bug`
- `docs(scope): update documentation`
- `style(scope): format code or adjust UI styles`
- `refactor(scope): refactor logic without changing behavior`

---

## 📩 Pull Request Process

1. Create a focused branch (`git checkout -b docs/my-update`).
2. Commit your changes with clear commit messages.
3. Push to your fork and submit a Pull Request to `develop` or `main`.
4. Ensure all TypeScript type checks and linters pass before requesting review.

Thank you for building CivicOS with us! 🏛️
