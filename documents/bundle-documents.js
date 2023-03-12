// Because the bundler does not work outside of the working directory we have to keep this package here for now: https://github.com/asyncapi/bundler/issues/35
const bundler = require('@asyncapi/bundler');
const fs = require('fs');
const path = require('path');
const asyncFile = process.env.asyncFile;
const filesToBundle = [];

if(asyncFile) {
  filesToBundle.push(asyncFile);
} else {
  filesToBundle.push('rust');
  filesToBundle.push('rust_public');
}

async function bundleDocuments(filePath, outputFile) {
  const fullPath = path.resolve(filePath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const fileContent = JSON.parse(content);
  const bundledDocument = await bundler(
    [fileContent], 
    {
      referenceIntoComponents: false,
    }
  );
  fs.writeFileSync(outputFile, bundledDocument.string());
  console.log(`Done bundling ${fullPath}`);
};
for (const file of filesToBundle) {
  bundleDocuments(`./${file}.asyncapi.json`, `../bundled/${file}.asyncapi.json`);
}