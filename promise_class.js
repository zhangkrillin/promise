const PENDINDG = 'pending'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'
class Promise {
  constructor(excutor) {
    const me = this
    me.status = PENDINDG
    me.data = undefined
    me.callbacks = []
    function resolve(value) {
      if (me.status !== PENDINDG) {
        return
      }
      me.status = RESOLVED
      me.data = value
      setTimeout(() => {
        if (me.callbacks.length) {
          me.callbacks.forEach(callbackObj => {
            callbackObj.onResolved(value)
          })
        }
      })
    }
    function reject(reason) {
      if (me.status !== PENDINDG) {
        return
      }
      me.status = REJECTED
      me.data = reason
      setTimeout(() => {
        if (me.callbacks.length) {
          me.callbacks.forEach(callbackObj => {
            callbackObj.onRejected(reason)
          })
        }
      })
    }
    try {
      excutor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }
  then(onResolved, onRejected) {
    return new Promise((resolve, reject) => {
      const me = this
      onResolved = typeof onResolved === "function" ? onResolved : value => value
      onRejected = typeof onRejected === "function" ? onRejected : reason => { throw reason }
      function handler(callback) {
        try {
          let result = callback(me.data)
          if (result instanceof Promise) {
            result.then(resolve, reject)
          } else {
            resolve(result)
          }
        } catch (error) {
          reject(error)
        }
      }
      if (me.status === RESOLVED) {
        setTimeout(() => {
          handler(onResolved)
        })
      } else if (me.status === REJECTED) {
        setTimeout(() => {
          handler(onRejected)
        })
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
  catch(onRejected) {
    return this.then(undefined, onRejected)
  }
  static resolve = function (value) {
    return new Promise((resolve, reject) => {
      if (value instanceof Promise) {
        value.then(resolve, reject)
      } else {
        resolve(value)
      }
    })
  }
  static reject = function (reason) {
    return new Promise((resolve, reject) => {
      reject(reason)
    })
  }
  static all = function (promises) {
    return new Promise((resolve, reject) => {
      let arr = new Array(promises.length)
      let count = 0
      promises.forEach((p, index) => {
        p.then(
          value => {
            count++
            arr[index] = value
            if (count === promises.length) {
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
  static race = function (promises) {
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
}