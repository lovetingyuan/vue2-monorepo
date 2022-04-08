export interface FormSelectorProps {
    label?: string
    required?: boolean
    options?: Array<any>
    getOptions?: (...args: any[]) => any
    optionRelationNames?: object
    parentModel?: string
    entityId?: string | number
    attributeId?: string | number
    prop?: string
    getMetaOptionsDirect?: boolean
}
