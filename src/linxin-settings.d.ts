declare module '@linxin666/dsh-client-ui-web-ui-settings' {
  import type { Context } from '@deepseek-ai/cordis'

  export const inject: string[]
  export function apply(ctx: Context): void
}
