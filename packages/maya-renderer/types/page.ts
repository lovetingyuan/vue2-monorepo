export interface ComponentConfig<T extends string = string, P = any> {
  type: T
  ref?: string
  isVisible?: any
  defaultValue?: any
  props?: P
  events?: any
  model?: string
  attributeName?: string
  slots?: {
    type: T
    name?: string
    isVisible?: any
    defaultValue?: any
    props?: P
    events?: any
    html?: string
    attributeName?: string
  }[]
}

// interface ChildComponentProps extends ComponentProps {
//    /** slot scope name */
//    name?: string
// }
// export interface ComponentConfig extends ComponentProps {
//   /** 子组件 */
//   slots?: ChildComponentProps[]
// }

export interface PageConfig<C extends ComponentConfig> {
  name: string
  metaId?: string
  version: string
  title?: string
  description?: string
  components: C[]
}

export interface MetaConfig {
  metaAttrs: any
}

type ToComps<T extends Record<string, any>> = {
  [k in keyof T]: ComponentConfig<k, T[k]>
}[keyof T]

export const definePageConfig = <PropsMap extends Record<string, any>>
  (config: PageConfig<ToComps<PropsMap>>) => config
