/**
 * 根据 project 入口提供的 routes 配置渲染 Route 组件
 */
import { createElement } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

function render({ route, opts, props }) {
  const routes = renderRoutes(
    {
      ...opts,
      routes: route.routes || [],
      rootRoutes: opts.rootRoutes,
    },
    { location: props.location },
  );

  let { component: Component, wrappers } = route;

  if (Component) {
    const newProps = {
      ...props,
      ...opts.extraProps,
      route,
      routes: opts.rootRoutes,
      name: opts.name,
      layoutConfig: opts.layoutConfig,
    };

    let ret = <Component {...newProps}>{routes}</Component>;

    if (wrappers) {
      let len = wrappers.length - 1;
      while (len >= 0) {
        ret = createElement(wrappers[len], newProps, ret);
        len -= 1;
      }
    }

    return ret;
  } else {
    return routes;
  }
}

function getRouteElement({ route, index, opts }) {
  const routeProps = {
    key: route.key || index,
    exact: route.exact,
    strict: route.strict,
    sensitive: route.sensitive,
    path: route.path,
  };
  if (route.redirect) {
    return <Redirect {...routeProps} from={route.path} to={route.redirect} />;
  } else {
    return (
      <Route
        {...routeProps}
        render={(props) => {
          return render({ route, opts, props });
        }}
      />
    );
  }
}

export default function renderRoutes(opts, switchProps = {}) {
  return opts.routes ? (
    <Switch {...switchProps}>
      {opts.routes.map((route, index) =>
        getRouteElement({
          route,
          index,
          opts: {
            ...opts,
            rootRoutes: opts.rootRoutes || opts.routes,
          },
        }),
      )}
      {/* 
        为什么要加这个 404 路由？解决两类问题：
        1. 多租户场景下，某些路由被屏蔽了，则应该自行跳转到 404 页面。
        比如  路由，假设在泰国站被屏蔽了，但是用户访问 的时候，还是会进入到  项目中，只是会渲染空白内容。
        这时候通过下面的 404 配置，就可以重定向到 404 页面
        2. 多租户场景下，应用被屏蔽了，则应该自行跳转到 404 页面。
        比如整个应用被屏蔽，讲道理应该进入兜底的 kucoin-main-web 项目。但现在的 mainWebExcludePaths 配置导致 项目的路由访问，
        进不去某些项目。此时就可以通过下面的 404 配置，重定向到 404 页面 
      */}
      <Redirect to="/404" />
    </Switch>
  ) : null;
}
