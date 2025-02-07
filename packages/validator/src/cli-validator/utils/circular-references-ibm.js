// find the circular references,
// correct them,

const isPlainObject = require('lodash/isPlainObject');
const isObject = require('lodash/isObject');

// and return them as problems if applicable
const validate = function({ jsSpec, resolvedSpec }, config) {
  const result = { error: [], warning: [] };
  config = config.walker;
  const pathsInResolvedSpec = correctSpec(resolvedSpec);
  const actualPaths = convertPaths(jsSpec, pathsInResolvedSpec);
  const checkStatus = config.has_circular_references;
  if (checkStatus !== 'off') {
    result[checkStatus] = actualPaths.map(path => ({
      message: 'Swagger object should not contain circular references.',
      path
    }));
  }
  return { errors: result.error, warnings: result.warning };
};

// this function finds circular references in the resolved spec and
// cuts them off to allow recursive walks in the validators
const correctSpec = function(resolvedSpec) {
  const paths = [];

  function walk(object, path, visitedObjects) {
    if (object === null) {
      return null;
    }

    // we need to catch arrays here, in addition to plain objects
    if (!isObject(object)) {
      return null;
    }

    const keys = Object.keys(object);

    if (!keys.length) {
      return null;
    }

    return keys.forEach(function(key) {
      if (isPlainObject(object[key])) {
        if (visitedObjects.includes(object[key])) {
          paths.push([...path, key]);
          object[key] = '[Circular]';
          return;
        }
      }
      return walk(object[key], [...path, key], [...visitedObjects, object]);
    });
  }

  walk(resolvedSpec, [], []);
  return paths;
};

// this function takes the paths found while correcting the spec and
// finds where the circular references are happening in the actual spec
const convertPaths = function(jsSpec, resolvedPaths) {
  const realPaths = [];
  resolvedPaths.forEach(path => {
    let realPath = [];
    let previous = jsSpec;

    // path is an array of keys leading to the circular reference
    for (let i = 0; i < path.length; i++) {
      const key = path[i];
      realPath.push(key);

      // access the next nested object using the given key
      let current = previous[key];

      // if this is the last key, don't follow the ref object
      // or else the result will be only the object path
      //  (i.e. "definitions.QueryAggregation")
      // instead of the path to where the circular reference occurs
      const lastKey = i === path.length - 1;
      if (!lastKey) {
        const nextKey = path[i + 1];

        // Only follow $ref if the next key is not present
        if (!current[nextKey] && current.$ref) {
          // locationArray holds the keys to the references object in the spec
          const locationArray = current.$ref
            .split('/')
            .filter(refKey => refKey !== '#');

          // since we are following a ref to the first object level,
          // realPath needs to be reset
          realPath = [...locationArray];

          // to follow the keys to the ref object we need to start looking in,
          // a mini-version of the parent loop is necessary
          let refPrevious = jsSpec;
          for (const refKey of locationArray) {
            const refCurrent = refPrevious[refKey];
            refPrevious = refCurrent;

            // this should only happen in a specific multi-file spec scenario - schemas across
            // files that reference one another (creating a circular reference)
            // the bundler doesn't handle this situation well, so there isn't a lot we can do other than
            // break out of the loop to avoid any runtime errors
            if (!refPrevious) {
              break;
            }
          }

          // as mentioned above, this should only happen in rare, multi-file spec scenarios.
          // break from the loop, then go ahead and return the resolved path to the user,
          // who will have to manually trace it to the source
          // there is not really a better way to handle it without major changes
          if (!refPrevious) {
            realPath = path;
            break;
          }

          // set the parent current object to the object found at the
          // referenced path to continue using the keys in the parent loop
          current = refPrevious;
        }
      }

      previous = current;
    }
    realPaths.push(realPath.join('.'));
  });

  return realPaths;
};

module.exports.validate = validate;
module.exports.correct = correctSpec;
module.exports.convert = convertPaths;
