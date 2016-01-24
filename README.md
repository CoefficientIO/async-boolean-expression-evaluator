# async-boolean-expression-evaluator

The AsyncBooleanExpressionEvaluator is a class designed to evaluate a special format of a boolean expression, where
each operand in the expression can be tested asynchronously.

## Examples

```js
const AsyncBooleanExpressionEvaluator = require('async-boolean-expression-evaluator');

const evaluator = new AsyncBooleanExpressionEvaluator(function test (operand) {
  // A simple asynchronous operation that returns a Promise. It resolves with true if the
  // operand is an even number orfalse if it is an odd number. It rejects the promise if
  // the operand is not a number.
  return new Promise((resolve, reject) => {
    setImmediate(() => {
      const number = Number(value);
      if (!isNaN(number)) {
        resolve(number % 2 === 0);
      } else {
        reject(new TypeError('Input must be castable to Number'));
      }
    ));
  });
});

// Simple expression
evaluator.execute('2').then((result) => result === true);
evaluator.execute('1').then((result) => result === false);
evaluator.execute('a').catch((err) => err instanceof TypeError);

// And expression
evaluator.execute({and: ['2', '4']}).then((result) => result === true);
evaluator.execute({and: ['2', '3']}).then((result) => result === false);

// Or expression
evaluator.execute({or: ['2', '3']}).then((result) => result === true);
evaluator.execute({or: ['1', '3']}).then((result) => result === false);

// Not expression
evaluator.execute({not: '1'}).then((result) => result === true);
evaluator.execute({not: '2'}).then((result) => result === false);

// Nested expressions
evaluator.execute({and: ['2', {or: ['1', {not: '3'}]}]}).then((result) => result === true);

// Changing the iterator on the fly
evaluator.iterator = function (operand) {};

// Setting the maximum number of parallel tests (defaults to 1, i.e. execute in series)
evaluator.parallelLimit = 5;
```

## Features

* Supports boolean operators `and` and `or`
* Supports recursive expressions
* Supports negation of results with a `not` operator
* Written in ES6 and uses Promises
* Caches the result of the iterator for the given operand to save processing time
* Configurable limit to the number of parallel iterators run to conserve resources

## API

API documentation is available in [API.md](./API.md).

## Scripts

### `npm install`

Install via `npm install async-boolean-expression-evaluator`.

### `npm test`

The unit tests are written in [Mocha](http://mochajs.org/) and [Should.js](https://github.com/shouldjs/should.js).
They are located in the `test/` directory and can be run via `npm test`.

### `npm run docs`

Generates the API documentation via [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
