const DEFAULT_VALUE_MAP = {
  string: '',
  boolean: '',
  integer: '',
  number: '',
  object: {},
  array: [],
}

export const getDefaultValue = (type: keyof typeof DEFAULT_VALUE_MAP) => {
  return (type in DEFAULT_VALUE_MAP ? DEFAULT_VALUE_MAP[type] : null)
}

export const getQuery = (search?: string) => {
  const params = new URLSearchParams(search || window.location.search)
  const query: Record<string, string> = {}
  params.forEach((v, k) => {
    query[k] = v
  })
  return query;
}
