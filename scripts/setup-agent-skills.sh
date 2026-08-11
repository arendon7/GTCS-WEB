#!/usr/bin/env bash
set -euo pipefail

npx skills@latest add emilkowalski/skills
npx impeccable install --providers=codex --scope=project
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
npx skills add vercel-labs/agent-skills@react-best-practices
npx skills add vercel-labs/agent-skills@web-design-guidelines

echo "Review PRODUCT.md, DESIGN.md and AGENTS.md before invoking skills."
