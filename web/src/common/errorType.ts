export function statusCodeHandle(statusCode, errorType, response) {
  switch (statusCode) {
    case 200:
      return {
        status: 200,
        data: response,
      }
    case 401:
      return {
        status: 401,
        reason: '用户未登录或登录已过期，请重新登录',
      }
    case 400:
      switch (errorType) {
        case 'VerificationFailure':
          return {
            status: 400,
            reason: '校验失败',
          }
        case 'Timeout':
          return {
            status: 400,
            reason: '操作超时',
          }
        case 'MissingParameter':
          return {
            status: 400,
            reason: '缺少必要参数',
          }
        case 'InUse':
          return {
            status: 400,
            reason: '资源正在使用中',
          }
        case 'InvalidParameter':
          return {
            status: 400,
            reason: '参数不合法',
          }
        case 'Malformed':
          return {
            status: 400,
            reason: '数据格式不正确，解析失败',
          }
        case 'InvalidFileExt':
          return {
            status: 400,
            reason: '用户上传的文件后缀不合法',
          }
        default:
          return response
      }
    case 403:
      switch (errorType) {
        case 'ConstraintViolation':
          return {
            status: 403,
            reason: '未满足指定的约束条件',
          }
        case 'PermissionDenied':
          return {
            status: 403,
            reason: '用户没有权限',
          }
        case 'LimitExceeded':
          return {
            status: 403,
            reason: '资源的使用超出了限额',
          }
        case 'AccessDenied':
          return {
            status: 403,
            reason: '用户没有权限',
          }
        case 'Blocked':
          return {
            status: 403,
            reason: '用户被封禁',
          }
        default:
          return response
      }
    case 404:
      switch(errorType){
        case '':
          return response
        case 'NotFound':
          return {
            status: 404,
            reason: '资源不存在',
          }
        default:
          return response
      }
    case 409:
      return {
        status: 409,
        reason: '资源已存在，无法添加',
      }
    case 410:
      return {
        status: 410,
        reason: '接口停用',
      }
    case 500:
      switch (errorType) {
        case 'Deleted':
          return {
            status: 500,
            reason: '资源被删除',
          }
        case 'CorruptedData':
          return {
            status: 500,
            reason: '脏数据',
          }
        case 'UnexpectedArguments':
          return {
            status: 500,
            reason: '意料之外的参数',
          }
        case 'SourceDeleted':
          return {
            status: 500,
            reason: '资源源被删除',
          }
        case 'SQLError':
          return {
            status: 500,
            reason: '由MySQL产生的错误',
          }
        case 'UnknownError':
          return {
            status: 500,
            reason: '未知错误',
          }
        case 'AppStoreBotError':
          return {
            status: 500,
            reason: '由AppStore爬虫产生的错误',
          }
        case 'ElasticSearchError':
          return {
            status: 500,
            reason: '由ElasticSearch产生的错误',
          }
        case 'LeanCloudError':
          return {
            status: 500,
            reason: '由LeanCloud产生的错误',
          }
        case 'WechatError':
          return {
            status: 500,
            reason: '由Wechat产生的错误',
          }
        case 'BadConfig':
          return {
            status: 500,
            reason: '配置文件错误',
          }
        case 'TelesignError':
          return {
            status: 500,
            reason: '由Telesign产生的错误',
          }
        case 'RedisError':
          return {
            status: 500,
            reason: '由Redis产生的错误',
          }
        case 'ServerError':
          return {
            status: 500,
            reason: '服务器内部错误',
          }
        case 'TypeMismatch':
          return {
            status: 500,
            reason: '变量类型不符合预期要求',
          }
        case 'DingDingError':
          return {
            status: 500,
            reason: '由DingDing产生的错误',
          }
        case 'InvalidEnum':
          return {
            status: 500,
            reason: '无效的枚举值',
          }
        case 'KeyConflict':
          return {
            status: 500,
            reason: '主键冲突',
          }
        case 'OutLimit':
          return {
            status: 500,
            reason: '超出限制',
          }
        default:
          return response
      }
    default:
      return response
  }
}


export function nodestatusCodeHandle(status, statusText, response) {
  if (status == 200) {
    // 请求成功
    return {
      status: response.status,
      data: response.data.data,
    }
  } else {
    return {
      status: status,
      reason: response.data.data,
    }
  }
}
