import path from 'path'
import fs from 'fs'

export interface FindArgs {
  root: string
  extensions: Array<string>
  files: Array<string> | void
  result: Array<string> | void
}

export function find({
  root,
  extensions,
  files,
  result,
}: FindArgs): Array<string> {
  files = files || fs.readdirSync(root)
  result = result || []

  files.forEach(function (file) {
    var newroot = path.join(root, file)
    if (fs.statSync(newroot).isDirectory()) {
      result = find({
        root: newroot,
        extensions,
        files: fs.readdirSync(newroot),
        result,
      })
    } else {
      if (extensions.includes(path.extname(file))) {
        if (typeof result === 'undefined') {
          result = []
        }
        result.push(newroot)
      }
    }
  })
  return result
}

// @TODO
export type AST = any

export interface ASTMap {
  [path: string]: AST
}

export interface GenerateArgs {
  // An array of file paths that we need to visit
  files: Array<string>
  // A function that returns a parser
  createParser: (path: string) => (contents: string) => AST
}

export function generateASTMap({ files, createParser }: GenerateArgs): ASTMap {
  let astMap: ASTMap = {}
  for (let file of files) {
    try {
      // @Note: This is going to be hot in large directories
      // Recommend that `createParser` is cached in some form under the hood
      let parser = createParser(file)
      astMap[file] = parser(fs.readFileSync(file, 'utf-8').toString())
    } catch (err) {
      console.log(err)
      continue
    }
  }
  return astMap
}

export interface VisitArgs {
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
