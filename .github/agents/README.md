# MFers Bible Study App - Custom Agents

This directory contains custom GitHub Copilot agents tailored for this project. These agents provide specialized assistance for different aspects of development.

## Available Agents

### Development Agents

| Agent | Description | When to Use |
|-------|-------------|-------------|
| [expert-react-frontend-engineer](expert-react-frontend-engineer.agent.md) | React 19 expert with TypeScript, Vite, Tailwind, shadcn/ui | Building components, hooks, state management |
| [accessibility](accessibility.agent.md) | WCAG 2.1/2.2 expert for inclusive design | Accessibility audits, ARIA implementation |
| [se-ux-ui-designer](se-ux-ui-designer.agent.md) | UX researcher for Jobs-to-be-Done analysis | User journey mapping, design requirements |
| [playwright-tester](playwright-tester.agent.md) | E2E testing specialist | Writing and debugging Playwright tests |

### Planning & Architecture Agents

| Agent | Description | When to Use |
|-------|-------------|-------------|
| [planner](planner.agent.md) | Implementation plan generator | Planning new features or refactoring |
| [adr-generator](adr-generator.agent.md) | Architectural Decision Records creator | Documenting technical decisions |
| [hlbpa](hlbpa.agent.md) | High-Level Big Picture Architect | System documentation, architecture diagrams |

### Quality & Review Agents

| Agent | Description | When to Use |
|-------|-------------|-------------|
| [debug](debug.agent.md) | Systematic debugging assistant | Finding and fixing bugs |
| [janitor](janitor.agent.md) | Tech debt remediation specialist | Code cleanup, simplification |
| [wg-code-sentinel](wg-code-sentinel.agent.md) | Security code reviewer | Security audits, vulnerability checks |
| [critical-thinking](critical-thinking.agent.md) | Assumption challenger | Validating decisions, exploring alternatives |
| [mentor](mentor.agent.md) | Engineering mentor | Learning, guidance, code review |

## How to Use

### In VS Code Chat

1. Open GitHub Copilot Chat (`Ctrl+Shift+I` or `Cmd+Shift+I`)
2. Click on the agent selector (usually shows "Ask" or current mode)
3. Select the agent you want to use from the list
4. The agent will be active for your conversation

### Best Practices

- **Start with planning**: Use `planner` before implementing new features
- **Review with multiple perspectives**: Use `critical-thinking` to challenge assumptions
- **Test accessibility early**: Use `accessibility` during component development
- **Clean as you go**: Use `janitor` periodically to reduce tech debt
- **Document decisions**: Use `adr-generator` for important architectural choices

## Agent Attribution

These agents are based on community agents from [github/awesome-copilot](https://github.com/github/awesome-copilot). Each agent file includes a comment linking to the original source.

## Adding New Agents

To add a new agent:

1. Create a new `.agent.md` file in this directory
2. Include the required frontmatter:
   ```yaml
   ---
   name: 'Agent Name'
   description: 'Brief description of what this agent does'
   model: 'claude-sonnet-4'  # or other model
   tools: ['list', 'of', 'tools']
   ---
   ```
3. Add the agent instructions in markdown below the frontmatter

See [awesome-copilot CONTRIBUTING.md](https://github.com/github/awesome-copilot/blob/main/CONTRIBUTING.md) for detailed guidelines.
