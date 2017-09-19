## Classes

<dl>
<dt><a href="#AsyncBooleanExpressionEvaluator">AsyncBooleanExpressionEvaluator</a></dt>
<dd><p>A parser for evaluating boolean expressions, passing each operand to an asynchronous iterator</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Operand">Operand</a> : <code>*</code> | <code><a href="#AndExpression">AndExpression</a></code> | <code><a href="#OrExpression">OrExpression</a></code> | <code><a href="#NotExpression">NotExpression</a></code></dt>
<dd><p>An operand is a value of any type, which is passed into the iterator; or an AndExpression, OrExpression, or
NotExpression, which can be used to assemble more complex expressions out of a series of nested operands.
AndExpressions, OrExpressions, and NotExpressions may be nested recursively.</p>
</dd>
<dt><a href="#AndExpression">AndExpression</a> : <code>object</code></dt>
<dd><p>An object with the key <code>and</code> set to an array of Operands. The expression will only evaluate to true if all of the
operands evaluate to true. If any operand does evaluate to false, further operands will not be evaluated.</p>
</dd>
<dt><a href="#OrExpression">OrExpression</a> : <code>object</code></dt>
<dd><p>An object with the key <code>or</code> set to an array of Operands. The expression will only evaluate to true if any of the
operands evaluates to true. If any operand evaluates to true, further operands will not be evaluated.</p>
</dd>
<dt><a href="#NotExpression">NotExpression</a> : <code>object</code></dt>
<dd><p>An object with the key <code>not</code> set to an Operand. The expression will only evaluate to true if the operand evaluates to
false.</p>
</dd>
</dl>

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
    * [.execute(expression, [callback])](#AsyncBooleanExpressionEvaluator+execute) ⇒ <code>Promise</code>
    * [.clearCache()](#AsyncBooleanExpressionEvaluator+clearCache)
    * [.validateExpression(expression)](#AsyncBooleanExpressionEvaluator+validateExpression) ⇒ <code>boolean</code>
    * [.evaluateExpression(expression, [callback])](#AsyncBooleanExpressionEvaluator+evaluateExpression) ⇒ <code>Promise</code>
    * [.getIteratorResult(operand)](#AsyncBooleanExpressionEvaluator+getIteratorResult) ⇒ <code>Promise</code>

<a name="new_AsyncBooleanExpressionEvaluator_new"></a>

### new AsyncBooleanExpressionEvaluator(iterator)
Creates a new evaluator for boolean expressions, given a function to perform an async test against an operand


| Param | Type | Description |
| --- | --- | --- |
| iterator | <code>function</code> | See #set iterator for details. |

<a name="AsyncBooleanExpressionEvaluator+iterator"></a>

### asyncBooleanExpressionEvaluator.iterator ⇒ <code>function</code>
Gets the iterator

**Kind**: instance property of [<code>AsyncBooleanExpressionEvaluator</code>](#AsyncBooleanExpressionEvaluator)  
<a name="AsyncBooleanExpressionEvaluator+iterator"></a>

### asyncBooleanExpressionEvaluator.iterator
Sets the iterator

**Kind**: instance property of [<code>AsyncBooleanExpressionEvaluator</code>](#AsyncBooleanExpressionEvaluator)  

| Param | Type | Description |
| --- | --- | --- |
| iterator | <code>function</code> | A function that accepts an operand and returns a Promise that resolves with whether the given operand is considered true or false |

<a name="AsyncBooleanExpressionEvaluator+parallelLimit"></a>

### asyncBooleanExpressionEvaluator.parallelLimit
Sets the parallelLimit

**Kind**: instance property of [<code>AsyncBooleanExpressionEvaluator</code>](#AsyncBooleanExpressionEvaluator)  
**Throws**:

- <code>TypeError</code> 


| Param | Type | Description |
| --- | --- | --- |
| parallelLimit | <code>Number</code> | The maximum number of asynchronous iterators that can be run in parallel |

<a name="AsyncBooleanExpressionEvaluator+parallelLimit"></a>

### asyncBooleanExpressionEvaluator.parallelLimit ⇒ <code>Number</code>
Gets the parallelLimit

**Kind**: instance property of [<code>AsyncBooleanExpressionEvaluator</code>](#AsyncBooleanExpressionEvaluator)  
<a name="AsyncBooleanExpressionEvaluator+execute"></a>

### asyncBooleanExpressionEvaluator.execute(expression, [callback]) ⇒ <code>Promise</code>
Validates then executes the given boolean expression

**Kind**: instance method of [<code>AsyncBooleanExpressionEvaluator</code>](#AsyncBooleanExpressionEvaluator)  
**Returns**: <code>Promise</code> - The result of evaluating the expression  

| Param | Type | Description |
| --- | --- | --- |
| expression | [<code>Operand</code>](#Operand) | The expression to execute |
| [callback] | <code>function</code> | An optional callback to invoke when the promise is resolved or rejected |

<a name="AsyncBooleanExpressionEvaluator+clearCache"></a>

### asyncBooleanExpressionEvaluator.clearCache()
Clears the iterator result cache

**Kind**: instance method of [<code>AsyncBooleanExpressionEvaluator</code>](#AsyncBooleanExpressionEvaluator)  
<a name="AsyncBooleanExpressionEvaluator+validateExpression"></a>

### asyncBooleanExpressionEvaluator.validateExpression(expression) ⇒ <code>boolean</code>
Validates the given boolean expression conforms to the correct format

**Kind**: instance method of [<code>AsyncBooleanExpressionEvaluator</code>](#AsyncBooleanExpressionEvaluator)  
**Returns**: <code>boolean</code> - True if the expression is valid  
**Throws**:

- <code>TypeError</code> 


| Param | Type | Description |
| --- | --- | --- |
| expression | [<code>Operand</code>](#Operand) | The boolean expression to validate |

<a name="AsyncBooleanExpressionEvaluator+evaluateExpression"></a>

### asyncBooleanExpressionEvaluator.evaluateExpression(expression, [callback]) ⇒ <code>Promise</code>
Tests each operand in the expression against the asynchronous iterator. Will short-circuit whenever possible, and
caches the results of operands against the iterator

**Kind**: instance method of [<code>AsyncBooleanExpressionEvaluator</code>](#AsyncBooleanExpressionEvaluator)  
**Returns**: <code>Promise</code> - A promise that resolves with the result of the expression or rejects if the iterator rejects  
**Throws**:

- <code>TypeError</code> 


| Param | Type | Description |
| --- | --- | --- |
| expression | [<code>Operand</code>](#Operand) | The expression to evaluate |
| [callback] | <code>function</code> | An optional callback to invoke when the promise is resolved or rejected |

<a name="AsyncBooleanExpressionEvaluator+getIteratorResult"></a>

### asyncBooleanExpressionEvaluator.getIteratorResult(operand) ⇒ <code>Promise</code>
Invokes the iterator for the given operand, or returns its cached result

**Kind**: instance method of [<code>AsyncBooleanExpressionEvaluator</code>](#AsyncBooleanExpressionEvaluator)  
**Returns**: <code>Promise</code> - The promise returned from the iterator  

| Param | Type | Description |
| --- | --- | --- |
| operand | [<code>Operand</code>](#Operand) | The operand to pass into the iterator |

<a name="Operand"></a>

## Operand : <code>\*</code> \| [<code>AndExpression</code>](#AndExpression) \| [<code>OrExpression</code>](#OrExpression) \| [<code>NotExpression</code>](#NotExpression)
An operand is a value of any type, which is passed into the iterator; or an AndExpression, OrExpression, or
NotExpression, which can be used to assemble more complex expressions out of a series of nested operands.
AndExpressions, OrExpressions, and NotExpressions may be nested recursively.

**Kind**: global typedef  
<a name="AndExpression"></a>

## AndExpression : <code>object</code>
An object with the key `and` set to an array of Operands. The expression will only evaluate to true if all of the
operands evaluate to true. If any operand does evaluate to false, further operands will not be evaluated.

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| and | [<code>Array.&lt;Operand&gt;</code>](#Operand) | 

<a name="OrExpression"></a>

## OrExpression : <code>object</code>
An object with the key `or` set to an array of Operands. The expression will only evaluate to true if any of the
operands evaluates to true. If any operand evaluates to true, further operands will not be evaluated.

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| or | [<code>Array.&lt;Operand&gt;</code>](#Operand) | 

<a name="NotExpression"></a>

## NotExpression : <code>object</code>
An object with the key `not` set to an Operand. The expression will only evaluate to true if the operand evaluates to
false.

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| not | [<code>Operand</code>](#Operand) | 

