import path from 'path'
import fs from 'fs'

// TODO:

// Take a folder of files, generate a AST map for each of them
// Take in a visitor, let the visitor crawl over these files

function find(
  base: string,
  extensions: Array<string>,
  files: Array<string> | void,
  result: Array<string> | void,
) {
  files = files || fs.readdirSync(base)
  result = result || []

  files.forEach(function (file) {
    var newbase = path.join(base, file)
    if (fs.statSync(newbase).isDirectory()) {
      result = find(newbase, extensions, fs.readdirSync(newbase), result)
    } else {
      if (extensions.includes(path.extname(file))) {
        if (typeof result === 'undefined') {
          result = []
        }
        result.push(newbase)
      }
    }
  })
  return result
}

// @TODO
type AST = any

interface ASTMap {
  [path: string]: AST
}

interface GenerateArgs {
  pathName: string
  extensions: Array<string>
  createParser: (path: string) => (contents: string) => AST
}

export function generateASTMap({
  pathName,
  extensions,
  createParser,
}: GenerateArgs): ASTMap {
  let files = find(pathName, extensions)

  let astMap: ASTMap = {}
  for (let file of files) {
    try {
      // @TODO - this is going to be hot in large directories
      // Could recommend that `createParser` is cached in some form under the hood
      let parser = createParser(file)
      astMap[file] = parser(fs.readFileSync(file, 'utf-8').toString())
    } catch (err) {
      // @TODO
    }
  }
  return astMap
}

interface VisitArgs {
  visitor: ({ ast, path }: { ast: AST; path: string }) => void
  astMap: ASTMap
}

export function visit({ visitor, astMap }: VisitArgs): void {
  Object.entries(astMap).forEach(([path, ast]) => {
    visitor({
      ast,
      path,
    })
  })
}
