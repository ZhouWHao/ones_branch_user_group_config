
import { Logger } from '@ones-op/node-logger'
import { select, exec } from '@ones-op/node-database'

/**
 * 时长间隔单位
 */
export enum IntervalUnit {
    Minute = 1,
    Hour = 2,
    Day = 3
}


/**
 * 设置
 * @param interval 
 * @param unit 
 */
export async function set(interval: number, unit: IntervalUnit): Promise<void> {
    let milliseconds = 0
    switch (unit) {
        case IntervalUnit.Minute:
            milliseconds = interval * 60
            break;
        case IntervalUnit.Hour:
            milliseconds = interval * 3600
            break;
        case IntervalUnit.Day:
            milliseconds = interval * 3600 * 24
            break;
        default:
            throw new Error(`unknown unit: ${unit}`)
            break;
    }
    const next_at = (new Date().getTime() / 1000) + milliseconds
    try {
        await exec(
            'update',
            `update project_user_sync_cron set \`interval\`=${interval}, unit=${unit}, next_at=${next_at}`
        )
    } catch (err) {
        Logger.error('DAO[project_user_sync] set failed: ', err)
        throw err
    }
}

/**
 * 定时数据结果
 */
export interface SyncCron {
    interval: number
    unit: IntervalUnit
    next_at: number
}

/**
 * 获取定时数据
 * @returns 定时数据结果
 */
export async function get(): Promise<SyncCron> {
    try {
        const res: SyncCron[] = await select(
            `select \`interval\`,unit,next_at from project_user_sync_cron limit 1`
        )
        return res[0]
    } catch (err) {
        Logger.error('DAO[project_user_sync_cron] get failed: ', err)
        throw err
    }
}