// Based on https://json-schema.org/understanding-json-schema/reference/string.html#dates-and-times
export default (properties, _, { path }) => {
  const results = [];
  for (const [propertyName, property] of Object.entries(properties)) {
    const formats = ["date-time", "time", "date"];
    const formatsForMessage = formats.map(format => `"${format}"`).join(',');
    if(property.format && formats.includes(property.format)) {
      const lastThreeChars = propertyName.slice(propertyName.length-3, propertyName.length);
      if(lastThreeChars !== '_at'){
        results.push({
          message: `Formats ${formatsForMessage} MUST end with "_at". Expected property "${propertyName}" to be called "${propertyName}_at"`,
          path: [...path, propertyName],
        });
      }
    }
  }
  return results;
};