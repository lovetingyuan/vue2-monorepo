/**
 * @description: getCookieByName
 * @param {string} name cookie key
 * @return {*}
 */
const getCookie = function (name: string) {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
};

export function insertLoadingCss() {
  const id = 'page-loading-style';
  let loadingStyle = document.getElementById(id);
  if (!loadingStyle) {
    loadingStyle = document.createElement('style');
    loadingStyle.id = id;
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
    `;
    loadingStyle.textContent = loadingCss;
    document.head.appendChild(loadingStyle);
  }
}

function loadUMD(version: string) {
  const url = `https://npm.cdn/renderer-${version}/renderer.umd.js`;

  if (!(window as any).MayaRenderer) {
    const script = document.createElement('script');
    script.src = url;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
    return new Promise((resolve, reject) => {
      script.onload = () => resolve((window as any).MayaRenderer);
      script.onerror = reject;
    });
  }
  return Promise.resolve((window as any).MayaRenderer);
}

export function loadRenderer(version: string) {
  if (import.meta.env.DEV) {
    return import('renderer').then((res) => {
      if (version && res.Renderer.version !== version) {
        return loadUMD(version);
      }
      return res;
    });
  }
  return loadUMD(version);
}
