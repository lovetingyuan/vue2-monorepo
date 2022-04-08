function loadUMD(version: string) {
  const url = `https://npm.cdn/renderer-${version}/renderer.umd.js`;

  if (!(window as any).ConfigRenderer) {
    const script = document.createElement('script');
    script.src = url;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
    return new Promise((resolve, reject) => {
      script.onload = () => resolve((window as any).ConfigRenderer);
      script.onerror = reject;
    });
  }
  return Promise.resolve((window as any).ConfigRenderer);
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
