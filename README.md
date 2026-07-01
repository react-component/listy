<div align="center">
  <h1>@rc-component/listy</h1>
  <p><sub><a href="https://ant.design"><img alt="Ant Design" height="14" src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" style="vertical-align: -0.125em;" /></a> Part of the Ant Design ecosystem.</sub></p>
  <p>📜 Virtualized React list component with grouping and sticky header support.</p>

  <p>
    <a href="https://npmjs.org/package/@rc-component/listy"><img alt="NPM version" src="https://img.shields.io/npm/v/@rc-component/listy.svg?style=flat-square"></a>
    <a href="https://npmjs.org/package/@rc-component/listy"><img alt="npm downloads" src="https://img.shields.io/npm/dm/@rc-component/listy.svg?style=flat-square"></a>
    <a href="https://github.com/react-component/listy/actions/workflows/test.yml"><img alt="build status" src="https://github.com/react-component/listy/actions/workflows/test.yml/badge.svg"></a>
    <a href="https://app.codecov.io/gh/react-component/listy"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/react-component/listy/master.svg?style=flat-square"></a>
    <a href="https://bundlephobia.com/package/@rc-component/listy"><img alt="bundle size" src="https://img.shields.io/bundlephobia/minzip/@rc-component/listy?style=flat-square"></a>
    <a href="https://github.com/umijs/dumi"><img alt="dumi" src="https://img.shields.io/badge/docs%20by-dumi-blue?style=flat-square"></a>
  </p>
</div>

<p align="center">English | <a href="./README.zh-CN.md">简体中文</a></p>

## Highlights

| Area | Support |
| --- | --- |
| Purpose | Virtualized React list component with grouping and sticky header support. |
| Package | `@rc-component/listy` |
| Release | `@rc-component/np` / `rc-np` |

## Install

```bash
npm install @rc-component/listy
```

## Usage

```tsx | pure
import Listy from '@rc-component/listy';
import '@rc-component/listy/assets/index.css';

const items = Array.from({ length: 100 }, (_, index) => ({ id: index, name: `Item ${index}` }));

export default () => (
  <Listy
    items={items}
    height={240}
    itemHeight={32}
    rowKey="id"
    itemRender={(item) => <div>{item.name}</div>}
  />
);
```

## API

| Prop | Description | Type | Default |
| --- | --- | --- | --- |
| `items` | List data source. | `T[]` | `[]` |
| `rowKey` | Resolve item identity. | `keyof T \| (item: T) => React.Key` | required |
| `itemRender` | Render each item. | `(item: T, index: number) => React.ReactNode` | required |
| `height` | Viewport height. | `number` | - |
| `itemHeight` | Estimated item height. | `number` | - |
| `group` | Group configuration. | `{ key: (item: T) => K; title: (groupKey: K, items: T[]) => React.ReactNode }` | - |
| `sticky` | Enable sticky group headers. | `boolean` | `false` |
| `virtual` | Enable virtual scrolling. | `boolean` | `true` |
| `onScroll` | Triggered when the inner scroll container scrolls. | `React.UIEventHandler<HTMLElement>` | - |
| `prefixCls` | Component class name prefix. | `string` | `rc-listy` |

### ListyRef

| Method | Description |
| --- | --- |
| `scrollTo(config)` | Scroll to a position, item key, or group key. |

## Development

```bash
ut install
npm start
npm test
npm run lint
npm run compile
```

The dumi site runs at `http://localhost:8000`.

## Release

```bash
npm run prepublishOnly
```

The release flow is handled by `@rc-component/np` through the `rc-np` command when the package uses the shared release flow.

## License

@rc-component/listy is released under the [MIT](./LICENSE) license.
