const { oas3 } = require('@stoplight/spectral-formats');
const { paginationStyle } = require('../functions');
const { paths } = require('../collections');

module.exports = {
  description: 'List operations should have correct pagination style',
  message: '{{error}}',
  given: paths,
  severity: 'warn',
  formats: [oas3],
  resolved: true,
  then: {
    function: paginationStyle
  }
};
