import { statusCodeHandle, nodestatusCodeHandle } from './errorType'
import { OPFetch } from '@ones-op/fetch'
const Host = window.location.origin
const UserId = JSON.parse(localStorage.getItem('_ones_json_login_info')).uuid
const AuthToken = JSON.parse(localStorage.getItem('_ones_json_login_info')).token

const headers = {
  'Ones-User-Id': UserId,
  'Ones-Auth-Token': AuthToken,
}

// 请求标品接口：
export function request(url: string, method: string, body: object = {}) {
  let options
  let getOptions = { method: '', headers: headers }
  let postOptions = { method: '', body: '', headers: headers }
  if (method.toUpperCase() == 'GET') {
    getOptions.method = 'GET'
    options = getOptions
  } else {
    postOptions.method = 'POST'
    postOptions.body = JSON.stringify(body)
    options = postOptions
  }


  return fetch(Host + url, options)
    .then(async (res) => {  
      const responseCode = res.status
      let response
      let errorType = response?.['type'] ?? ''
      if (responseCode === 404 && res.type == 'basic') {
        response = {
          code: 404,
          reason: '接口请求找不到',
        }
      } else {
        response = await res.json()
      }
      return statusCodeHandle(responseCode, errorType, response)
    })
    .catch((err) => {
      console.log(err)
      return {}
    })
}

// 请求插件接口：
export function NodeOPrequest(url: string, method: string, body: object = {}) {
  let options
  let getOptions = { method: '', appid: 1 }
  let postOptions = { method: '', data: {}, appid: 1 }
  if (method.toUpperCase() == 'GET') {
    getOptions.method = 'GET'
    options = getOptions
  } else {
    postOptions.method = 'POST'
    postOptions.data = body
    options = postOptions
  }

  return OPFetch(Host + url, options)
    .then(async (res) => {
      return nodestatusCodeHandle(res.status, res.statusText, res)
    })
    .catch((err) => {
      return {
        status: err.response.status,
        reason: err.response?.data?.data?.msg || err.response.statusText
      }
    })
}
