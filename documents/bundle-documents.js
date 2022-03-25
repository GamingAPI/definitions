const bundler = require('@asyncapi/bundler');
const {parse, AsyncAPIDocument} = require('@asyncapi/parser');
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
};
bundleDocuments('./rust_server.asyncapi.json', './rust_server_bundle.asyncapi.json');
bundleDocuments('./rust_processor.asyncapi.json', './rust_processor_bundle.asyncapi.json');