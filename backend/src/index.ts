import { Logger } from '@ones-op/node-logger'
import type { PluginRequest, PluginResponse } from '@ones-op/node-types'
import { importSQL } from '@ones-op/node-database'

// Method called when the team level plugin is being installed.
export async function Install() {
  try {
    await importSQL('plugin.sql')
  } catch (error) {
    Logger.error('ERROR: ', error)
  }
  Logger.info('[Plugin] Install')
}

// Method called when the team level plugin is being launched.
export async function Enable() {
  Logger.info('[Plugin] Enable')
}

// Method called when the team level plugin is being suspended.
export function Disable() {
  Logger.info('[Plugin] Disable')
}

// Method called when the team level plugin is being uninstalled.
export function UnInstall() {
  Logger.info('[Plugin] UnInstall')
}

// Method called when the team level plugin is being upgraded.
export function Upgrade(oldPluginInfo) {
  const oldVersion = oldPluginInfo.version
  Logger.info('[Plugin] Upgrade', 'old version:', oldVersion)
}

/*
    Method called when the organization level plugin is being installed.

    Request parameter description:
    request:
      request.parsedHeaders state multi-language, for example,when the request user context is chinese,
      the parameter will be {"Accept-Language":["zh"]}, there are other cases like {"Accept-Language":["en"]},
      {"Accept-Language":["ja"]}.
    teamUUIDList:
      The uuid list with the team which installed by this time.
    firstInstall:
      True if plugin has never been installed.
 */
export async function OrgInstall(
  request: PluginRequest,
  teamUUIDList: string[],
  firstInstall: boolean
) {
  Logger.info('[Plugin] OrgInstall')
}

/*
    Method called when the organization level plugin is being launched.

    Request parameters description:
    request:
      request.parsedHeaders state multi-language, for example,when the request user context is chinese,
      the parameter will be {"Accept-Language":["zh"]}, there are other cases like {"Accept-Language":["en"]},
      {"Accept-Language":["ja"]}.
    teamUUIDList:
      The uuid list with the team which launched by this time.

    Response parameters description:
      Return the failed team uuid list.
 */
export function OrgEnable(
  request: PluginRequest,
  teamUUIDList: string[]
): void | string[] | Promise<string[]> {
  Logger.info('[Plugin] OrgEnable')
  return []
}

/*
    Method called when the organization level plugin is being suspended.

    Request parameters description:
    request:
      request.parsedHeaders state multi-language, for example,when the request user context is chinese,
      the parameter will be {"Accept-Language":["zh"]}, there are other cases like {"Accept-Language":["en"]},
      {"Accept-Language":["ja"]}.
    teamUUIDList:
      The uuid list with the team which suspended by this time.

    Response parameters description:
      Return the failed team uuid list.
 */
export function OrgDisable(
  request: PluginRequest,
  teamUUIDList: string[]
): void | string[] | Promise<string[]> {
  Logger.info('[Plugin] OrgDisable')
  return []
}

/*
    Method called when the organization level plugin is being uninstalled.

    Request parameters description:
    request:
      request.parsedHeaders state multi-language, for example,when the request user context is chinese,
      the parameter will be {"Accept-Language":["zh"]}, there are other cases like {"Accept-Language":["en"]},
      {"Accept-Language":["ja"]}.
    teamUUIDList:
      The uuid list with the team which uninstalled by this time.
 */
export function OrgUnInstall(request: PluginRequest, teamUUIDList: string[]) {
  Logger.info('[Plugin] OrgUnInstall')
}

/*
    Method called when the organization level plugin is being upgraded.

    Request parameters description:
    request:
      request.parsedHeaders state multi-language, for example,when the request user context is chinese,
      the parameter will be {"Accept-Language":["zh"]}, there are other cases like {"Accept-Language":["en"]},
      {"Accept-Language":["ja"]}.
    teamUUIDList:
      The uuid list with the team which upgraded by this time.
 */
export function OrgUpgrade(oldPluginInfo: any, request: PluginRequest, teamUUIDList: string[]) {
  const oldVersion = oldPluginInfo.version
  Logger.info('[Plugin] OrgUpgrade', 'old version:', oldVersion)
}

// example function
export async function hello(request: PluginRequest): Promise<PluginResponse> {
  const body = request.body || {}
  Logger.info('[Plugin] hello ======= 请求成功')
  return {
    body: {
      res: 'hello world',
      requestBody: body,
    },
  }
}

export * from './controller'
export * from './timer-task'
