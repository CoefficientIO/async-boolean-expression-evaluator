# async-boolean-expression-evaluator

The AsyncBooleanExpressionEvaluator is a class designed to evaluate a special format of a boolean expression, where
each operand in the expression can be tested asynchronously.

* [Examples](#examples)
* [Features](#features)
* [Understanding Input](#understanding-input)
  * [Expressions](#expressions)
  * [Operands](#operands)
  * [Using Callback-Style Operations](#using-callback-style-operations)
  * [Configuring Parallel Limit](#configuring-parallel-limit)
* [API](#api)
* [Scripts](#scripts)
  * [`npm install`](#npm-install)
  * [`npm test`](#npm-test)
  * [`npm run docs`](#npm-run-docs)

## Examples

```js
const AsyncBooleanExpressionEvaluator = require('async-boolean-expression-evaluator');

const evaluator = new AsyncBooleanExpressionEvaluator(function test (operand) {
  // A simple asynchronous operation that returns a Promise. It resolves with true if the
  // operand is an even number or false if it is an odd number. It rejects the promise if
  // the operand is not a number.
  return new Promise((resolve, reject) => {
    setImmediate(() => {
      if (typeof value !== 'number' && !isNaN(value)) {
        resolve(value % 2 === 0);
      } else {
        reject(new TypeError('Input must be castable to Number'));
      }
    ));
  });
});


// Simple expression
evaluator.execute(2).then((result) => result === true);
evaluator.execute(1).then((result) => result === false);
evaluator.execute('a').catch((err) => err instanceof TypeError);


// And expression
evaluator.execute({and: [2, 4]}).then((result) => result === true);
evaluator.execute({and: [2, 3]}).then((result) => result === false);


// Or expression
evaluator.execute({or: [2, 3]}).then((result) => result === true);
evaluator.execute({or: [1, 3]}).then((result) => result === false);


// Not expression
evaluator.execute({not: 1}).then((result) => result === true);
evaluator.execute({not: 2}).then((result) => result === false);


// Nested expressions
evaluator.execute({and: [2, {or: [1, {not: {and: [3, 4]}}]}]})
  .then((result) => result === true);


// Changing the iterator on the fly
evaluator.iterator = function (operand) {};


// Setting the maximum number of parallel tests (defaults to 1, i.e. execute in series)
evaluator.parallelLimit = 5;


// Traditional callback-style iterator
evaluator.iterator = function test (id, done) {
  db.getItemById(id, (err, item) => {
    if (err) return done(err);
    done(null, item.property === 42);
  });
};
evaluator.execute({or: [1, 2, 3]}).then((result) => log(result));


// Traditional callback-style expression execution
evaluator.execute({or: [3, 4]}, (err, result) => {
  log(err);
  log(result);
});
```

## Features

* Supports boolean operators `and` and `or`
* Supports recursive expressions
* Supports negation of results with a `not` operator
* Written in ES6 and uses Promises
* Detects when to use traditional callback-style operations
* Caches the result of the iterator for the given operand to save processing time
* Configurable limit to the number of parallel iterators run to conserve resources

## Understanding Input

There are two "types" of parameters given to the evaluator: the expression and the operands. The expression is the
boolean statement to be evaluated, while the operands are the items passed into the iterator to test their value.

### Expressions

The expression is usually in the format of an object and can contain one of the three keyword properties: `and`, `or`,
or `not`. An expression is not valid if it contains more than one of these keywords.

* `and`: The value for this property must be an array of nested expressions. If all expressions in the array evaluate to
truthy values, then the result of the expression is true.
* `or`: The value for this property must be an array of nested expressions. If any expression in the array evaluates to
truthy values, then the result of the expression is true.
* `not`: The value for this property must be a nested expression. If the result of the nested expression is true, then
the result of this expression will be false.

The simplest expression is actually not an object at all, but just one operand. Each of the following are valid
expressions:

* `1`: True if the iterator is truthy for `1`
* `{and: [1, 2, 3]}`: True if the iterator is truthy for `1`, `2`, and `3`
* `{or: [1, 2, 3]}`: True if the iterator is truthy for `1`, `2`, or `3`
* `{not: 1}`: True if the iterator is not truthy for `1`
* `{not: {and: [1, 2, 3]}`: True if the iterator is not truthy for `1`, `2`, and `3`
* `{and: [1, {or: [2, {not: 3}]}]}`: True if the iterator is truthy for `1` and also either truthy for `2` or falsy for
`3`

An expression, however, may not contain more than one of the three keywords, so these expressions are *invalid*:

* `{and: [1, 2], or: [3, 4]}`
* `{and: [1, 2], not: 3}`

### Operands

Operands are the subjects of the expression. Each operand is tested against the asynchronous iterator function to
determine its truthiness. Operands can be any type.

The result of invoking the iterator against an operand is cached, so that if the same operand is used more than once in
the expression or subsequent evaluations, the previous result is used, conserving server resources.

#### Object Operands

An operand may be of any type. Because of this, there is some ambiguity between whether an argument is an operand or an
expression. Operands *may* be objects, but if they are objects, they may *not* have the properties `and`, `or`, or `not`
on them to prevent the parser from considering the operand to be a nested expression. If the operand is an object
containing arbitrary fields that are not known, consider wrapping the operand inside another object to safeguard the
evaluator against it mistakenly determining than an operand is another expression. For example:

```js
const obj1 = {name: 'an arbitrary object', and: 'a confusing property'};
const obj2 = {name: 'an arbitrary object 2', and: 'another confusing property'};

// Wrong! Evaluator sees `and` key and expects the object to be an expression
let evaluator = new AsyncBooleanExpressionEvaluator(function test (value) {
  return new Promise((resolve) => {
    setImmediate(() => resolve(value.name.indexOf('arbitrary') > -1));
  });
});
evaluator.execute({and: [obj1, obj2]});

// Right. Now `and` is not seen by the evaluator
evaluator = new AsyncBooleanExpressionEvaluator(function test (value) {
  return new Promise((resolve) => {
    setImmediate(() => resolve(value.object.name.indexOf('arbitrary') > -1));
  });
});
evaluator.execute({and: [{object: obj1}, {object: obj2}]});
```

### Using Callback-Style Operations

The evaluator prefers promise-style asynchronous execution but will detect callback-style execution based on input.

* If `#execute` is passed an argument after the expression, the evaluator assumes that this is a callback and invokes
it when the expression is evaluated, passing the error or null as the first argument and the result or null as the
second. It will still return the promise.
* If the iterator has a `length` property of 2, the evaluator assumes that it should pass a callback into the iterator
and will *not* expect the iterator to return a promise, but instead that it will invoke the callback. For example,
the evaluator expects that `function test (value) {}` will return a promise, whereas
`function test (value, callback) {}` will execute the callback. It is important, therefore, to be conscious of the
number of arguments of the iterator function's signature.

If the iterator does *not* use the callback-style, make sure that it always returns promises and that it has defined the
correct number of arguments in its signature (i.e. an iterator must expect one argument).

If the iterator *does* use the callback-style, make sure that the iterator expects exactly two arguments, the latter of
which is the callback. In addition, the callback must be invoked with either an error or null as the first parameter and
the result (truthy/falsy value) or null as the second parameter to the callback. Keep this in mind when working with
certain no-error-style asynchronous functions, such as the built-in fs module's `exists` function.

### Configuring Parallel Limit

Set the `parallelLimit` property on the evaluator to change the number of concurrent iterators. For example, if an
expression contains many operands, such as an `or` operation with 100 user IDs to check against, the evaluator can be
configured to only run up to 10 queries at a time to prevent the application from abusing the database connection.

Note that this parallel limit is local to the execution operation, i.e. if `#execute` is called multiple times
concurrently, then this limit is actually `parallelLimit` times the number of executions being run at once.

By default, this is set to `1`, i.e. only one operand is tested by the iterator at a time. This is more likely to
conserve resources but will take more time. Increase this value at your discretion.

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
