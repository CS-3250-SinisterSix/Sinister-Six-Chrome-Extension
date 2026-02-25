# Git Workflow

## Purpose

Standard steps for branching, committing, pushing, and creating pull requests in this repo.

## Steps

### 1. Create a feature branch

Always branch off `develop`, not `main`.

```sh
git checkout develop
git pull origin develop
git checkout -b your-branch-name
```

Use descriptive branch names like `42-add-dark-mode` (issue number + short description).

### 2. Make changes and commit

```sh
git add file1.js file2.js
git commit -m "Add dark mode toggle to popup"
```

Tips:

- Keep commits small and focused.
- Write commit messages in the imperative mood ("Add feature", not "Added feature").
- Only commit the files you changed — avoid `git add .` unless you're sure.

### 3. Push your branch

```sh
git push -u origin your-branch-name
```

The `-u` flag sets up tracking so future pushes only need `git push`.

### 4. Create a pull request

1. Go to the repo on GitHub.
2. Click **Compare & pull request** (GitHub shows a banner after you push).
3. Set the base branch to `develop`.
4. Write a clear title and description.
5. Request reviewers.

### 5. Update a PR after review

```sh
# Make fixes locally, then:
git add changed-files.js
git commit -m "Address review feedback"
git push
```

The PR updates automatically.

### 6. Resolve merge conflicts

```sh
# Update your branch with the latest develop
git checkout develop
git pull origin develop
git checkout your-branch-name
git merge develop
```

If there are conflicts:

1. Open the conflicting files — look for `<<<<<<<`, `=======`, `>>>>>>>` markers.
2. Edit to keep the correct code and remove the markers.
3. Stage and commit:

```sh
git add resolved-file.js
git commit -m "Resolve merge conflicts with develop"
git push
```

## Verification commands

```sh
# Check current branch and status
git branch
git status

# Verify remote is set up
git remote -v

# See recent commits
git log --oneline -5
```

## Common issues

| Problem                                | Fix                                                                                                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fatal: not a git repository`          | Make sure you're in the project folder                                                                                                               |
| Push rejected: "Updates were rejected" | Your branch is behind. Run `git pull origin your-branch-name` first, or merge develop into your branch                                               |
| `Author identity unknown`              | Run `git config user.name "Your Name"` and `git config user.email "you@example.com"`                                                                 |
| Accidentally committed to `develop`    | Create a new branch from your current state: `git checkout -b my-fix`, then reset develop: `git checkout develop && git reset --hard origin/develop` |
| Merge conflicts look overwhelming      | Ask a teammate for help. Conflicts in `package-lock.json` can be resolved by deleting the file and running `npm install`                             |
