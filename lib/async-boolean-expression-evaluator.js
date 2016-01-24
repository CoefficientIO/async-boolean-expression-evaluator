'use strict';

const async = require('async');
const DEFAULT_PARALLEL_LIMIT = 1;

/**
 * A parser for evaluating boolean expressions, passing each operand to an asynchronous iterator
 */
class AsyncBooleanExpressionEvaluator {
	/**
	 * Creates a new evaluator for boolean expressions, given a function to perform an async test against an operand
	 * @param {Function} iterator
	 */
	constructor (iterator) {
		this._setIterator(iterator);
		this.parallelLimit = DEFAULT_PARALLEL_LIMIT;
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
		this._cache = {};
	}

	/**
	 * Validates the given boolean expression conforms to the correct format
	 * @param {object|string} expression The boolean expression to validate
	 * @returns {boolean} True if the expression is valid
	 * @throws {TypeError}
	 */
	validateExpression (expression) {
		if (typeof expression === 'string') {
			return true;
		}

		if (typeof expression !== 'object') {
			throw new TypeError('The expression must be an object or a string');
		}

		const hasAnd = 'and' in expression;
		const hasOr = 'or' in expression;
		const hasNot = 'not' in expression;

		if (hasNot) {
			if (hasAnd || hasOr) {
				throw new TypeError('A `not` operator must not also have an `and` or `or` operator');
			}

			return this.validateExpression(expression.not);
		}

		if (hasAnd === hasOr) {
			throw new TypeError('The expression must contain either an `and` or an `or` operator, but not both');
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
	 * @param {object|string} expression The expression to evaluate
	 * @returns {Promise} A promise that resolves with the result of the expression or rejects if the iterator rejects
	 */
	evaluateExpression (expression) {
		if (typeof expression === 'object' && 'not' in expression) {
			return this.evaluateExpression(expression.not).then((result) => !result);
		}

		if (typeof expression === 'string') {
			return this.getIteratorResult(expression);
		}

		const asyncMethod = 'and' in expression ? async.everyLimit : async.someLimit;
		const operands = expression['and' in expression ? 'and' : 'or'];

		return new Promise((resolve, reject) => {
			asyncMethod(
				operands,
				this._parallelLimit,
				(operand, callback) => {
					this.evaluateExpression(operand)
						.then((result) => callback(result))
						.catch((err) => {
							reject(err);
						});
				},
				(result) => resolve(result)
			);
		});
	}

	/**
	 * Invokes the iterator for the given operand, or returns its cached result
	 * @param {string} operand The operand to pass into the iterator
	 * @returns {Promise} The promise returned from the iterator
	 */
	getIteratorResult (operand) {
		if (!(operand in this._cache)) {
			this._cache[operand] = this._iterator(operand);
		}
		return this._cache[operand];
	}

	/**
	 * Validates then executes the given boolean expression
	 * @param {object|string} expression
	 * @returns {Promise} The result of evaluating the expression
	 */
	execute (expression) {
		this.validateExpression(expression);
		return this.evaluateExpression(expression);
	}
}

module.exports = AsyncBooleanExpressionEvaluator;
