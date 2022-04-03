function snake_case_string(str) {
  return str && str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(s => s.toLowerCase())
    .join('_');
}

export default (properties, _, { path }) => {
  const results = [];
  for (const [property, _] of Object.entries(properties)) {
    const expectedPropertyName = snake_case_string(property);
    if (property !== expectedPropertyName) {
      results.push({
        message: `Property MUST follow snake-case. Expected property "${property}" to be called "${expectedPropertyName}"`,
        path: [...path, property],
      });
    }
  }
  return results;
};