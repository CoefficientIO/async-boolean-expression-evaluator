<a name="AsyncBooleanExpressionEvaluator"></a>
## AsyncBooleanExpressionEvaluator
A parser for evaluating boolean expressions, passing each operand to an asynchronous iterator

**Kind**: global class  

* [AsyncBooleanExpressionEvaluator](#AsyncBooleanExpressionEvaluator)
    * [new AsyncBooleanExpressionEvaluator(iterator)](#new_AsyncBooleanExpressionEvaluator_new)
    * [.iterator](#AsyncBooleanExpressionEvaluator+iterator) ⇒ <code>function</code>
    * [.iterator](#AsyncBooleanExpressionEvaluator+iterator)
    * [.parallelLimit](#AsyncBooleanExpressionEvaluator+parallelLimit)
    * [.parallelLimit](#AsyncBooleanExpressionEvaluator+parallelLimit) ⇒ <code>Number</code>
    * [.clearCache()](#AsyncBooleanExpressionEvaluator+clearCache)
    * [.validateExpression(expression)](#AsyncBooleanExpressionEvaluator+validateExpression) ⇒ <code>boolean</code>
    * [.evaluateExpression(expression)](#AsyncBooleanExpressionEvaluator+evaluateExpression) ⇒ <code>Promise</code>
    * [.getIteratorResult(operand)](#AsyncBooleanExpressionEvaluator+getIteratorResult) ⇒ <code>Promise</code>
    * [.execute(expression)](#AsyncBooleanExpressionEvaluator+execute) ⇒ <code>Promise</code>

<a name="new_AsyncBooleanExpressionEvaluator_new"></a>
### new AsyncBooleanExpressionEvaluator(iterator)
Creates a new evaluator for boolean expressions, given a function to perform an async test against an operand


| Param | Type |
| --- | --- |
| iterator | <code>function</code> | 

<a name="AsyncBooleanExpressionEvaluator+iterator"></a>
### asyncBooleanExpressionEvaluator.iterator ⇒ <code>function</code>
Gets the iterator

**Kind**: instance property of <code>[AsyncBooleanExpressionEvaluator](#AsyncBooleanExpressionEvaluator)</code>  
<a name="AsyncBooleanExpressionEvaluator+iterator"></a>
### asyncBooleanExpressionEvaluator.iterator
Sets the iterator

**Kind**: instance property of <code>[AsyncBooleanExpressionEvaluator](#AsyncBooleanExpressionEvaluator)</code>  

| Param | Type | Description |
| --- | --- | --- |
| iterator | <code>function</code> | A function that accepts an operand and returns a Promise that resolves with whether the given operand is considered true or false |

<a name="AsyncBooleanExpressionEvaluator+parallelLimit"></a>
### asyncBooleanExpressionEvaluator.parallelLimit
Sets the parallelLimit

**Kind**: instance property of <code>[AsyncBooleanExpressionEvaluator](#AsyncBooleanExpressionEvaluator)</code>  
**Throws**:

- <code>TypeError</code> 


| Param | Type | Description |
| --- | --- | --- |
| parallelLimit | <code>Number</code> | The maximum number of asynchronous iterators that can be run in parallel |

<a name="AsyncBooleanExpressionEvaluator+parallelLimit"></a>
### asyncBooleanExpressionEvaluator.parallelLimit ⇒ <code>Number</code>
Gets the parallelLimit

**Kind**: instance property of <code>[AsyncBooleanExpressionEvaluator](#AsyncBooleanExpressionEvaluator)</code>  
<a name="AsyncBooleanExpressionEvaluator+clearCache"></a>
### asyncBooleanExpressionEvaluator.clearCache()
Clears the iterator result cache

**Kind**: instance method of <code>[AsyncBooleanExpressionEvaluator](#AsyncBooleanExpressionEvaluator)</code>  
<a name="AsyncBooleanExpressionEvaluator+validateExpression"></a>
### asyncBooleanExpressionEvaluator.validateExpression(expression) ⇒ <code>boolean</code>
Validates the given boolean expression conforms to the correct format

**Kind**: instance method of <code>[AsyncBooleanExpressionEvaluator](#AsyncBooleanExpressionEvaluator)</code>  
**Returns**: <code>boolean</code> - True if the expression is valid  
**Throws**:

- <code>TypeError</code> 


| Param | Type | Description |
| --- | --- | --- |
| expression | <code>object</code> &#124; <code>string</code> | The boolean expression to validate |

<a name="AsyncBooleanExpressionEvaluator+evaluateExpression"></a>
### asyncBooleanExpressionEvaluator.evaluateExpression(expression) ⇒ <code>Promise</code>
Tests each operand in the expression against the asynchronous iterator. Will short-circuit whenever possible, and
caches the results of operands against the iterator

**Kind**: instance method of <code>[AsyncBooleanExpressionEvaluator](#AsyncBooleanExpressionEvaluator)</code>  
**Returns**: <code>Promise</code> - A promise that resolves with the result of the expression or rejects if the iterator rejects  

| Param | Type | Description |
| --- | --- | --- |
| expression | <code>object</code> &#124; <code>string</code> | The expression to evaluate |

<a name="AsyncBooleanExpressionEvaluator+getIteratorResult"></a>
### asyncBooleanExpressionEvaluator.getIteratorResult(operand) ⇒ <code>Promise</code>
Invokes the iterator for the given operand, or returns its cached result

**Kind**: instance method of <code>[AsyncBooleanExpressionEvaluator](#AsyncBooleanExpressionEvaluator)</code>  
**Returns**: <code>Promise</code> - The promise returned from the iterator  

| Param | Type | Description |
| --- | --- | --- |
| operand | <code>string</code> | The operand to pass into the iterator |

<a name="AsyncBooleanExpressionEvaluator+execute"></a>
### asyncBooleanExpressionEvaluator.execute(expression) ⇒ <code>Promise</code>
Validates then executes the given boolean expression

**Kind**: instance method of <code>[AsyncBooleanExpressionEvaluator](#AsyncBooleanExpressionEvaluator)</code>  
**Returns**: <code>Promise</code> - The result of evaluating the expression  

| Param | Type |
| --- | --- |
| expression | <code>object</code> &#124; <code>string</code> | 

