import ReactDOM from 'react-dom';
import { matchPath, Router, Redirect } from 'react-router-dom';
import { tenant } from '@config/tenant';
import createDva from '@kucoin-base/dva';
import history, { createAppHistory } from '@kucoin-base/history';
import { basename } from '@kucoin-base/i18n';
import remoteTools from '@kucoin-biz/tools';
import loadJson from '@utils/loadJson';
import { setProject } from '@utils/project';
import { aBTestApplicationController } from '@utils/abTest';
import isFunction from '@utils/isFunction';
import App from '@/App';

const { remoteEvent } = remoteTools;

const historyWithLng = Object.assign(history, {});
const apps = [];
let activeApp = null;
let linksToRemove = [];

const defaultApp = {
  name: 'kucoin-base',
  load() {
    return import('@config/defaultApp');
  },
};

async function addImportMap(entry, name) {
  if (!window._useSSG) {
    const importMap = await loadJson(entry);
    System.addImportMap(importMap);
    if (navigator.userAgent.indexOf('SSG_ENV') !== -1) {
      const innerScript = document.createElement('script');
      innerScript.setAttribute('type', 'systemjs-importmap');
      innerScript.setAttribute('data-importmap-ssg', name);
      innerScript.text = JSON.stringify(importMap);
      document.head.appendChild(innerScript);
    }
    return importMap;
  } else {
    // 如果 ssg 在生成的时候创建了对应的 import-map，则这里不需要再次加载
    const appInnerImportMap = document.querySelector(`script[data-importmap-ssg="${name}"]`);
    if (!appInnerImportMap) {
      const importMap = await loadJson(entry);
      System.addImportMap(importMap);
    }
    return null;
  }
}

function getAppNames() {
  return apps.map((app) => app.name);
}

function preloadCss(appName) {
  try {
    const url = System.resolve(`${appName}/app@css`);
    if (url) {
      const preloadEl = document.querySelector(`link[rel="preload"][as="style"][href="${url}"]`);

      if (!preloadEl) {
        const linkEl = document.createElement('link');
        linkEl.rel = 'preload';
        linkEl.setAttribute('as', 'style');
        linkEl.href = url;

        document.head.appendChild(linkEl);
      }
    }
  } catch (e) {
    console.log(`kucoin-base: Resolve ${appName} css entry failed!`);
  }
}

function createAndAppendLink(url) {
  const existingLinkEl = document.querySelector(`link[rel="stylesheet"][href="${url}"]`);
  if (!existingLinkEl) {
    const linkEl = document.createElement('link');
    linkEl.href = url;
    linkEl.rel = 'stylesheet';
    document.head.appendChild(linkEl);
    linksToRemove.push(linkEl);
  }
}

function loadCss(appName, activeAppImportMap) {
  try {
    const importMap = activeAppImportMap.imports;
    const cssKeys = Object.keys(importMap).filter((v) => v.includes('@css'));
    const urls = cssKeys.map((key) => importMap[key]);
    urls.forEach((url) => createAndAppendLink(url));
  } catch (e) {
    console.log(`kucoin-base: Resolve ${appName} css entry failed!`);
  }
}

function removeCss() {
  const links = linksToRemove;
  linksToRemove = [];
  links.forEach((linkEl) => {
    if (linkEl.parentNode) {
      linkEl.parentNode.removeChild(linkEl);
    }
  });
}

export function registerApplication(config) {
  if (getAppNames().indexOf(config.name) !== -1) {
    throw Error(`There is already a registered app named ${config.name}`);
  }
  apps.push(config);
  // 预加载 css
  preloadCss(config.name);
}

export function start(rootElement) {
  return historyWithLng.listen((location) => {
    recordHistoryUrls();
    appPerformanceChange(rootElement, location);
  });
}

function rewriteHistoryAction(activeWhen, originAction, isReplace) {
  if (!activeWhen) return originAction;
  return function (to, state) {
    let path;
    if (typeof to === 'string') {
      path = to.split('?')[0];
    }
    if (Object.prototype.toString.call(to) === '[object Object]') {
      path = to.pathname;
    }
    const inner = activeWhen({ pathname: path });

    if (inner) {
      return originAction(to, state);
    } else {
      const _url =
        typeof to === 'string' ? basename + to : basename + to.pathname + (to.search || '');
      if (isReplace) location.replace(_url);
      else location.href = _url;
    }
  };
}

// 把用户最近的 4 个路径记录到 sessionStorage 中，用户上报 404 时，追踪来源地址
// 在 kucoin-main-web 上报 sentry 的时候，会消费这个信息
async function recordHistoryUrls() {
  try {
    const urls = JSON.parse(sessionStorage.getItem('KC_LATEST_URLS')) || [];
    const pathname = window.location.pathname;
    if (pathname.includes('/404')) {
      return;
    }
    if (urls.length >= 4) {
      urls.shift();
    }
    urls.push(window.location.href);
    sessionStorage.setItem('KC_LATEST_URLS', JSON.stringify(urls));
  } catch (e) {}
}

async function appPerformanceChange(rootElement, location) {
  await aBTestApplicationController.init(location);

  let nextApp = apps.find((o) => {
    // 如果配置了 activeBrandKeys，并且当前租户不在其中，则不展示
    // 如果没有配置 activeBrandKeys，则不做限制
    if (o.activeBrandKeys && !o.activeBrandKeys.includes(tenant)) {
      return false;
    }
    return o.activeWhen(location);
  });

  nextApp = nextApp || defaultApp;

  if (nextApp !== activeApp) {
    if (activeApp !== null && rootElement.hasChildNodes()) {
      removeCss();
      ReactDOM.unmountComponentAtNode(rootElement);
    }
    activeApp = nextApp;
    // 标记下当前全局是哪个应用
    setProject(activeApp.name);
    history.push = rewriteHistoryAction(activeApp.activeWhen, history.push);
    history.replace = rewriteHistoryAction(activeApp.activeWhen, history.replace, true);
    // 加载应用入口 import-map.json
    let activeAppImportMap = null;
    if (activeApp.entry) {
      activeAppImportMap = await addImportMap(activeApp.entry, activeApp.name);
    }

    const appContext = Object.create(null);
    appContext.history = history;
    if (Object.prototype.toString.call(activeApp.historyOptions) === '[object Object]') {
      // 根据应用自己的 history 配置，创建新的 history

      appContext.history = createAppHistory(activeApp.historyOptions);
    }

    window.__kc_ssg_history__ = appContext.history;

    appContext.dva = createDva();

    remoteEvent.on(remoteEvent.evts.GET_DVA, (sendDva) => {
      if (isFunction(sendDva)) {
        sendDva(appContext.dva);
      }
    });

    const runtimeConfig = await activeApp.load();
    appContext.routes = combineBaseRoute(runtimeConfig.routes);
    appContext.Root = runtimeConfig.Root;
    if (activeAppImportMap) {
      loadCss(activeApp.name, activeAppImportMap);
    }

    if (isFunction(runtimeConfig.bootstrap)) {
      await runtimeConfig.bootstrap(appContext?.history?.location?.pathname);
    }
    //记录水合时间，上报 App 的统计日志
    const hydrateStart = performance.now();

    if (window._useSSG) {
      preloadComponent(appContext.routes, appContext.history.location.pathname).then(function () {
        ReactDOM.hydrate(<App app={appContext} />, rootElement, () => {
          const hydrateEnd = performance.now();
          window.HYDRATETIME = hydrateEnd - hydrateStart;
          // console.log(`Hydration took ${hydrateEnd - hydrateStart} milliseconds.`);
        });
      });
    } else {
      ReactDOM.render(<App app={appContext} />, rootElement, () => {
        const hydrateEnd = performance.now();
        window.RENDERTIME = hydrateEnd - hydrateStart;
        // console.log(`render took ${hydrateEnd - hydrateStart} milliseconds.`);
      });
    }
  }
}

function combineBaseRoute(subRoutes) {
  // 由于目前 layout 的实现是在业务项目中，这里的 patch 添加到 subRoutes[0].routes 中
  // layout 抽象到基座后，需要做以下修改
  // 1. config/routes 添加 / 匹配，组件为 Layout 组件
  // 2. 这里的 patch 实现修改为，将 subRoutes 添加到 baseRoutes.routes 中
  const baseRoutes = [
    {
      path: '*',
      component: () => <Redirect to="/404" />,
    },
  ];
  if (subRoutes[0]?.routes) {
    subRoutes[0].routes = subRoutes[0].routes.concat(baseRoutes);
  }
  return subRoutes;
}

async function preloadComponent(readyRoutes, pathname) {
  const matchedRoutes = matchRoutes(readyRoutes, pathname);
  for (const matchRoute of matchedRoutes) {
    const route = matchRoute.route;
    if (typeof route.component !== 'string' && route.component?.preload) {
      const preloadComponent = await route.component.load();
      route.component = preloadComponent.default || preloadComponent;
    }
    if (route.routes) {
      route.routes = await preloadComponent(route.routes, pathname);
    }
  }
  return readyRoutes;
}

function matchRoutes(routes, pathname, /*not public API*/ branch = []) {
  routes.some((route) => {
    const match = route.path
      ? matchPath(pathname, route)
      : branch.length
      ? branch[branch.length - 1].match // use parent match
      : Router.computeRootMatch(pathname); // use default "root" match

    if (match) {
      branch.push({ route, match });

      if (route.routes) {
        matchRoutes(route.routes, pathname, branch);
      }
    }

    return match;
  });

  return branch;
}
