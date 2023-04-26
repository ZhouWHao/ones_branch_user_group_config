
/**
 * @params: data:传入的平级数组
 * @description: 平级数组转换为树级数组
 */
/** @name  平级转树级*/
export const getTreedata = (data, parentId = "") => {
    let tree = [];//新建空数组
    //遍历每条数据
    data.map((item) => {
        //每条数据中的和parentId和传入的相同
        if (item.parentId == parentId) {
            //就去找这个元素的子集去  找到元素中parentId==item.key 这样层层递归
            item.children = getTreedata(data, item.key);
            tree.push(item);
        }
    })
    return tree
}

/**
 * @params: tree:传入的树级数组
 * @description: 树级数组转换为平级
 */
/** @name  平级转树级*/
export const treeToArr = (tree) => {
    let arrs = [];
    let result = [];
    arrs = arrs.concat(tree);
    // 把数组中每一项全部拉平 
    while (arrs.length) {
        let first = arrs.shift(); // 弹出第一个元素
        // 直到每一项数据都没有children
        if (first.children) {
            //如果有children
            arrs = arrs.concat(first.children);
            delete first['children'];
        }
        result.push(first);
    }
    return result;
};

/**
 * @name: scrollPenetration for jane
 * @params: obj:传入对象
 * @description: 深拷贝
 */
/** @name 深拷贝 */
export const deepClone = (originObj: any) => {
    if (typeof originObj === "string") return originObj
    // 全局只能有一个记录的map，所以里面又嵌了一个方法
    const map = new WeakMap()
    function dp(obj: any) {
        const result: any = Array.isArray(obj) ? [] : {}
        const existObj = map.get(obj)
        // 检查map中是不是已经有这个对象了，有了就直接返回，不再递归
        if (existObj) {
            return existObj
        }
        // 没有就记录下来
        map.set(obj, result)
        for (let key of Reflect.ownKeys(obj)) {
            if (obj.hasOwnProperty(key)) {
                if (obj[key] && typeof obj[key] === "object") {
                    result[key] = dp(obj[key])
                } else {
                    result[key] = obj[key]
                }
            }
        }
        return result
    }
    return dp(originObj)
}



export function getSearch(key) {
    const url = window.location.href
    if (url.indexOf('?') == -1) {
        return ''
    } else {
        const arr = url.split('?')
        const str = arr[1]
        const arr1 = str.split('&')
        let res
        arr1.forEach(e => {
            let a = e.split('=')
            if (a[0] === key) {
                res = a[1]
            }
        })
        return res ? res : ""
    }
}

export function getUrlParams(url: string, key: string): string {
    let arr = url.split('/')
    let result = ''
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === key) {
            result = arr[i + 1]
        }
    }
    return result
}
/**
* @fn : 要执行的函数
* @delay : 每次函数的时间间隔
*/
export function throttle(fn, delay) {
    let timer;    // 定时器
    return function (...args) {
        let context = this;
        // 如果timer存在，说明函数还未该执行
        if (timer) return;
        timer = setTimeout(function () {
            // 当函数执行时，让timer为null。
            timer = null;
            fn.apply(context, args);
        }, delay);
    }
}
// isFirstExecution为true时只执行第一次，为false时只执行最后一次
let debounceTimer = null;
export function debounce(callback, duration, isFirstExecution) {
    return function (...args) {
        let ctx = this;
        const delay = function () {
            debounceTimer = null;
            if (!isFirstExecution) callback.apply(ctx, args);
        };
        let executeNow = isFirstExecution && !debounceTimer;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(delay, duration);
        if (executeNow) callback.apply(ctx, args);
    };
};