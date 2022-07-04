// Because the bundler does not work outside of the working directory we have to keep this package here for now: https://github.com/asyncapi/bundler/issues/35
const bundler = require('@asyncapi/bundler');
const fs = require('fs');
const path = require('path');
const asyncFile = process.env.asyncFile;

async function bundleDocuments(filePath, outputFile) {
  const fullPath = path.resolve(filePath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const fileContent = JSON.parse(content);
  const bundledDocument = await bundler(
    [fileContent]
  );
  fs.writeFileSync(outputFile, bundledDocument.string());
  console.log(`Done bundling ${fullPath}`);
};
bundleDocuments(`./${asyncFile}.asyncapi.json`, `../bundled/${asyncFile}.asyncapi.json`);