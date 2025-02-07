const {
  isBinarySchema,
  isJsonMimeType,
  pathMatchesRegexp
} = require('../utils');

module.exports = function(schema, _opts, { path }) {
  return binarySchemaCheck(schema, path);
};

const debugEnabled = false;
function debug(msg) {
  if (debugEnabled) {
    console.log(msg);
  }
}

/**
 * This function implements the 'binary-schemas' rule which makes sure that
 * binary schemas are used only in the proper places within the API definition.
 * Specifically this rule performs the following checks:
 * 1. Parameters should not contain binary values (type: string, format: binary).
 * 2. JSON request bodies should not contain binary values (type: string, format: binary).
 * 3. JSON response bodies should not contain binary values (type: string, format: binary).
 *
 * @param {*} schema the schema to be checked (it may or may not be a binary schema)
 * @param {*} path the array of path segments indicating the "location" of the schema within the API definition
 * @returns an array containing the violations found or [] if no violations
 */
function binarySchemaCheck(schema, path) {
  // If "schema" is not binary, then we're done!
  if (!isBinarySchema(schema) && !isBinarySchema(schema.items)) {
    return [];
  }

  debug('>>> Found binary schema: ' + path.join('.'));

  // We know that "schema" is binary, so let's do some checks on "path"
  // to see if it is being used where it shouldn't be.

  // 1. Is it the schema for a parameter within a path item or operation?
  // a. ...parameters[n].schema
  const isParamSchema = pathMatchesRegexp(
    path,
    /^paths,.*,parameters,\d+,schema$/
  );

  // b. ...parameters[n].content.*.schema
  const isParamContentSchema = pathMatchesRegexp(
    path,
    /^paths,.*,parameters,\d+,content,.*schema$/
  );

  if (
    isParamSchema ||
    (isParamContentSchema && isJsonMimeType(path[path.length - 2]))
  ) {
    debug('>>> Its a parameter schema!');
    return [
      {
        message:
          'Parameters should not contain binary values (type: string, format: binary).',
        path
      }
    ];
  }

  // 2. Is it the schema for a JSON requestBody?
  const isRequestBodySchema = pathMatchesRegexp(
    path,
    /^paths,.*,requestBody,content,.*,schema$/
  );
  if (isRequestBodySchema && isJsonMimeType(path[path.length - 2])) {
    debug('>>> Its a requestBody schema!');
    return [
      {
        message:
          'Request bodies with JSON content should not contain binary values (type: string, format: binary).',
        path
      }
    ];
  }

  // 3. Is it the schema for a JSON response?
  const isResponseSchema = pathMatchesRegexp(
    path,
    /^paths,.*,responses,[^,]*,content,.*,schema$/
  );
  if (isResponseSchema && isJsonMimeType(path[path.length - 2])) {
    debug('>>> Its a response schema!');
    return [
      {
        message:
          'Responses with JSON content should not contain binary values (type: string, format: binary).',
        path
      }
    ];
  }

  return [];
}
