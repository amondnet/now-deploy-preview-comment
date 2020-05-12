const core = require("@actions/core")
const github = require("@actions/github")
const exec = require("@actions/exec")

const vercelToken = core.getInput("vercelToken")
const vercelOrgId = core.getInput("vercelOrgId")
const vercelProjectId = core.getInput("vercelProjectId")
const githubToken = core.getInput("githubToken")
const buildOption = core.getInput("buildOption") === "true"
const buildSource = core.getInput("buildSource")
const deploySource = core.getInput("deploySource")
const assignDomain = core.getInput("assignDomain")

let octokit = new github.GitHub(githubToken)
let { eventName, ref, sha, payload } = github.context
let message
ref = ref.replace("refs/heads/", "")
let deploymentUrl

async function run() {
  core.info("--- start ---")
  core.info(JSON.stringify(github.context))

  if (eventName === "push") {
    core.info("Retriving push metadata")
    message = payload.head_commit.message
  } else if (github.context.eventName === "pull_request") {
    core.info("Retriving pull request metadata")
    ref = payload.pull_request.head.ref
    sha = payload.pull_request.head.sha
    const { data: commitData } = await octokit.git.getCommit({
      ...github.context.repo,
      commit_sha: sha,
    })
    message = commitData.message
  }

  if (buildOption) {
    await buildStatic()
  }

  await setVercelEnv()

  deploymentUrl = await vercelDeploy()

  if (assignDomain) {
    await setVercelEnv()
    await assignDomainToDeployment()
  }

  if (github.context.issue.number) {
    core.info("this is related issue or pull_request ")
    await createCommentOnPullRequest()
  } else if (eventName === "push") {
    core.info("this is push event")
    await createCommentOnCommit()
  }

  core.info("---- end ----")
}

async function buildStatic() {
  core.info("[Build starts]")
  let myOutput = ""
  let myError = ""
  const options = {}
  options.listeners = {
    stdout: (data) => {
      myOutput += data.toString()
      core.info(data.toString())
    },
    stderr: (data) => {
      myError += data.toString()
      core.info(data.toString())
    },
  }
  options.cwd = "./" + buildSource
  core.info("Build source is at : " + options.cwd)

  await exec.exec("npx", ["yarn"], options)
  await exec.exec("npx", ["yarn", "build"], options)

  core.info("[Build ends]")
  return
}

async function setVercelEnv() {
  core.info("[Set env starts]")
  if (vercelOrgId) {
    core.exportVariable("VERCEL_ORG_ID", vercelOrgId)
  }
  if (vercelProjectId) {
    core.exportVariable("VERCEL_PROJECT_ID", vercelProjectId)
  }
  core.info("[Set env ends]")
}

async function vercelDeploy() {
  core.info("[Deploy starts]")
  let myOutput = ""
  let myError = ""
  const options = {}
  options.listeners = {
    stdout: (data) => {
      myOutput += data.toString()
      core.info(data.toString())
    },
    stderr: (data) => {
      myError += data.toString()
      core.info(data.toString())
    },
  }
  options.cwd = "./" + deploySource
  core.info("Deployment directory is at : " + options.cwd)

  await exec.exec(
    "npx",
    [
      "vercel",
      "--token",
      vercelToken,
      "-m",
      "githubDeployment=1",
      "-m",
      `githubRepo=${payload.repository.full_name}`,
      "-m",
      `githubCommitRef=${ref}`,
      "-m",
      `githubCommitSha=${sha}`,
      "-m",
      `githubCommitMessage=${payload.head_commit.message}`,
      "-m",
      `githubCommitAuthorLogin=${payload.head_commit.author.username}`,
      "-m",
      `githubCommitAuthorName=${payload.head_commit.author.name}`,
    ],
    options
  )

  core.info("[Deploy ends]")
  return myOutput
}

async function assignDomainToDeployment() {
  core.info("[Assign domain starts]")
  let myOutput = ""
  let myError = ""
  const options = {}
  options.listeners = {
    stdout: (data) => {
      myOutput += data.toString()
      core.info(data.toString())
    },
    stderr: (data) => {
      myError += data.toString()
      core.info(data.toString())
    },
  }

  try {
    await exec.exec(
      "npx",
      ["vercel", "alias", deploymentUrl, assignDomain],
      options
    )
  } catch (error) {
    core.warning("Assigning domain failed with error : " + error)
  }

  core.info("[Assign domain ends]")
  return
}

async function createCommentOnCommit() {
  const body = `<img align="center" width="35" height="35" src="https://raw.githubusercontent.com/xmflsct/action-vercel-deployment/master/src/svgs/vercel.svg">\r\n\r\n<img align="left" width="24" height="24" src="https://raw.githubusercontent.com/xmflsct/action-vercel-deployment/master/src/svgs/info.svg"> This commit ${sha} is built and deployed to [Vercel](https://vercel.com/).\r\n\r\n<img align="left" width="24" height="24" src="https://raw.githubusercontent.com/xmflsct/action-vercel-deployment/master/src/svgs/check-in-circle.svg"> Preview: ${deploymentUrl}\r\n\r\n<img align="left" width="24" height="24" src="https://raw.githubusercontent.com/xmflsct/action-vercel-deployment/master/src/svgs/award.svg"> This commit has been automatically deployed with [vercel-deployment](https://github.com/xmflsct/action-vercel-deployment)`

  await octokit.repos.createCommitComment({
    ...github.context.repo,
    commit_sha: github.context.sha,
    body: body,
  })
}

async function createCommentOnPullRequest() {
  const body = `<img align="center" width="35" height="35" src="https://raw.githubusercontent.com/xmflsct/action-vercel-deployment/master/src/svgs/vercel.svg">\r\n\r\n<img align="left" width="24" height="24" src="https://raw.githubusercontent.com/xmflsct/action-vercel-deployment/master/src/svgs/info.svg"> This commit ${sha} is built and deployed to [Vercel](https://vercel.com/).\r\n\r\n<img align="left" width="24" height="24" src="https://raw.githubusercontent.com/xmflsct/action-vercel-deployment/master/src/svgs/check-in-circle.svg"> Preview: ${deploymentUrl}\r\n\r\n<img align="left" width="24" height="24" src="https://raw.githubusercontent.com/xmflsct/action-vercel-deployment/master/src/svgs/award.svg"> This pull request has been automatically deployed with [vercel-deployment](https://github.com/xmflsct/action-vercel-deployment)`

  await octokit.issues.createComment({
    ...github.context.repo,
    issue_number: github.context.issue.number,
    body: body,
  })
}

run().catch((error) => {
  core.setFailed(error.message)
})
