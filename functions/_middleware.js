// middleware — o painel mora no mesmo projeto do site
import { atender } from "../painel/nuvem.mjs"

export async function onRequest(context) {
  return atender(context)
}
