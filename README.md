# @rc-component/Listy

React Listy Component

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]
[![build status][github-actions-image]][github-actions-url]
[![Test coverage][codecov-image]][codecov-url]
[![bundle size][bundlephobia-image]][bundlephobia-url]
[![dumi][dumi-image]][dumi-url]

[npm-image]: http://img.shields.io/npm/v/@rc-component/listy.svg?style=flat-square
[npm-url]: http://npmjs.org/package/@rc-component/listy
[github-actions-image]: https://github.com/react-component/listy/workflows/CI/badge.svg
[github-actions-url]: https://github.com/react-component/listy/actions
[codecov-image]: https://img.shields.io/codecov/c/github/react-component/listy/master.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/react-component/listy/branch/master
[david-url]: https://david-dm.org/react-component/listy
[david-image]: https://david-dm.org/react-component/listy/status.svg?style=flat-square
[david-dev-url]: https://david-dm.org/react-component/listy?type=dev
[david-dev-image]: https://david-dm.org/react-component/listy/dev-status.svg?style=flat-square
[download-image]: https://img.shields.io/npm/dm/@rc-component/listy.svg?style=flat-square
[download-url]: https://npmjs.org/package/@rc-component/listy
[bundlephobia-url]: https://bundlephobia.com/result?p=@rc-component/listy
[bundlephobia-image]: https://badgen.net/bundlephobia/minzip/@rc-component/listy
[dumi-image]: https://img.shields.io/badge/docs%20by-dumi-blue?style=flat-square
[dumi-url]: https://github.com/umijs/dumi

## Install

[![@rc-component/listy](https://nodei.co/npm/@rc-component/listy.png)](https://npmjs.org/package/@rc-component/listy)

## Usage

Include the default [styling](https://github.com/react-component/listy/blob/master/assets/index.less#L4:L11) and then:

```js
import React from 'react';
import ReactDOM from 'react-dom/client';
import Listy from '@rc-component/listy';

const items = Array.from({ length: 100 }, (_, index) => ({
  id: index,
  name: `Item ${index}`,
}));

const App = () => (
  <Listy
    items={items}
    height={240}
    itemHeight={32}
    rowKey="id"
    itemRender={(item) => <div>{item.name}</div>}
  />
);

ReactDOM.createRoot(container).render(<App />);
```

## Compatibility

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/electron/electron_48x48.png" alt="Electron" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Electron |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IE11, Edge                                                                                                                                                                                                     | last 2 versions                                                                                                                                                                                                  | last 2 versions                                                                                                                                                                                              | last 2 versions                                                                                                                                                                                              | last 2 versions                                                                                                                                                                                                      |

## Example

http://localhost:9001

## Development

```
npm install
npm start
```

## API

### props

| name | type | default | description |
| --- | --- | --- | --- |
| items | `T[]` | `[]` | 列表数据源，虚拟滚动会基于此计算高度。 |
| rowKey | `keyof T \| (item: T) => React.Key` | required | 返回每一项的唯一标识，用于缓存高度与滚动定位。 |
| itemRender | `(item: T, index: number) => React.ReactNode` | required | 渲染单行内容的函数。 |
| height | `number` | - | 列表可视区域高度。 |
| itemHeight | `number` | - | 每行的基础高度，虚拟滚动会以此做初始估算。 |
| group | `{ key: ((item: T) => K) \| K; title: (groupKey: K, items: T[]) => React.ReactNode }` | - | 提供分组 key 与标题渲染，开启后会生成组头。 |
| sticky | `boolean` | `false` | 为分组头启用粘性悬停效果。 |
| virtual | `boolean` | `true` | 是否启用虚拟列表模式，可根据需要关闭。 |
| onScroll | `React.UIEventHandler<HTMLElement>` | - | 滚动时触发，透传内部滚动容器的滚动事件。 |
| prefixCls | `string` | `rc-listy` | 组件样式前缀，方便自定义样式隔离。 |

### ListyRef

- `scrollTo(config?: number | null | { left?: number; top?: number } | { key: React.Key; align?: 'top' | 'bottom' | 'auto'; offset?: number } | { groupKey: React.Key; align?: 'top' | 'bottom' | 'auto'; offset?: number })`
  - 传入 `groupKey` 时会直接滚动到对应组头（需启用 `group`）

## Test Case

```
npm test
npm run coverage
```

open coverage/ dir

## License

@rc-component/listy is released under the MIT license.
