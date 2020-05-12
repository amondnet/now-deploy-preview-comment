# Vercel Deployment

![Tests](https://github.com/xmflsct/action-vercel-deployment/workflows/Tests/badge.svg?branch=master)

This action supports building your static site (optionally through [GitHub Actions](https://github.com/features/actions)), and deploy to your Vercel project.

- [x] Optionally build your static site depending on your setup.
- [x] Deploy to Vercel.
- [x] Optionally assign a domain to your deployment.
- [x] Comment on commit with deployment URL.
- [x] Comment on pull request with deployment URL.

## Usage

### Inputs

| Input            | Required | Default | Description                                                                                                         |
|------------------|:--------:|---------|---------------------------------------------------------------------------------------------------------------------|
| vercelToken      | [x]      |         | Your token at Vercel. See https://vercel.com/account/tokens                                                         |
| vercelOrgId      | [x]      |         | Your Organization ID at Vercel.                                                                                     |
| vercelProjectId  | [x]      |         | Your Project ID at Vercel.                                                                                          |
| githubToken      | [x]      |         | Your token at GitHub. See https://github.com/settings/tokens                                                        |
| buildOption      |          | `false` | If you would like to build through GitHub Actions inatead of Vercel.                                                |
| buildSource      |          | `""`    | If building through GitHub Actions, a source directory may be supplied.                                             |
| deploySource     |          | `""`    | If building through GitHub Actiosn, an output directory may be supplied.                                            |
| assignDomain     |          |         | You can assign a domain to this deployment. Please note that this domain must have been configured in the project.  |

### Disable Vercel for GitHub

> The ZEIT Now for GitHub integration automatically deploys your GitHub projects with ZEIT Now, providing Preview Deployment URLs, and automatic Custom Domain updates.
[link](https://zeit.co/docs/v2/git-integrations)

Set `github.enabled: false` in now.json

```json
{
  "github": {
    "enabled": false
  }
}
```
When set to false, `Vercel for GitHub` will not deploy the given project regardless of the GitHub app being installed.

### Project Linking

You should link a project via [Vercel CLI](https://vercel.com/download) in locally.

When running `vercel` in a directory for the first time, [Vercel CLI](https://vercel.com/download) needs to know which scope and project you want to deploy your directory to. You can choose to either link an existing project or to create a new one.

```bash
vercel
```

Once set up, a new `.vercel` directory will be added to your directory. The `.vercel/project.json` file contains both the organization(`orgId`) and project(`projectId`) id of your project.

```json
{"orgId":"example_org_id","projectId":"example_project_id"}
```

You can save both values in the secrets [input setting](#inputs) in your repository as inputs.

### Github Actions

* This is a complete `.github/workflow/deploy.yml` example.

```yaml
name: deploy website
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v1
        with:
          node-version: "12.x"
      - name: Install dependencies
        run: yarn
      - uses: actions/vercel-deployment@0.5.1
        with:
          vercelToken: ${{ secrets.VERCEL_TOKEN }}
          vercelOrgId: ${{ secrets.VERCEL_ORG_ID }}
          vercelProjectId: ${{ secrets.VERCEL_PROJECT_ID }}
          githubToken: ${{ secrets.PAT }}
          sourceDirectory: "src"
          assignDomain: "preview.example.com"
        env:
          YOUR_ENV_1: ${{ secrets.YOUR_ENV_1 }}
          YOUR_ENV_2: ${{ secrets.YOUR_ENV_2 }}
```
