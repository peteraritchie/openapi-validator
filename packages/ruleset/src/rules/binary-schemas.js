const { oas3 } = require('@stoplight/spectral-formats');
const { binarySchemas } = require('../functions');
const { schemas } = require('../collections');

// 1. Parameters should not contain binary (type: string, format: binary) values.
// 2. JSON request bodies should not contain binary (type: string, format: binary) values.
// 3. JSON response bodies should not contain binary (type: string, format: binary) values.
module.exports = {
  description:
    'Checks that binary schemas are used only in the proper places within an API definition.',
  message: '{{error}}',
  formats: [oas3],
  given: schemas,
  severity: 'warn',
  resolved: true,
  then: {
    function: binarySchemas
  }
};
