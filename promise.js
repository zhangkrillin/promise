//IFFE匿名函数自调用
/* 
* excutor 执行器函数(同步)

*/
(function (window) {
  function Promise(excutor) {
    const me = this
    me.status = "pending" //给promise指定status状态,初始值为pending
    me.data = undefined  //给promise只一个存储结果数据的属性
    me.callbacks = []   //每个元素的结果 {onResloved(){}, onRejected(){}}
    function resolve(value) {
      if (me.status !== "pending") {
        return
      }
      me.status = 'resolved'
      me.data = value
      setTimeout(() => {
        if (me.callbacks.length) {
          me.callbacks.forEach(callbacksObj => {
            callbacksObj.onResolved(value)
          })
        }
      });
    }
    function reject(reason) {
      if (me.status !== "pending") {
        return
      }
      me.status = 'rejected'
      me.data = reason
      setTimeout(() => {
        if (me.callbacks.length) {
          me.callbacks.forEach(callbacksObj => {
            callbacksObj.onRejected(reason)
          })
        }
      });
    }
    try {
      excutor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }
  /* Promise实例对象 
*指定一个成功或者失败的回调函数
*返回一个新的Primse
  */
  Promise.prototype.then = function (onResolved, onRejected) {
    onResolved = typeof onResolved === "function" ? onResolved : value => value
    onRejected = typeof onRejected === "function" ? onRejected : reason => { throw reason }
    const me = this
    return new Promise((resolve, reject) => {
      function handler(callback) {
        try {
          const result = callback(me.data)
          if (result instanceof Promise) {
            result.then(resolve, reject)
          } else {
            resolve(result)
          }
        } catch (err) {
          reject(err)
        }
      }
      if (me.status === "resolved") {
        setTimeout(() => {
          handler(onResolved)
        });
      } else if (me.status === "rejected") {
        setTimeout(() => {
          handler(onRejected)
        });
      } else {
        me.callbacks.push({
          onResolved() {
            handler(onResolved)
          },
          onRejected() {
            handler(onRejected)
          }
        })
      }
    })
  }
  Promise.prototype.catch = function (onRejected) {
    return this.then(undefined, onRejected)
  }
  /* Promise 函数对象 resolve reject all race方法 */
  Promise.resolve = function (value) {
    return new Promise((resolve, reject) => {
      if (value instanceof Promise) {
        value.then(resolve, reject)
      } else {
        resolve(value)
      }
    })
  }
  Promise.reject = function (reason) {
    return new Promise((resolve, reject) => {
      reject(reason)
    })
  }
  Promise.all = function (promises) {
    return new Promise((resolve, reject) => {
      let arr = new Array(promises.length)
      let count = 0
      promises.forEach((p, index) => {
        p.then(
          value => {
            count++
            arr[index] = value
            if(count === promises.length){
              resolve(arr)
            }
          },
          reason => {
            reject(reason)
          }
        )
      })
    })
  }
  Promise.race = function (promises) { 
    return new Promise((resolve, reject) => {
      promises.forEach(p => {
        p.then(
          value => {
            resolve(value)
          },
          reason => {
            reject(reason)
          }
        )
      })
    })
  }
  window.Promise = Promise
})(window)