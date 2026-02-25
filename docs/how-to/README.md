# How-To Guides

Quick-reference guides for the Sinister Six Chrome Extension project. Each guide follows the same format: **Purpose > Steps > Verification commands > Common issues**.

## Guides

| Guide                                    | Description                                         |
| ---------------------------------------- | --------------------------------------------------- |
| [setup.md](setup.md)                     | Install dependencies, run locally, common commands  |
| [git-workflow.md](git-workflow.md)       | Branch, commit, push, create PRs, resolve conflicts |
| [prettier.md](prettier.md)               | Run the formatter, fix formatting failures          |
| [eslint.md](eslint.md)                   | Run the linter, fix lint errors                     |
| [jsdoc.md](jsdoc.md)                     | Build API docs with JSDoc                           |
| [troubleshooting.md](troubleshooting.md) | Common issues and fixes                             |

## Adding a new guide

1. Create a new `.md` file in this folder.
2. Use the template below.
3. Add a row to the table above.

### Template

````markdown
# Title

## Purpose

One-sentence description of what this guide covers.

## Steps

1. Step one
2. Step two

## Verification commands

```sh
# Describe what this checks
command here
```
````

## Common issues

| Problem                  | Fix        |
| ------------------------ | ---------- |
| Error message or symptom | What to do |

```

```
