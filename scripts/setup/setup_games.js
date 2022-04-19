const {Octokit} = require("octokit");
const{ execSync } = require('child_process');
const libsodium = require('libsodium-wrappers');
const { writeFileSync } = require("fs");
const newGame = process.env.newGame;
const accessToken = process.env.accessToken;
const octokit = new Octokit({ auth: accessToken});

const secrets = {
  NUGET_AUTH_TOKEN: process.env.nugetAuthToken,
  GH_TOKEN: process.env.ghToken,
  NPM_TOKEN: process.env.npmToken
}

const templates = {
  API_GO: 'template-api-go',
  API_TS: 'template-api-ts',
  API_CSHARP: 'template-api-csharp'
}

async function getOrgSecret() {
  const response = await octokit.request('GET /orgs/{owner}/actions/secrets/public-key', {
    owner: 'GamingAPI'
  })
  return {
    key_id: response.data.key_id,
    key: response.data.key
  }
}
/**
 * Encrypt a secret using your public key https://github.com/settings/ssh
 */
async function setSecret(repo, secret, secretName){
  const publicKey = await getOrgSecret();
  // Convert the message and key to Uint8Array's (Buffer implements that interface)
  const messageBytes = Buffer.from(secret);
  const publicKeyBuffer = Buffer.from(publicKey.key, 'base64');

  await libsodium.ready;
  const encryptedBytes = libsodium.crypto_box_seal(messageBytes, publicKeyBuffer);

  // Base64 the encrypted secret
  const encryptedValue = Buffer.from(encryptedBytes).toString('base64');

  await octokit.request('PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}', {
    owner: 'GamingAPI',
    repo,
    secret_name: secretName,
    encrypted_value: encryptedValue,
    key_id: publicKey.key_id
  })
}

function cloneRepo(repo){
  const repoLink = `https://github.com/GamingAPI/${repo}.git`
  execSync(`git clone ${repoLink} ${__dirname}/repository/${repo}`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
  });
}
function getCsharpConfigFile(asyncapi_file){
  return ` 
{
  "ASYNCAPI_FILE": "${asyncapi_file}"
}`
}

function getTypeScriptConfigFile(asyncapi_file, repo, repo_description){
  return ` 
{
  "ASYNCAPI_FILE": "${asyncapi_file}",
  "REPOSITORY_NAME": "${repo}",
  "REPOSITORY_DESCRIPTION": "${repo_description}",
}`
}
function implodeNewRepository(repo, configFile){
  const repoPath = `${__dirname}/repository/${repo}`; 
  writeFileSync(`${repoPath}/customize.json`, configFile);
  execSync(`cd ${repoPath} && chmod +x ./customize && ./customize`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
  });
}

function pushChanges(repo){
  const repoPath = `${__dirname}/repository/${repo}`;
  execSync(`cd ${repoPath} && git add -A && git commit -a -m"refactor: implode initial template" && git push https://${accessToken}@github.com/GamingAPI/${repo}.git`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
  });
}

function cleanUp(repo){
  const repoPath = `${__dirname}/repository/${repo}`;
  execSync(`rm -rf ${repoPath}`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
  });
}

async function createRepo(name, template, description, configFile){
  await octokit.request('POST /repos/{template_owner}/{template_repo}/generate', {
    template_owner: 'GamingAPI',
    template_repo: template,
    owner: 'GamingAPI',
    name,
    description,
    include_all_branches: false,
    'private': false
  });
  cloneRepo(name);
  implodeNewRepository(name, configFile);
  pushChanges(name);
  cleanUp(name);
}

async function updateRepository(repo, website) {
  await octokit.request('PATCH /repos/{owner}/{repo}', {
    owner: 'GamingAPI',
    repo: repo,
    homepage: website,
    allow_squash_merge: true,
    allow_merge_commit: false,
    allow_rebase_merge: false
  });
}

async function setupCsharpLibrary(repo, description, asyncapiFile, website){
  const configFile = getCsharpConfigFile(asyncapiFile);
  await createRepo(repo, templates.API_CSHARP, description, configFile);
  // Create Nuget token for releases
  await setSecret(repo, secrets.NUGET_AUTH_TOKEN, 'NUGET_AUTH_TOKEN');
  // Update repo with some standard meta data
  await updateRepository(repo, website);
}

async function setupTypeScriptLibrary(repo, description, asyncapiFile, website){
  const configFile = getTypeScriptConfigFile(asyncapiFile, repo, description);
  await createRepo(repo, templates.API_TS, description, configFile);
  // Create Nuget token for releases
  await setSecret(repo, secrets.NPM_TOKEN, 'NPM_TOKEN');
  await setSecret(repo, secrets.GH_TOKEN, 'GH_TOKEN');
  // Update repo with some standard meta data
  await updateRepository(repo, website);
}

async function setupGameApiLibrary(game) {
  const developerPlatformLink = `https://gamingapi.org/platform/games/${game}`;
  await setupCsharpLibrary(`${game}-csharp-game-api`, `Game API library for ${game}`, `${game}.asyncapi.json`, developerPlatformLink);
  await setupCsharpLibrary(`${game}-csharp-public-api`, `C# public API wrapper for ${game}`, `${game}_public.asyncapi.json`, developerPlatformLink);
  await setupTypeScriptLibrary(`${game}-ts-public-api`, `TypeScript public API wrapper for ${game}`, `${game}_public.asyncapi.json`, developerPlatformLink);
}

//Setup game api library
setupGameApiLibrary(newGame);
//Setup public game API C#
//Setup public game API TS
//Setup public game API Go