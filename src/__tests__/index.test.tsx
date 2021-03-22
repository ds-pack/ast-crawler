import { visit } from '../index'
import { parse } from '@babel/parser'

test('visit', () => {
  let ast = parse(
    `
const foo = 'bar';
`,
    {
      sourceType: 'module',
    },
  )

  let astMap = {
    'foo.js': ast,
  }

  let visitor = jest.fn()

  visit({
    visitor,
    astMap,
  })

  expect(visitor).toHaveBeenCalledWith({
    ast,
    path: 'foo.js',
  })
})
