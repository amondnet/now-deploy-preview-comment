# Vercel Deployment

> [Vercel](https://vercel.com) is the optimal workflow for frontend teams.
All-in-one: Static and Jamstack deployment, Serverless Functions, and Global CDN.

This action supports building your static site, and deploy to your Vercel project.

- [x] Optionally build your static site.
- [x] Deploy to Vercel.
- [x] Optionally assign a domain to your deployment.
- [x] Comment on pull request.
- [x] Comment on commit.

## Usage

### Inputs

| Input             | Required | Default | Description                                                 |
|-------------------|:--------:|---------|-------------------------------------------------------------|
| vercelToken       | ☑️        |         | Your token at Vercel. See https://vercel.com/account/tokens |
| vercelOrgId       | ☑️        |         | Your Organization ID at Vercel. |
| vercelProjectId   | ☑️        |         | Your Project ID at Vercel. |
| githubToken       | ☑️        |         | Your token at GitHub. See https://github.com/settings/tokens |
| buildOption       |          | false   | If your site requires building. Like `npm run build`. |
| buildSource       |          | `""`    | If your site requires building. Like `examples/nextjs`. |
| buildOutput       |          | `""`    | If your site requires building. Provide the build output folder in the format of `FOLDER-NAME`. Like `public` for Gatsby or `out` for Next.js. |
| buildDomain       |          |         | You can assign a domain to this deployment. Please note that this domain must have been configured in the project. |

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

You can save both values in the secrets setting in your repository as inputs.

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
      - uses: actions/vercel-deployment@0.5.0
        with:
          vercelToken: ${{ secrets.VERCEL_TOKEN }}
          vercelOrgId: ${{ secrets.VERCEL_ORG_ID }}
          vercelProjectId: ${{ secrets.VERCEL_PROJECT_ID }}
          githubToken: ${{ secrets.PAT }}
          buildOption: true
          buildSource: "examples/nextjs"
          buildOutput: "examples/nextjs/out"
          buildDomain: "preview.example.com
```
