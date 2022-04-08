/**
 * @description: getCookieByName
 * @param {string} name cookie key
 * @return {*}
 */
const getCookie = function (name: string) {
  const nameEQ = `${name}=`
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length)
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length)
    }
  }
  return null
}
declare global {
  interface Window {
    Owl: {
      addError: any,
      errorModel: any
    };
  }
}

/**
 * @description: 上报错误
 * @param {string} type
 * @param {Error} error
 * @param {string} category
 * @return {*}
 */
export function reportError(type: string, error: string | Error | Record<string, any>, category = 'jsError') {
  if (!window.Owl) { return }
  let errorMsg = ''
  if (typeof error === 'string') {
    errorMsg = error
  } else if (Object.prototype.toString.call(error) === '[object Error]') {
    errorMsg = JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
  } else {
    errorMsg = error ? JSON.stringify(error, null, 2) : ''
  }
  window.Owl.addError(
    {
      name: type,
      msg: errorMsg,
    },
    {
      level: window.Owl.errorModel.LEVEL.ERROR,
      combo: false,
      category,
    }
  )
}

/**
 * @description: 从 Horn 获取配置信息
 * @param {string} module horn 配置标识
 * @param {string} key 字段名称，默认为 config
 * @return {*}
 */
export async function getHornConfig({
  module = '',
  key = 'config',
  env,
}: {
  module: string
  key: string
  env: 'production' | 'test' | 'development'
}) {
  // 为了支持灰度，url 传递 poiId 和 misId
  const poiId = (window as any).poiIdHeader || ''
  const misId = getCookie('msid') || ''
  const env2 = env === 'production' ? 'prod' : 'test'
  const url = `//portal-portm.meituan.com/horn/v1/modules/${module}/${env2}?poiId=${poiId}&misId=${misId}`
  try {
    const result = await fetch(url).then((response) => response.json())
    return result[key]
  } catch (error) {
    reportError('CONFIGURATION_ERROR', {
      msg: `${url} getHornConfig error`,
      error,
    })
    return null
  }
}

/**
 * @description: 某场景下所有元数据属性集
 * @param {*} metaEntityId
 * @return {*}
 */
export async function getMetaConfig(metaEntityId: string) {
  const url = `/api/m/logistics/wms/metadataeav/entity/template/load?entityId=${metaEntityId}`
  try {
    const res = await fetch(url).then((response) => response.json())

    if (res.code === 0) {
      return res.data.str
    }
  } catch (error) {
    console.error('getMetaConfig', error)
    reportError('CONFIGURATION_ERROR', {
      msg: `${url} getMetaConfig error`,
      error,
    })
  }
  return null
}

export function insertLoadingCss() {
  const id = 'maya-page-loading-style'
  let loadingStyle = document.getElementById(id)
  if (!loadingStyle) {
    loadingStyle = document.createElement('style')
    loadingStyle.id = id
    const loadingCss = `
    .el-loading-parent--relative {
      position: relative !important;
    }
    .el-loading-parent--hidden {
      overflow: hidden !important;
    }
    .el-loading-mask {
      display: block;
      position: absolute;
      z-index: 2000;
      background-color: rgba(255, 255, 255, 0.9);
      margin: 0;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      -webkit-transition: opacity 0.3s;
      transition: opacity 0.3s;
    }
    .el-loading-mask.is-fullscreen {
      position: fixed;
    }
    .el-loading-mask.is-fullscreen .el-loading-spinner {
      margin-top: -100px;
    }
    .el-loading-mask.is-fullscreen .el-loading-spinner .circular {
      height: 50px;
      width: 50px;
    }
    .el-loading-spinner {
      top: 50%;
      width: 100%;
      text-align: center;
      position: absolute;
    }
    .el-loading-spinner .el-loading-text {
      color: #409eff;
      margin: 20px 0;
      font-size: 16px;
      font-weight: bold;
      letter-spacing: 2px;
      user-select: none;
    }
    .el-loading-spinner .circular {
      height: 42px;
      width: 42px;
      -webkit-animation: loading-rotate 2s linear infinite;
      animation: loading-rotate 2s linear infinite;
    }
    .el-loading-spinner .path {
      -webkit-animation: loading-dash 1.5s ease-in-out infinite;
      animation: loading-dash 1.5s ease-in-out infinite;
      stroke-dasharray: 90, 150;
      stroke-dashoffset: 0;
      stroke-width: 2;
      stroke: #409eff;
      stroke-linecap: round;
    }
    .el-loading-spinner i {
      color: #409eff;
    }
    .el-loading-fade-enter,
    .el-loading-fade-leave-active {
      opacity: 0;
    }
    @-webkit-keyframes loading-rotate {
      100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }
    @keyframes loading-rotate {
      100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }
    @-webkit-keyframes loading-dash {
      0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
      }
      50% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -40px;
      }
      100% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -120px;
      }
    }
    @keyframes loading-dash {
      0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
      }
      50% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -40px;
      }
      100% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -120px;
      }
    }
    `
    loadingStyle.textContent = loadingCss
    document.head.appendChild(loadingStyle)
  }
}

function loadUMD(version: string) {
  const url = `https://s3.meituan.net/mnpm-cdn/@yxfe-maya-renderer-${version}/maya-renderer.umd.js`

  if (!(window as any).MayaRenderer) {
    const script = document.createElement('script')
    script.src = url
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)
    return new Promise((resolve, reject) => {
      script.onload = () => resolve((window as any).MayaRenderer)
      script.onerror = reject
    })
  }
  return Promise.resolve((window as any).MayaRenderer)
}

export function loadRenderer(version: string) {
  if (import.meta.env.DEV) {
    return import('@yxfe/maya-renderer').then((res) => {
      if (version && res.Renderer.version !== version) {
        return loadUMD(version)
      }
      return res
    })
  }
  return loadUMD(version)
}
