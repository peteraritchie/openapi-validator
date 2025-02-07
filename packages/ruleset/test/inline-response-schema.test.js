const { inlineResponseSchema } = require('../src/rules');
const { makeCopy, rootDocument, testRule, severityCodes } = require('./utils');

const rule = inlineResponseSchema;
const ruleId = 'inline-response-schema';
const expectedSeverity = severityCodes.warning;
const expectedMsg =
  'Response schemas should be defined as a $ref to a named schema.';

describe('Spectral rule: inline-response-schema', () => {
  describe('Should not yield errors', () => {
    it('Clean spec', async () => {
      const results = await testRule(ruleId, rule, rootDocument);
      expect(results).toHaveLength(0);
    });

    it('Inline primitive schema in success response', async () => {
      const testDocument = makeCopy(rootDocument);

      // Replace a ref with an inline primitive schema.
      testDocument.paths['/v1/movies'].post.responses['201'].content[
        'application/json'
      ].schema = {
        type: 'string'
      };

      const results = await testRule(ruleId, rule, testDocument);
      expect(results).toHaveLength(0);
    });

    it('Inline schema in non-JSON success response', async () => {
      const testDocument = makeCopy(rootDocument);

      // Replace response with non-json content.
      testDocument.paths['/v1/movies'].post.responses['201'].content = {
        'text/html': {
          schema: {
            description:
              'Inline object schema for a non-JSON response; should be ignored',
            type: 'object',
            properties: {
              test_prop: {
                type: 'string'
              }
            }
          }
        }
      };

      const results = await testRule(ruleId, rule, testDocument);
      expect(results).toHaveLength(0);
    });

    it('No schema in success response', async () => {
      const testDocument = makeCopy(rootDocument);

      // Remove the schema from a success response.
      delete testDocument.paths['/v1/movies'].post.responses['201'].content[
        'application/json'
      ].schema;

      const results = await testRule(ruleId, rule, testDocument);
      expect(results).toHaveLength(0);
    });

    it('Inline array schema w/primitive items in success response', async () => {
      const testDocument = makeCopy(rootDocument);

      // Replace a ref with an inline array schema.
      testDocument.paths['/v1/movies'].post.responses['201'].content[
        'application/json'
      ].schema = {
        type: 'array',
        items: {
          type: 'integer'
        }
      };

      const results = await testRule(ruleId, rule, testDocument);
      expect(results).toHaveLength(0);
    });
    it('Inline array schema w/$ref items in error response', async () => {
      const testDocument = makeCopy(rootDocument);

      // Replace a ref with an inline array schema.
      testDocument.paths['/v1/movies'].post.responses['400'].content[
        'application/json'
      ].schema = {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Error'
        }
      };

      const results = await testRule(ruleId, rule, testDocument);
      expect(results).toHaveLength(0);
    });
  });

  describe('Should yield errors', () => {
    it('Inline schema in error response', async () => {
      const testDocument = makeCopy(rootDocument);

      // Change a response to use an inline schema.
      testDocument.paths['/v1/movies'].post.responses['400'].content[
        'application/json'
      ].schema = {
        description: 'An error response.',
        type: 'object',
        properties: {
          trace: {
            description: 'The error trace information.',
            type: 'string',
            format: 'uuid'
          },
          error: {
            $ref: '#/components/schemas/RequestError'
          }
        }
      };

      const results = await testRule(ruleId, rule, testDocument);
      expect(results).toHaveLength(1);

      expect(results[0].code).toBe(ruleId);
      expect(results[0].message).toBe(expectedMsg);
      expect(results[0].severity).toBe(expectedSeverity);
      expect(results[0].path.join('.')).toBe(
        'paths./v1/movies.post.responses.400.content.application/json.schema'
      );
    });

    it('Inline schema in success response', async () => {
      const testDocument = makeCopy(rootDocument);

      // Replace a ref with the referenced schema within a success response.
      testDocument.paths['/v1/movies'].post.responses['201'].content[
        'application/json'
      ].schema = testDocument.components.schemas.Movie;

      const results = await testRule(ruleId, rule, testDocument);
      expect(results).toHaveLength(1);

      expect(results[0].code).toBe(ruleId);
      expect(results[0].message).toBe(expectedMsg);
      expect(results[0].severity).toBe(expectedSeverity);
      expect(results[0].path.join('.')).toBe(
        'paths./v1/movies.post.responses.201.content.application/json.schema'
      );
    });

    it('Inline composed schema in success response', async () => {
      const testDocument = makeCopy(rootDocument);

      // Replace a ref with the referenced schema within a success response.
      testDocument.paths['/v1/drinks'].post.responses['201'].content[
        'application/json'
      ].schema = testDocument.components.schemas.Drink;

      const results = await testRule(ruleId, rule, testDocument);
      expect(results).toHaveLength(1);

      expect(results[0].code).toBe(ruleId);
      expect(results[0].message).toBe(expectedMsg);
      expect(results[0].severity).toBe(expectedSeverity);
      expect(results[0].path.join('.')).toBe(
        'paths./v1/drinks.post.responses.201.content.application/json.schema'
      );
    });

    it('Inline schema in referenced success response', async () => {
      const testDocument = makeCopy(rootDocument);

      // Replace a ref with the referenced schema within a named success response.
      testDocument.components.responses.ConsumedDrink.content[
        'application/json'
      ].schema = testDocument.components.schemas.Soda;

      const results = await testRule(ruleId, rule, testDocument);
      expect(results).toHaveLength(1);

      expect(results[0].code).toBe(ruleId);
      expect(results[0].message).toBe(expectedMsg);
      expect(results[0].severity).toBe(expectedSeverity);
      expect(results[0].path.join('.')).toBe(
        'components.responses.ConsumedDrink.content.application/json.schema'
      );
    });

    it('Inline schema in referenced error response', async () => {
      const testDocument = makeCopy(rootDocument);

      // Replace a ref with the referenced schema within a named success response.
      testDocument.components.responses.BarIsClosed.content[
        'application/json'
      ].schema = testDocument.components.schemas.Error;

      const results = await testRule(ruleId, rule, testDocument);
      expect(results).toHaveLength(1);

      expect(results[0].code).toBe(ruleId);
      expect(results[0].message).toBe(expectedMsg);
      expect(results[0].severity).toBe(expectedSeverity);
      expect(results[0].path.join('.')).toBe(
        'components.responses.BarIsClosed.content.application/json.schema'
      );
    });
  });
});
