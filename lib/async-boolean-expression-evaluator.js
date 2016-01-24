'use strict';

const async = require('async');
const DEFAULT_PARALLEL_LIMIT = 1;

/**
 * A parser for evaluating boolean expressions, passing each operand to an asynchronous iterator
 */
class AsyncBooleanExpressionEvaluator {
	/**
	 * Creates a new evaluator for boolean expressions, given a function to perform an async test against an operand
	 * @param {Function} [iterator] See #set iterator for details. Default to a no-op, which only is applicable when all
	 * operands are functions
	 */
	constructor (iterator) {
		if (typeof iterator === 'undefined') {
			iterator = noop;
		}
		this._setIterator(iterator);
		this.parallelLimit = DEFAULT_PARALLEL_LIMIT;
	}

	/**
	 * Validates then executes the given boolean expression
	 * @param {object|string} expression
	 * @param {Function} [callback]
	 * @returns {Promise} The result of evaluating the expression
	 */
	execute (expression, callback) {
		this.validateExpression(expression);
		return this.evaluateExpression(expression, callback);
	}

	/**
	 * Gets the iterator
	 * @returns {Function}
	 */
	get iterator () {
		return this._iterator;
	}

	/**
	 * Sets the iterator
	 * @param {Function} iterator A function that accepts an operand and returns a Promise that resolves with whether the
	 * given operand is considered true or false
	 */
	set iterator (iterator) {
		this._setIterator(iterator);
	}

	/**
	 * Tests that the iterator is a function, then sets it and resets the operand result cache
	 * @param {Function} iterator
	 * @private
	 * @throws {TypeError}
	 */
	_setIterator (iterator) {
		if (typeof iterator !== 'function') {
			throw new TypeError('The iterator must be a function');
		}

		this._iterator = iterator;
		this.clearCache();
	}

	/**
	 * Sets the parallelLimit
	 * @param {Number} parallelLimit The maximum number of asynchronous iterators that can be run in parallel
	 * @throws {TypeError}
	 */
	set parallelLimit (parallelLimit) {
		if (typeof parallelLimit !== 'number' || parallelLimit < 1 || parallelLimit % 1 !== 0) {
			throw new TypeError('The parallelLimit must be a positive integer');
		}

		this._parallelLimit = parallelLimit;
	}

	/**
	 * Gets the parallelLimit
	 * @returns {Number}
	 */
	get parallelLimit () {
		return this._parallelLimit;
	}

	/**
	 * Clears the iterator result cache
	 */
	clearCache () {
		this._cache = new Map();
	}

	/**
	 * Validates the given boolean expression conforms to the correct format
	 * @param {object|*} expression The boolean expression to validate
	 * @returns {boolean} True if the expression is valid
	 * @throws {TypeError}
	 */
	validateExpression (expression) {
		if (typeof expression !== 'object') {
			return true;
		}

		const hasAnd = 'and' in expression;
		const hasOr = 'or' in expression;
		const hasNot = 'not' in expression;

		if (!hasAnd && !hasOr && !hasNot) {
			// Argument is not an expression object, just an operand
			return true;
		}

		if (hasNot) {
			if (hasAnd || hasOr) {
				throw new TypeError('A `not` operator must not also have an `and` or `or` operator');
			}

			return this.validateExpression(expression.not);
		}

		if (hasAnd && hasOr) {
			throw new TypeError('The expression must not contain both an `and` and an `or` operator');
		}

		const operator = hasAnd ? 'and' : 'or';
		const operands = expression[operator];

		if (!Array.isArray(operands)) {
			throw new TypeError('The operands must be an array');
		}

		if (operands.length < 2) {
			throw new TypeError('There must be at least two operands in the operands array');
		}

		operands.forEach((operand) => this.validateExpression(operand));

		return true;
	}

	/**
	 * Tests each operand in the expression against the asynchronous iterator. Will short-circuit whenever possible, and
	 * caches the results of operands against the iterator
	 * @param {object|*} expression The expression to evaluate
	 * @param {Function} [callback] An optional callback to invoke when the promise is resolved or rejected
	 * @returns {Promise} A promise that resolves with the result of the expression or rejects if the iterator rejects
	 * @throws {TypeError}
	 */
	evaluateExpression (expression, callback) {
		if (typeof expression === 'object' && 'not' in expression) {
			return this.evaluateExpression(expression.not).then((result) => !result);
		}

		if (typeof expression !== 'object' || !('not' in expression || 'and' in expression || 'or' in expression)) {
			return this.getIteratorResult(expression);
		}

		const asyncMethod = 'and' in expression ? async.everyLimit : async.someLimit;
		const operands = expression['and' in expression ? 'and' : 'or'];

		const promise = new Promise((resolve, reject) => {
			asyncMethod(
				operands,
				this._parallelLimit,
				(operand, done) => {
					this.evaluateExpression(operand)
						.then((result) => done(result))
						.catch((err) => reject(err));
				},
				(result) => resolve(result)
			);
		});

		if (typeof callback !== 'undefined') {
			if (typeof callback !== 'function') {
				throw new TypeError('Callback must be a function');
			}
			promise.then((result) => callback(null, result)).catch((err) => callback(err, null));
		}

		return promise;
	}

	/**
	 * Invokes the iterator for the given operand, or returns its cached result
	 * @param {*} operand The operand to pass into the iterator
	 * @returns {Promise} The promise returned from the iterator
	 */
	getIteratorResult (operand) {
		if (typeof operand === 'function') {
			return this._invoke(operand);
		}

		if (!this._cache.has(operand)) {
			this._cache.set(operand, this._invoke(this._iterator, operand));
		}
		return this._cache.get(operand);
	}

	/**
	 * Invokes the asynchronous iterator function. Based on the function, guesses whether the function returns a promise
	 * or receives a callback and normalizes this behavior
	 * @param {Function} iterator The iterator function to invoke
	 * @param {...*} [parameters] The parameter(s) to pass into the iterator
	 * @returns {Promise} A promise resolving to the result of the iterator's promise or callback
	 * @throws {TypeError}
	 * @private
	 */
	_invoke (iterator) {
		const parameters = Array.prototype.slice.call(arguments, 1);
		if (iterator.length === parameters.length) {
			return iterator.apply(this, parameters);
		} else if (iterator.length === parameters.length + 1) {
			return new Promise((resolve, reject) => {
				iterator.apply(this, parameters.concat((err, result) => {
					err ? reject(err) : resolve(result);
				}));
			});
		} else {
			throw new TypeError('Expected iterator to accept N arguments (Promise-style) or N+1 arguments (callback-style)');
		}
	}
}

module.exports = AsyncBooleanExpressionEvaluator;

function noop () {}
