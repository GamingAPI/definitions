const { Octokit } = require("octokit");
const { execSync } = require('child_process');
const libsodium = require('libsodium-wrappers');
const games = require('../../games');
const { writeFileSync } = require("fs");
const { getCsharpConfigFile } = require("./setup_csharp");
const { getTypeScriptConfigFile } = require("./setup_typescript");
const accessToken = process.env.ghToken;
const octokit = new Octokit({ auth: accessToken });

const secrets = {
  NUGET_AUTH_TOKEN: process.env.nugetAuthToken,
  GH_TOKEN: accessToken,
  NPM_TOKEN: process.env.npmToken
}

function implodeNewRepository(repo, configFile) {
  const repoPath = `${__dirname}/repository/${repo}`;
  writeFileSync(`${repoPath}/customize.json`, configFile);
  execSync(`cd ${repoPath} && chmod +x ./customize && ./customize`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
  });
}

function pushChanges(repo, commitMessage) {
  const repoPath = `${__dirname}/repository/${repo}`;
  try {
    execSync(`cd ${repoPath} && git add -A && git commit -a -m"${commitMessage}" && git push https://${accessToken}@github.com/GamingAPI/${repo}.git`, {
      stdio: [0, 1, 2], // we need this so node will print the command output
    });
  } catch(e) {
    console.log(`Nothing to commit for ${repo}`);
    console.error(e);
  }
}

function cloneRepo(repo) {
  const repoLink = `https://github.com/GamingAPI/${repo}.git`
  execSync(`git clone ${repoLink} ${__dirname}/repository/${repo}`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
  });
}

function updateRepoWithTemplate(repo, template) {
  const templateLink = `https://github.com/GamingAPI/${template}/tarball/main`;
  const cmd = `curl -o ./${template}.tar.gz -LJ ${templateLink} && tar -C ${__dirname}/repository/${repo} --strip=1 -xzvf ${template}.tar.gz `;
  execSync(cmd, {
    stdio: [0, 1, 2], // we need this so node will print the command output
  });
}

function cleanUp(repo) {
  const repoPath = `${__dirname}/repository/${repo}`;
  execSync(`rm -rf ${repoPath}`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
  });
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
async function setSecret(repo, secret, secretName) {
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

async function setupRepo(name, template, description, configFile) {
  let newRepo = false;
  let commitMessage = 'refactor: re-add template';
  try{
    await octokit.request('GET /repos/{owner}/{repo}', {
      owner: 'GamingAPI',
      repo: name
    });
  } catch(e) {
    newRepo = true;
    commitMessage = 'refactor: implode template';
    //Repository was not created, lets start from scratch
    await octokit.request('POST /repos/{template_owner}/{template_repo}/generate', {
      template_owner: 'GamingAPI',
      template_repo: template,
      owner: 'GamingAPI',
      name,
      description,
      include_all_branches: false,
      'private': false
    });
  }

  cloneRepo(name);
  if (!newRepo) {
    //Repository already exist, time to upgrade it with the new template code
    console.log(`${name} already exist, updating repo with new template code`);
    updateRepoWithTemplate(name, template);
  }
  implodeNewRepository(name, configFile);
  pushChanges(name, commitMessage);
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

async function setup() {

  // Setup all relevant stuff for games
  for (const [game, gameConfig] of Object.entries(games)) {
    console.log(`Setting up ${game}`);
    //Setup all repositories
    for (const repository of gameConfig.repos) {
      let configFile;
      if (repository.template.name === 'template-api-csharp') {
        configFile = getCsharpConfigFile(repository.asyncapiFile, repository.projectName, `https://github.com/GamingAPI/${repository.name}.git`);
      } else if (repository.template.name === 'template-api-ts') {
        configFile = getTypeScriptConfigFile(repository.asyncapiFile, repository.name, repository.description);
      } else {
        throw new Error("Template not recognized");
      }
      await setupRepo(repository.name, repository.template.name, repository.description, configFile);

      // Create Nuget token for releases
      for (const secret of repository.template.secrets) {
        if (secrets[secret] !== undefined) {
          //await setSecret(repository.name, secrets[secret], secret);
        } else {
          throw new Error("Expected secret not found");
        }
      }
      // Update repo with some standard meta data
      await updateRepository(repository.name, gameConfig.website);
    }
  }
}
setup();