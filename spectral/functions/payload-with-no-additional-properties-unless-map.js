export default (jsonObject, _, { path }) => {
  const results = [];
  if(jsonObject.properties !== undefined && jsonObject.additionalProperties !== false) {
    results.push({
      message: `Object with properties should not also define additionalProperties`,
      path: [...path, propertyName],
    });
  }
  return results;
};