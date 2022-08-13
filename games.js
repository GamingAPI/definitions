
function toPascalCase(s) {
  return s.replace(/(\w)(\w*)/g, function (g0, g1, g2) {
    return g1.toUpperCase() + g2.toLowerCase();
  });
};

const templates = {
  API_TS: {
    name: 'template-api-ts',
    secrets: [
      'NPM_TOKEN',
      'GH_TOKEN'
    ]
  },
  API_CSHARP: {
    name: 'template-api-csharp',
    secrets: [
      'NUGET_AUTH_TOKEN'
    ]
  }
}

function getGameLibraries(game) {
  return [
    {
      template: templates.API_CSHARP,
      name: `${game}-csharp-game-api`,
      projectName: `${toPascalCase(game)}GameAPI`,
      description: `Game API library for ${game}`,
      asyncapiFile: `${game}.asyncapi.json`,
    },
    {
      template: templates.API_CSHARP,
      name: `${game}-csharp-public-api`,
      projectName: `${toPascalCase(game)}PublicAPI`,
      description: `C# public API wrapper for ${game}`,
      asyncapiFile: `${game}_public.asyncapi.json`
    },
    {
      template: templates.API_TS,
      name: `${game}-ts-public-api`,
      description: `TypeScript public API wrapper for ${game}`,
      asyncapiFile: `${game}_public.asyncapi.json`
    }
  ]
}

module.exports = {
  "rust": {
    website: 'https://gamingapi.org/platform/games/rust',
    repos: getGameLibraries("rust")
  }
};