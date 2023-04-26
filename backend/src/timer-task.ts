import * as service from "./service"

export async function taskAction() {
  await service.sync_by_timer()
}
