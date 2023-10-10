import { characterEntities } from 'character-entities'
import { type Node } from 'mdast'
import { fromMarkdown, type Options as FromMarkdownOptions } from 'mdast-util-from-markdown'
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { mdxFromMarkdown } from 'mdast-util-mdx'
import { frontmatter } from 'micromark-extension-frontmatter'
import { gfm } from 'micromark-extension-gfm'
import { mdxjs } from 'micromark-extension-mdxjs'
import { visitParents } from 'unist-util-visit-parents'
import {
  type ExtensionContext,
  Range,
  type TextDocument,
  type TextEditor,
  type TextEditorDecorationType,
  window,
  workspace
} from 'vscode'

declare module 'mdast' {
  interface Toml extends Literal {
    /**
     * The type of the toml node.
     */
    type: 'toml'
  }

  interface RootContentMap {
    /**
     * A toml frontmatter noe.
     */
    toml: Toml
  }
}

const fromMarkdownOptions: FromMarkdownOptions = {
  extensions: [frontmatter(['toml', 'yaml']), gfm()],
  mdastExtensions: [frontmatterFromMarkdown(['toml', 'yaml']), gfmFromMarkdown()]
}

const fromMdxOptions: FromMarkdownOptions = {
  extensions: [frontmatter(['toml', 'yaml']), gfm(), mdxjs()],
  mdastExtensions: [frontmatterFromMarkdown(['toml', 'yaml']), gfmFromMarkdown(), mdxFromMarkdown()]
}

/**
 * Check whether a document is markdown or MDX.
 *
 * @param document
 *   The document to check
 * @returns
 *   A boolean indiciating whethr the document is markdown or MDX.
 */
function isMarkdownLike(document: TextDocument): boolean {
  return document.languageId === 'markdown' || document.languageId === 'mdx'
}

/**
 * Create a CSS rgb balue.
 *
 * @param red
 *   The amount of red to use between 0-255.
 * @param blue
 *   The amount of blue to use between 0-255.
 * @param green
 *   The amount of green to use between 0-255.
 * @param alpha
 *   The alpha value as a value between 0-1.
 * @returns
 *   The CSS rgb color string.
 */
function rgb(red: number, blue: number, green: number, alpha: number): string {
  return `rgb(${red} ${blue} ${green} / ${alpha})`
}

/**
 * Make a dark transparent color.
 *
 * @param alpha
 *   The alpha value to use.
 * @returns
 *   The CSS rgb color string.
 */
function darken(alpha: number): string {
  return rgb(0, 0, 0, alpha)
}

/**
 * Make a light transparent color.
 *
 * @param alpha
 *   The alpha value to use.
 * @returns
 *   The CSS rgb color string.
 */
function brighten(alpha: number): string {
  return rgb(255, 255, 255, alpha)
}

/**
 * Get the VSCode range of a unist node.
 *
 * @param node
 *   The node to get the range for.
 * @param startOffset
 *   An additional offset to add to the start line number,
 * @param endOffset
 *   An additional offset to add to the end line number,
 * @returns
 *   The VSCode range that contains the node.
 */
function getNodeRange(node: Node, startOffset = 0, endOffset = 0): Range {
  const { end, start } = node.position!

  return new Range(
    start.line + startOffset - 1,
    start.column - 1,
    end.line + endOffset - 1,
    end.column - 1
  )
}

/**
 * Activate the extension.
 *
 * @param context
 *   The VS Code extension context.
 */
export function activate(context: ExtensionContext): undefined {
  const codeDecorationType = window.createTextEditorDecorationType({
    dark: { backgroundColor: brighten(0.1) },
    isWholeLine: true,
    light: { backgroundColor: darken(0.1) }
  })

  const inlineCodeDecorationType = window.createTextEditorDecorationType({
    dark: { backgroundColor: brighten(0.1) },
    light: { backgroundColor: darken(0.1) }
  })

  const decorationTypeMap = {
    blockquote: window.createTextEditorDecorationType({
      dark: { backgroundColor: brighten(0.05) },
      isWholeLine: true,
      light: { backgroundColor: darken(0.05) }
    }),
    code: codeDecorationType,
    delete: window.createTextEditorDecorationType({ textDecoration: 'line-through' }),
    emphasis: window.createTextEditorDecorationType({ fontStyle: 'italic' }),
    html: inlineCodeDecorationType,
    inlineCode: inlineCodeDecorationType,
    mdxFlowExpression: inlineCodeDecorationType,
    mdxjsEsm: codeDecorationType,
    mdxJsxFlowElement: inlineCodeDecorationType,
    mdxJsxTextElement: inlineCodeDecorationType,
    mdxTextExpression: inlineCodeDecorationType,
    strong: window.createTextEditorDecorationType({ fontWeight: 'bold' }),
    thematicBreak: window.createTextEditorDecorationType({
      textDecoration: 'line-through',
      after: { contentText: characterEntities.nbsp.repeat(77), textDecoration: 'line-through' }
    }),
    toml: codeDecorationType,
    yaml: codeDecorationType,
    heading1: window.createTextEditorDecorationType({ fontWeight: 'bold' }),
    heading2: window.createTextEditorDecorationType({ fontWeight: 'bold' }),
    heading3: window.createTextEditorDecorationType({ fontWeight: 'bold' }),
    heading4: window.createTextEditorDecorationType({ fontWeight: 'bold' }),
    heading5: window.createTextEditorDecorationType({ fontWeight: 'bold' }),
    heading6: window.createTextEditorDecorationType({ fontWeight: 'bold' })
  }

  /**
   * Append the ranges to a map of decoration ranges.
   *
   * @param decorationRangeMap
   *   The map to append the ranges to.
   * @param nodeType
   *   The node type whose decorations to append to.
   * @param ranges
   *   The ranges to append.
   */
  function addRanges(
    decorationRangeMap: Map<TextEditorDecorationType, Range[]>,
    nodeType: keyof typeof decorationTypeMap,
    ...ranges: Range[]
  ): undefined {
    const decorationType = decorationTypeMap[nodeType]
    decorationRangeMap.get(decorationType)!.push(...ranges)
  }

  /**
   * Update the decorations of an editor.
   *
   * The editor is assumed to contain a markdown document.
   *
   * @param editor
   *   The editor whose decorations to update.
   */
  function updateDecorations(editor: TextEditor): undefined {
    const { document } = editor
    const text = document.getText()
    const options = document.languageId === 'mdx' ? fromMdxOptions : fromMarkdownOptions
    const decorationRangeMap = new Map<TextEditorDecorationType, Range[]>()

    for (const decorationType of Object.values(decorationTypeMap)) {
      decorationRangeMap.set(decorationType!, [])
    }

    try {
      const ast = fromMarkdown(text, options)

      visitParents(ast, (node) => {
        switch (node.type) {
          case 'blockquote':
          case 'delete':
          case 'html':
          case 'inlineCode':
          case 'emphasis':
          case 'mdxFlowExpression':
          case 'mdxjsEsm':
          case 'mdxTextExpression':
          case 'strong':
          case 'thematicBreak':
            addRanges(decorationRangeMap, node.type, getNodeRange(node))
            break
          case 'code': {
            const char = text.charAt(node.position!.start.offset!)
            addRanges(
              decorationRangeMap,
              node.type,
              char === ' ' || char === '\t' ? getNodeRange(node) : getNodeRange(node, 1, -1)
            )
            break
          }
          case 'heading': {
            const { start } = node.position!
            addRanges(
              decorationRangeMap,
              `${node.type}${node.depth}`,
              new Range(start.line - 1, 0, start.line - 1, Number.MAX_SAFE_INTEGER)
            )
            break
          }
          case 'mdxJsxTextElement':
          case 'mdxJsxFlowElement':
            if (node.children.length === 0) {
              addRanges(decorationRangeMap, node.type, getNodeRange(node, 1, -1))
            } else {
              const { end, start } = node.position!
              const startOffset = start.offset!
              const endOffset = end.offset!

              const openingLength = text
                .slice(startOffset, node.children[0].position!.start.offset!)
                .trimEnd().length

              const closingLength = text
                .slice(node.children.at(-1)!.position!.end.offset!, endOffset)
                .trimStart().length

              addRanges(
                decorationRangeMap,
                node.type,
                new Range(
                  document.positionAt(startOffset),
                  document.positionAt(startOffset + openingLength)
                ),
                new Range(
                  document.positionAt(endOffset - closingLength),
                  document.positionAt(endOffset)
                )
              )
            }
            break
          case 'toml':
          case 'yaml':
            addRanges(decorationRangeMap, node.type, getNodeRange(node, 1, -1))
            break
          default:
        }
      })
    } catch {
      // Keep around the old decorations on failure
      return
    }

    for (const [decorationType, ranges] of decorationRangeMap) {
      editor.setDecorations(decorationType, ranges)
    }
  }

  /**
   * Update the decorations of all given editors.
   *
   * @param editors
   *   The editors to update
   */
  function updateAllEditors(editors: readonly TextEditor[]): undefined {
    for (const editor of editors) {
      if (isMarkdownLike(editor.document)) {
        updateDecorations(editor)
      }
    }
  }

  context.subscriptions.push(
    window.onDidChangeVisibleTextEditors(updateAllEditors),

    workspace.onDidChangeTextDocument(({ document }) => {
      if (isMarkdownLike(document)) {
        for (const editor of window.visibleTextEditors) {
          if (editor.document === document) {
            updateDecorations(editor)
          }
        }
      }
    }),

    {
      dispose() {
        for (const disposable of Object.values(decorationTypeMap)) {
          disposable.dispose()
        }
      }
    }
  )

  updateAllEditors(window.visibleTextEditors)
}
