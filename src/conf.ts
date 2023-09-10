import { default as t } from './type-guard'

export module Conf {
  const BufferId = t.string
  type BufferId = ReturnType<typeof BufferId>
  const WindowId = t.string
  type WindowId = ReturnType<typeof WindowId>
  const ColumnConf = t.string
  type ColumnConf = ReturnType<typeof ColumnConf>
  const AreasConf = t.array(t.string)
  type AreasConf = ReturnType<typeof AreasConf>
  const ScreenId = t.string
  type ScreenId = ReturnType<typeof ScreenId>
  const FrameId = t.string
  type FrameId = ReturnType<typeof FrameId>

  const BufferConf = t.object({
    id: BufferId,
    uri: t.string,
    useProxy: t.optional(t.boolean),
    content: t.optional(t.string),
  })
  export type BufferConf = ReturnType<typeof BufferConf>

  const WindowConf = t.object({
    id: WindowId,
    screenId: ScreenId,
    name: t.optional(t.string),
    mode: t.optional(t.string),
    bufferId: t.optional(BufferId),
  })
  export type WindowConf = ReturnType<typeof WindowConf>

  const ScreenConf = t.object({
    id: ScreenId,
    frameId: FrameId,
    name: t.optional(t.string),
    title: t.optional(t.string),
    columns: ColumnConf,
    areas: AreasConf,
  })
  export type ScreenConf = ReturnType<typeof ScreenConf>

  const FrameConf = t.object({
    id: FrameId,
    position: t.optional(t.string),
    activeScreen: ScreenId,
  })
  export type FrameConf = ReturnType<typeof FrameConf>

  const AppConf = t.object({
    frames: t.array(FrameConf),
    screens: t.array(ScreenConf),
    windows: t.array(WindowConf),
    buffers: t.array(BufferConf),
  })
  export type AppConf = ReturnType<typeof AppConf>

  export class ConfigLoader {
    path: string
    constructor(path: string) {
      this.path = path
    }
    async loadConfig() {
      let conf
      try {
        const json = await fetch(this.path)
        // const text = await json.text()
        // console.log(text)
        // debugger;
        conf = await json.json()
      } catch (e) {
        throw new Error(`error in fetch and parse config JSON: ${e}`)
      }
      const result = AppConf(conf)
      // console.log(PathReporter.report(result))
      return result
    }
  }
}
export default Conf
