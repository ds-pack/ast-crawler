# AST Crawler

Two small utilities for generating an AST Map (mapping of file paths to ast for
their contents) and for visiting each of those entries in the AST Map.

## Installation:

```sh
yarn add @matthamlin/ast-crawler
```

## Usage:

```tsx
import { generateASTMap, visit, find } from '@matthamlin/ast-crawler'

// Implementing a local cache for parsers
import { parse } from '@babel/parser'
import path from 'path'

let parsers = {}

function createParser(filepath) {
  let extension = path.extname(filepath)
  if (parsers[extension]) {
    return parsers[extension]
  }
  if (extension === '.tsx' || extension === '.ts') {
    parsers['.ts'] = parsers['.tsx'] = (contents) => {
      return parse(contents, {
        plugins: ['typescript'],
        sourceType: 'module',
      })
    }
    return parsers['.ts']
  } else {
    parsers[extension] = (contents) => {
      return parse(contents, {
        plugins: ['flow'],
        sourceType: 'module',
      })
    }
    return parsers[extension]
  }
}

let astMap = generateASTMap({
  files: find({ root: path.join('./src'), extensions: ['.js', '.ts', '.tsx'] }),
  createParser,
})

function visitor({ ast, path: filePath }) {
  // do whatever you want here with the ast and the filepath
}

visit({
  visitor,
  astMap,
})
```

### Tools:

- Typescript
- Babel
- Jest

### TODO:

- [ ] Refine `AST` type
