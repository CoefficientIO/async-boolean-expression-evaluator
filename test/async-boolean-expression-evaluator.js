'use strict';

const should = require('should');
const sinon = require('sinon');

const AsyncBooleanExpressionEvaluator = require('../lib/async-boolean-expression-evaluator');

describe('AsyncBooleanExpressionEvaluator', () => {
	describe('#constructor', () => {
		it('sets the iterator to the passed-in parameter', () => {
			function someIterator () {}
			new AsyncBooleanExpressionEvaluator(someIterator).iterator.should.equal(someIterator);
		});
	});

	describe('#set iterator', () => {
		it('sets the iterator member', () => {
			function someIterator () {}
			function someOtherIterator () {}
			const asyncBooleanExpressionEvaluator = new AsyncBooleanExpressionEvaluator(someIterator);
			asyncBooleanExpressionEvaluator.iterator = someOtherIterator;
			asyncBooleanExpressionEvaluator.iterator.should.equal(someOtherIterator);
		});

		it('throws a TypeError if not given a function', () => {
			(() => new AsyncBooleanExpressionEvaluator(null)).should.throw(TypeError);
		});

		it('resets the cache object', () => {
			function someIterator () {}
			function someOtherIterator () {}
			const asyncBooleanExpressionEvaluator = new AsyncBooleanExpressionEvaluator(someIterator);
			const oldCache = asyncBooleanExpressionEvaluator._cache;
			asyncBooleanExpressionEvaluator.iterator = someOtherIterator;
			const newCache = asyncBooleanExpressionEvaluator._cache;
			oldCache.should.not.equal(newCache);
		});
	});

	describe('#set parallelLimit', () => {
		it('sets the parallelLimit member', () => {
			function someIterator () {}
			const asyncBooleanExpressionEvaluator = new AsyncBooleanExpressionEvaluator(someIterator);
			asyncBooleanExpressionEvaluator.parallelLimit = 5;
			asyncBooleanExpressionEvaluator.parallelLimit.should.equal(5);
		});

		it('throws a TypeError if not given a positive integer', () => {
			function someIterator () {}
			const asyncBooleanExpressionEvaluator = new AsyncBooleanExpressionEvaluator(someIterator);
			(() => asyncBooleanExpressionEvaluator.parallelLimit = '').should.throw(TypeError);
			(() => asyncBooleanExpressionEvaluator.parallelLimit = 0).should.throw(TypeError);
			(() => asyncBooleanExpressionEvaluator.parallelLimit = -1).should.throw(TypeError);
			(() => asyncBooleanExpressionEvaluator.parallelLimit = 1.5).should.throw(TypeError);
		});
	});

	describe('#clearCache', () => {
		it('clears the cache object', () => {
			const asyncBooleanExpressionEvaluator = new AsyncBooleanExpressionEvaluator(function test () {});
			const oldCache = asyncBooleanExpressionEvaluator._cache;
			asyncBooleanExpressionEvaluator.clearCache();
			const newCache = asyncBooleanExpressionEvaluator._cache;
			oldCache.should.not.equal(newCache);
		})
	});

	const asyncBooleanExpressionEvaluator = new AsyncBooleanExpressionEvaluator(function test (value) {});

	describe('#validateExpression', () => {
		it('returns true if passed a string', () => {
			asyncBooleanExpressionEvaluator.validateExpression('single operand').should.be.ok();
		});

		it('returns true if passed a valid `and` expression', () => {
			asyncBooleanExpressionEvaluator.validateExpression({and: ['a', 'b']}).should.be.ok();
		});

		it('returns true if passed a valid `or` expression', () => {
			asyncBooleanExpressionEvaluator.validateExpression({or: ['a', 'b']}).should.be.ok();
		});

		it('returns true if passed a valid `not` expression', () => {
			asyncBooleanExpressionEvaluator.validateExpression({not: 'single operand'}).should.be.ok();
		});

		it('returns true if passed a valid nested expression', () => {
			asyncBooleanExpressionEvaluator.validateExpression({or: ['a', {and: ['b', 'c', {or: ['d', 'e']}]}]}).should.be.ok();
		});

		it('returns true if passed a valid nested `not` expression', () => {
			asyncBooleanExpressionEvaluator.validateExpression({not: {and: ['a', 'b']}}).should.be.ok();
			asyncBooleanExpressionEvaluator.validateExpression({and: ['a', {not: 'b'}]}).should.be.ok();
		});

		it('throws a TypeError if not passed an object or string', () => {
			(() => asyncBooleanExpressionEvaluator.validateExpression(42)).should.throw(TypeError);
		});

		it('throws a TypeError if the passed-in object does not have an `and` or `or` key', () => {
			(() => asyncBooleanExpressionEvaluator.validateExpression({some: 'object'})).should.throw(TypeError);
		});

		it('throws a TypeError if the operands is not an array', () => {
			(() => asyncBooleanExpressionEvaluator.validateExpression({and: 42})).should.throw(TypeError);
		});

		it('throws a TypeError if the operands is empty', () => {
			(() => asyncBooleanExpressionEvaluator.validateExpression({and: []})).should.throw(TypeError);
		});

		it('throws a TypeError if there is only one operand', () => {
			(() => asyncBooleanExpressionEvaluator.validateExpression({and: ['a']})).should.throw(TypeError);
		});

		it('throws a TypeError if the passed-in object has both an `and` and an `or` key', () => {
			(() => asyncBooleanExpressionEvaluator.validateExpression({and: ['a', 'b'], or: ['c', 'd']})).should.throw(TypeError);
		});

		it('throws a TypeError if the passed-in object has both another operator with the `not` key', () => {
			(() => asyncBooleanExpressionEvaluator.validateExpression({not: 'a', or: ['c', 'd']})).should.throw(TypeError);
		});

		it('throws a TypeError if a nested expression is invalid', () => {
			(() => asyncBooleanExpressionEvaluator.validateExpression({and: ['a', {or: ['b']}]})).should.throw(TypeError);
		});

		it('throws a TypeError if a nested `not` expression is invalid', () => {
			(() => asyncBooleanExpressionEvaluator.validateExpression({and: ['a', {or: ['b', {not: []}]}]})).should.throw(TypeError);
		});
	});

	describe('#evaluateExpression', () => {
		var asyncBooleanExpressionEvaluator;
		beforeEach(() => {
			asyncBooleanExpressionEvaluator = new AsyncBooleanExpressionEvaluator(function test (value) {
				return new Promise((resolve, reject) => {
					setImmediate(() => {
						const number = Number(value);
						if (!isNaN(number)) {
							resolve(number % 2 === 0);
						} else {
							reject(new TypeError('Input must be castable to Number'));
						}
					});
				});
			});
		});

		it('evaluates a true string expression', () => {
			return asyncBooleanExpressionEvaluator.evaluateExpression('2').then((result) => {
				result.should.be.ok();
			});
		});

		it('evaluates a false string expression', () => {
			return asyncBooleanExpressionEvaluator.evaluateExpression('1').then((result) => {
				result.should.not.be.ok();
			});
		});

		it('evaluates a `not` expression with a string', () => {
			return asyncBooleanExpressionEvaluator.evaluateExpression({not: '1'}).then((result) => {
				result.should.be.ok();
			});
		});

		it('evaluates an `or` expression with one true operand', () => {
			return asyncBooleanExpressionEvaluator.evaluateExpression({or: ['1', '2', '3']}).then((result) => {
				result.should.be.ok();
			});
		});

		it('evaluates an `or` expression with no true operands', () => {
			return asyncBooleanExpressionEvaluator.evaluateExpression({or: ['1', '3', '5']}).then((result) => {
				result.should.not.be.ok();
			});
		});

		it('short-circuits an `or` expression with a true operand', () => {
			const spy = sinon.spy(asyncBooleanExpressionEvaluator, '_iterator');
			spy.withArgs('3');
			return asyncBooleanExpressionEvaluator.evaluateExpression({or: ['1', '2', '3']}).then((result) => {
				result.should.be.ok();
				spy.withArgs('3').called.should.not.be.ok();
			});
		});

		it('evaluates an `and` expression with all true operands', () => {
			return asyncBooleanExpressionEvaluator.evaluateExpression({and: ['2', '4', '6']}).then((result) => {
				result.should.be.ok();
			});
		});

		it('evaluates an `and` expression with one false operand', () => {
			return asyncBooleanExpressionEvaluator.evaluateExpression({and: ['2', '3', '6']}).then((result) => {
				result.should.not.be.ok();
			});
		});

		it('short-circuits an `and` expression with a false operand', () => {
			const spy = sinon.spy(asyncBooleanExpressionEvaluator, '_iterator');
			spy.withArgs('6');
			return asyncBooleanExpressionEvaluator.evaluateExpression({and: ['2', '3', '6']}).then((result) => {
				result.should.not.be.ok();
				spy.withArgs('6').called.should.not.be.ok();
			});
		});

		it('evaluates a true nested operation', () => {
			return asyncBooleanExpressionEvaluator.evaluateExpression({and: ['2', {or: ['3', '4']}]}).then((result) => {
				result.should.be.ok();
			});
		});

		it('evaluates a false nested operation', () => {
			return asyncBooleanExpressionEvaluator.evaluateExpression({and: ['2', {or: ['3', '5']}]}).then((result) => {
				result.should.not.be.ok();
			});
		});

		it('evaluates a true nested expression containing a `not` operator', () => {
			return asyncBooleanExpressionEvaluator.evaluateExpression({and: ['2', {not: {or: ['3', '5']}}]}).then((result) => {
				result.should.be.ok();
			});
		});

		it('evaluates a false nested expression containing a `not` operator', () => {
			return asyncBooleanExpressionEvaluator.evaluateExpression({and: ['2', {not: {and: ['2', '4']}}]}).then((result) => {
				result.should.not.be.ok();
			});
		});

		it('uses cache when the same operand is present more than once in the expression', () => {
			const spy = sinon.spy(asyncBooleanExpressionEvaluator, '_iterator');
			spy.withArgs('2');
			return asyncBooleanExpressionEvaluator.evaluateExpression({and: ['2', {not: {and: ['2', '4']}}]}).then((result) => {
				result.should.not.be.ok();
				spy.withArgs('2').calledOnce.should.be.ok();
			});
		});

		it('uses cache when the same operand is present more than once but negated in the expression', () => {
			const spy = sinon.spy(asyncBooleanExpressionEvaluator, '_iterator');
			spy.withArgs('2');
			return asyncBooleanExpressionEvaluator.evaluateExpression({and: ['2', {or: ['3', '2']}]}).then((result) => {
				result.should.be.ok();
				spy.withArgs('2').calledOnce.should.be.ok();
			});
		});

		it('uses cache when evaluating other expressions', () => {
			const spy = sinon.spy(asyncBooleanExpressionEvaluator, '_iterator');
			spy.withArgs('2');

			Promise.all([
				asyncBooleanExpressionEvaluator.evaluateExpression({and: ['2', {not: {and: ['2', '4']}}]}),
				asyncBooleanExpressionEvaluator.evaluateExpression({and: ['2', {or: ['3', '2']}]})
			]).then((results) => {
				results[0].should.be.ok();
				results[1].should.not.be.ok();
				spy.withArgs('2').calledOnce.should.be.ok();
			});
		});

		it('rejects the promise if any operand is rejected by the iterator', () => {
			return new Promise((resolve, reject) => {
				asyncBooleanExpressionEvaluator.evaluateExpression({and: ['2', 'a']})
					.then(reject)
					.catch((err) => {
						err.should.be.instanceof(TypeError);
						resolve();
					});
			});
		});
	});
});
