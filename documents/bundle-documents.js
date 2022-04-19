// Because the bundler does not work outside of the working directory we have to keep this package here for now: https://github.com/asyncapi/bundler/issues/35
const bundler = require('@asyncapi/bundler');
const fs = require('fs');
const path = require('path');

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
bundleDocuments('./rust.asyncapi.json', '../bundled/rust.asyncapi.json');
bundleDocuments('./rust_public.asyncapi.json', '../bundled/rust_public.asyncapi.json');