import compose from './compose'

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
export default function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
          'Other middleware would not be applied to this dispatch.'
      )
    }

    const middlewareAPI = {
      // 看看getState，然后没干啥
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }

    // 返回的是一个数组
    const chain = middlewares.map(middleware => middleware(middlewareAPI))

    // 返回的是一个嵌套的函数调用，然后可以，执行的时候，根据注册顺序，从后往前执行
    // 研究一下异步的插件，等我再回来

    // 回来了：redux-thunk核心代码
    // function createThunkMiddleware(extraArgument) {
    //   return ({ dispatch, getState }) => next => action => {
    //     if (typeof action === 'function') {
    //       return action(dispatch, getState, extraArgument);
    //     }
    //
    //     return next(action);
    //   };
    // }
    // const thunk = createThunkMiddleware();
    // thunk.withExtraArgument = createThunkMiddleware;
    // export default thunk;
    // 所以thunk还有另外一种使用方式，可以带其他的参数

    // 漏了一点：看看异步的redux怎么写
    // someAction = () => (dispatch, getState) => { // balabala}
    // 大概想明白了其中的原理
    // 当执行到thunk的中间件时候，判断是否是函数，如不是（而是action）则是一个同步过程，如果是
    // 函数，则利用闭包，把dispatch和getState传递进去，这样，就可以在异步回调中，使用dispatch
    // 和 getState

    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
