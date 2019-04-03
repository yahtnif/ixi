<div align="center">
	<div>
		<img width="300" src="https://github.com/yahtnif/static/raw/master/logo/ixi.svg?sanitize=true" alt="ixi">
	</div>
</div>

[![npm](https://badgen.net/npm/v/ixi)](https://www.npmjs.com/package/ixi)
[![Build Status](https://travis-ci.org/yahtnif/ixi.svg?branch=master)](https://travis-ci.org/yahtnif/ixi)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)

> structure selection parser.

Fork [x-ray-select](https://github.com/lapwinglabs/x-ray-select), with:

- built-in filters: `trim`, `reverse`, `slice`, `lowercase`, `uppercase`, `date`
- `trim` string by default
- fix `$root` in array structure

## Install

```sh
yarn add ixi
# or
npm install ixi
```

## Usage

```js
const X = require('ixi')

const html = `<div>
  <h1>ixi</h1>
  <ul>
    <li>one</li>
    <li>two</li>
    <li>three</li>
  </ul>
</div>`

const x = X(html)

console.log(x('h1')) // 'ixi'

console.log(x(['li'])) // ['one', 'two', 'three']

console.log(
  x({
    title: 'h1',
    items: ['li']
  })
)
// {
//   title: 'ixi',
//   items: ['one', 'two', 'three']
// }

console.log(
  x({
    $root: '.main',
    title: 'h1',
    items: ['li']
  })
)
// {
//   title: 'ixi',
//   items: ['one', 'two']
// }
```

## License

[Anti 996](./LICENSE)
