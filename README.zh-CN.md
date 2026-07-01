<div align="center">
  <h1>@rc-component/listy</h1>
  <p><sub><a href="https://ant.design"><img alt="Ant Design" height="14" src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" style="vertical-align: -0.125em;" /></a> Ant Design 生态的一部分。</sub></p>
  <p>📜 支持虚拟滚动、分组与粘性组头的 React 列表组件。</p>

  <p>
    <a href="https://npmjs.org/package/@rc-component/listy"><img alt="NPM version" src="https://img.shields.io/npm/v/@rc-component/listy.svg?style=flat-square"></a>
    <a href="https://npmjs.org/package/@rc-component/listy"><img alt="npm downloads" src="https://img.shields.io/npm/dm/@rc-component/listy.svg?style=flat-square"></a>
    <a href="https://github.com/react-component/listy/actions/workflows/test.yml"><img alt="build status" src="https://github.com/react-component/listy/actions/workflows/test.yml/badge.svg"></a>
    <a href="https://app.codecov.io/gh/react-component/listy"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/react-component/listy/master.svg?style=flat-square"></a>
    <a href="https://bundlephobia.com/package/@rc-component/listy"><img alt="bundle size" src="https://img.shields.io/bundlephobia/minzip/@rc-component/listy?style=flat-square"></a>
    <a href="https://github.com/umijs/dumi"><img alt="dumi" src="https://img.shields.io/badge/docs%20by-dumi-blue?style=flat-square"></a>
  </p>
</div>

<p align="center">简体中文 | [English](./README.md)</p>

## 亮点

| 方向 | 支持 |
| --- | --- |
| 定位 | 支持虚拟滚动、分组与粘性组头的 React 列表组件。 |
| 包名 | `@rc-component/listy` |
| 发布 | `@rc-component/np` / `rc-np` |

## 安装

```bash
npm install @rc-component/listy
```

## 用法

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

| 名称 | 说明 |
| --- | --- |
| `items` | 列表数据源。 |
| `rowKey` | 解析列表项唯一标识。 |
| `itemRender` | 渲染每一项。 |
| `height` | 可视区域高度。 |
| `itemHeight` | 预估项高度。 |
| `group` | 分组配置。 |
| `sticky` | 启用粘性组头。 |
| `virtual` | 启用虚拟滚动。 |

## 本地开发

```bash
npm install
npm start
npm test
npm run lint
npm run compile
```

本地 dumi 站点默认运行在 `http://localhost:8000`.

## 发布

```bash
npm run prepublishOnly
```

发布流程通过 `@rc-component/np` 提供的 `rc-np` 命令处理。

## 许可证

@rc-component/listy 基于 [MIT](./LICENSE) 协议发布。
