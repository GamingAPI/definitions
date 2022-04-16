const {Octokit} = require("octokit");
const{ execSync } = require('child_process');
const { writeFileSync } = require("fs");
const newGame = process.env.newGame;
const accessToken = process.env.accessToken;
const octokit = new Octokit({ auth: accessToken});
const templates = {
  PUBLIC_GAME_API_GO: 'template-public-game-api-go',
  PUBLIC_GAME_API_TS: 'template-public-game-api-ts',
  PUBLIC_GAME_API_CSHARP: 'template-public-game-api-csharp'
}

async function createRepo(name, template){
  await octokit.request('POST /repos/{template_owner}/{template_repo}/generate', {
    template_owner: 'GamingAPI',
    template_repo: template,
    owner: 'GamingAPI',
    name,
    description: 'This is your first repository',
    include_all_branches: false,
    'private': false
  })
}

async function cloneRepo(repo){
  const repoLink = `https://github.com/GamingAPI/${repo}.git`
  execSync(`git clone ${repoLink} ${__dirname}/repository/${repo}`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
  });
}

async function implodeNewRepository(repo, asyncapi_file, asyncapi_template){
  const repoPath = `${__dirname}/repository/${repo}`; 
  writeFileSync(`${repoPath}/customize.json`, `
{
  "ASYNCAPI_FILE": "${asyncapi_file}",
  "ASYNCAPI_TEMPLATE": "${asyncapi_template}"
}
`);
  execSync(`alias gomplate='docker run hairyhenderson/gomplate:stable' && cd ${repoPath} && ./customize`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
  });
}

async function pushChanges(repo){
  const repoPath = `${__dirname}/repository/${repo}`;
  execSync(`cd ${repoPath} && git commit -a -m"refactor: implode initial template copy" && git push https://${accessToken}@github.com/GamingAPI/${repo}.git`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
  });
}

async function setupRepository(game){
  const repo = `${game}-game-api`;
  createRepo(repo, templates.PUBLIC_GAME_API_CSHARP);
  cloneRepo(repo);
  implodeNewRepository(repo, 'rust.asyncapi.json', '@asyncapi/dotnet-nats-template');
  pushChanges(repo);
}
setupRepository(newGame);