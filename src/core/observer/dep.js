/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  // dep 实例对应的watcher对象、订阅者数组
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  // 添加新的订阅者 watcher 对象
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  // 移除订阅者
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  // 将观察对象和watcher 简历依赖
  depend () {
    if (Dep.target) {
      // 如果 target存在，把dep对象添加到 watcher的依赖中
      Dep.target.addDep(this)
    }
  }

  // 发布通知
  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// Dep.target 用来存放目前正在使用的 watcher；全局唯一 并且一次也只能有一个watcher被使用
// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null
const targetStack = []
// targetStack 要放入栈中的目的是？
// 因为vue2中，每个组件都会对应一个watcher对象，每个组件都会有 mountcomponent，
// 在实际开发中，组件中会调用子组件，那么就需要先将父组件的watcher先挂载起来，
// 等子组件渲染完毕后，再把父组件对应的 watcher 出栈，父组件继续渲染
export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  // 将watcher赋值给 Dep.target
  Dep.target = target
}

// 出栈
export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
