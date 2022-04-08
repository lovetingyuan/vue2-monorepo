import crypto from 'crypto'
import { Connect, createLogger, ViteDevServer } from 'vite';
import fetch from 'node-fetch'
import type { ServerResponse } from 'http'

const logger = createLogger('error', {
  prefix: '@yxfe/vite-plugin-iframe-pages/auth',
})

/**
  美团验证的逻辑
  Authorization = "MWS" + " " + client_id + ":" + signature;
  signature = base64( HMAC-SHA1(( string_to_sign, client_secret ) ) );
  string_to_sign = HTTP-Verb + " " + REQUEST_URI + "\n" + Date;
  HTTP-Verb = GET | POST | DELETE | PUT
  REQUEST_URI : 指请求URI，不包含 ? 以及 query_string
  Date ：是 Http Header 里的 Date 字段；
*/
function createMTAuthHeaders(authInfo: {
  clientId: string
  clientSecret: string
  uri: string
  date?: Date
  method: 'GET' | 'POST' | 'DELETE' | 'PUT'
}) {
  const dateStr = (authInfo.date || new Date()).toUTCString();
  const stringToSign = `${authInfo.method} ${authInfo.uri}\n${dateStr}`;
  const signature = crypto
    .createHmac('sha1', authInfo.clientSecret)
    .update(stringToSign)
    .digest('base64');
  const authorization = `MWS ${authInfo.clientId}:${signature}`;
  return {
    Date: dateStr,
    Authorization: authorization
  };
}

const ssoConfig = {
  ssoHost: 'http://ssosv.it.beta.sankuai.com',
  ssoAppKey: 'bdce0e1442',
  ssoSecret: '1d463734b9114464931c49a76ce7472d',
  ssoSalt: '0d8c65ea4257a0701b398ba5627aab3ad747a7bd9ed043be54b5794e20595fc94661b6f9751c9c0c',
}

const cookieUserIDKey = 'muid';
const cookieMisIDKey = 'msid';
const cookieUserName = 'muname';
const oldCookieTokenKey = 'ssoid'; // 处理中改成ssoAppKey + ssoid
const cookieTokenKey = `${ssoConfig.ssoAppKey}_${oldCookieTokenKey}`;
const cookieRefreshTokenKey = `${ssoConfig.ssoAppKey}_ssorid`;

const getCookie = (req: Connect.IncomingMessage, name: string) => {
  const cookies = req.headers.cookie?.split(';') || []
  let cookie = ''
  cookies.find(c => {
    const cc = c.trim()
    if (cc.startsWith(`${name}=`)) {
      cookie = cc.split('=')[1]
      return true;
    }
    return false;
  })
  return cookie;
}

const getToken = async (code = '') => {
  const tokenPath = '/sson/oauth2.0/access-token';
  const tokenUrl = `${ssoConfig.ssoHost}${tokenPath}?code=${code}&t=${Date.now()}`;
  const method = 'GET'
  return fetch(tokenUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...createMTAuthHeaders({
        clientId: ssoConfig.ssoAppKey,
        clientSecret: ssoConfig.ssoSecret,
        uri: tokenPath,
        method
      })
    },
  }).then(r => r.json()).then(authData => {
    if (authData.code === 200 && authData.data?.accessToken) {
      return authData.data
    }
    return Promise.reject(new Error(`Failed to get token, ${authData.code}`))
  }).catch(err => {
    logger.error(`Failed to get login token, ${err.message}`)
  })
}

const getUserInfo = (token: string) => {
  const method = 'POST'
  const uri = '/open/api/session/userinfo';
  return fetch(`${ssoConfig.ssoHost}${uri}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...createMTAuthHeaders({
        clientId: ssoConfig.ssoAppKey,
        clientSecret: ssoConfig.ssoSecret,
        uri,
        method
      })
    },
    body: JSON.stringify({
      accessToken: token
    })
  }).then(r => r.json()).then((userData) => {
    if (userData.code === 200 && userData.data?.uid) {
      return userData.data;
    }
    return Promise.reject(new Error(`Failed to get user info, ${userData.code}`))
  }).catch(err => {
    logger.error(`Failed to get user info, ${err.message}`)
  });
}

const login = (req: Connect.IncomingMessage, res: ServerResponse, origin: string) => {
  const redirectUrl = encodeURIComponent(`${origin}/sso/callback?originalUrl=${encodeURIComponent(req.originalUrl as string)}`);
  const Location = `${ssoConfig.ssoHost}/sson/login?redirect_uri=${redirectUrl}&client_id=${ssoConfig.ssoAppKey}`
  res.writeHead(302, { Location, }).end();
}

export default function getAuthMiddleware(server: ViteDevServer): Connect.NextHandleFunction {
  const { https } = server.config.server
  return async function (req, res, next) {
    if (!req.originalUrl) {
      return next()
    }
    const origin = `http${https ? 's' : ''}://${req.headers.host}`
    const { pathname, searchParams } = new URL(req.originalUrl, origin)

    if (pathname === '/sso/callback') {
      const code = searchParams.get('code') || ''
      const tokenInfo = await getToken(code)
      if (!tokenInfo) {
        return login(req, res, origin)
      }
      const {
        accessToken, expires, refreshToken, refreshExpires
      } = tokenInfo
      const now = Date.now()
      const cookieExpires = new Date(accessToken ? now + expires * 1000 : now - 1).toUTCString()
      const cookieRefreshExpires = new Date(refreshToken ? now + refreshExpires * 1000 : now - 1).toUTCString()
      const userData = await getUserInfo(accessToken);
      if (!userData) {
        return login(req, res, origin)
      }
      res.writeHead(302, {
        location: origin + decodeURIComponent((searchParams.get('originalUrl') || '/')),
        'set-cookie': [
          `${cookieTokenKey}=${accessToken}; path=/; HttpOnly; expires=${cookieExpires}`,
          `${oldCookieTokenKey}=${accessToken}; path=/; HttpOnly; expires=${cookieExpires}`,
          `${cookieRefreshTokenKey}=${refreshToken}; path=/; HttpOnly; expires=${cookieRefreshExpires}`,
          `${cookieMisIDKey}=${userData.loginName}; path=/`,
          `${cookieUserIDKey}=${userData.uid}; path=/`,
          `${cookieUserName}=${encodeURIComponent(userData.name)}; path=/; HttpOnly`
        ]
      })
      res.end();
      return null;
    }

    // if (pathname === '/auth/logout') {
    //   const redirectUri = encodeURIComponent(`${origin}/sso/callback?${searchParams}`);
    //   const Location = `${ssoConfig.ssoHost}/sson/logout?redirect_uri=${redirectUri}&client_id=${ssoConfig.ssoAppKey}&t=${Date.now()}`
    //   res.writeHead(302, { Location }).end();
    //   return
    // }

    const token = getCookie(req, cookieTokenKey) || getCookie(req, oldCookieTokenKey);
    if (!token) {
      return login(req, res, origin)
    }
    const userInfo = await getUserInfo(token)
    if (!userInfo) {
      return login(req, res, origin)
    }

    return next()
  }
}
