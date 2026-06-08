#!/usr/bin/env node
/**
 * Post-processes the generated Tailwind CSS file to ensure utility classes
 * are scoped to wallet UI components.
 *
 * This script adds [data-wallet-ui] scoping to CSS class selectors. It generates
 * two selector patterns for each utility class:
 *
 * 1. [data-wallet-ui].class - for elements that have the attribute directly (buttons)
 * 2. [data-wallet-ui] .class - for descendants of elements with the attribute (portal content)
 */

import fs from 'fs/promises'
import path from 'path'

const STYLE_FILE_PATH = path.resolve('./dist/style.css')

function isTopLevelClassSelector(line) {
  const trimmed = line.trim()
  if (
    line.includes('[data-wallet-ui]') ||
    line.includes('[data-wallet-theme]') ||
    trimmed.startsWith('@') ||
    trimmed.startsWith('/*') ||
    trimmed.startsWith('*')
  ) {
    return false
  }
  return /^\s*\.[a-zA-Z0-9_\-\\:]+[^\{]*\{/.test(line)
}

async function main() {
  try {
    const cssContent = await fs.readFile(STYLE_FILE_PATH, 'utf8')
    const lines = cssContent.split('\n')

    const processedLines = lines.map((line) => {
      if (isTopLevelClassSelector(line)) {
        const match = line.match(/^(\s*)(\.[^\{]+)\{(.*)$/)
        if (match) {
          const [, indent, selector, rest] = match
          const trimmedSelector = selector.trim()
          return `${indent}[data-wallet-ui]${trimmedSelector}, [data-wallet-ui] ${trimmedSelector} {${rest}`
        }
        return line.replace(/(\s*)\./, '$1[data-wallet-ui] .')
      }
      return line
    })

    await fs.writeFile(STYLE_FILE_PATH, processedLines.join('\n'))

    console.log(
      `Processed CSS file to add [data-wallet-ui] prefix to class selectors in ${STYLE_FILE_PATH}`,
    )
  } catch (error) {
    console.error('Error processing CSS file:', error)
    process.exit(1)
  }
}

main()
