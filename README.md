# Markdown WYSIWYG

[![github actions](https://github.com/remcohaszing/vscode-markdown-wysiwyg/actions/workflows/ci.yaml/badge.svg)](https://github.com/remcohaszing/vscode-markdown-wysiwyg/actions/workflows/ci.yaml)
[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/remcohaszing.markdown-wysiwyg)](https://marketplace.visualstudio.com/items?itemName=remcohaszing.markdown-wysiwyg)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/remcohaszing.markdown-wysiwyg)](https://marketplace.visualstudio.com/items?itemName=remcohaszing.markdown-wysiwyg)
[![Open VSX Version](https://img.shields.io/open-vsx/v/remcohaszing/markdown-wysiwyg)](https://open-vsx.org/extension/remcohaszing/markdown-wysiwyg)
[![Open VSX Downloads](https://img.shields.io/open-vsx/dt/remcohaszing/markdown-wysiwyg)](https://open-vsx.org/extension/remcohaszing/markdown-wysiwyg)

This Visual Studio Code extension provides a WYSIWYG-like experience for markdown and MDX files.
This extension is experimental. Feedback is welcome, and changes are likely to happen.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [License](#license)

## Installation

In Visual Studio Code open the command palette using <kbd>Ctrl</kbd> + <kbd>Shift</kbd> +
<kbd>P</kbd>, paste the following command, and press <kbd>Enter</kbd>.

```
ext install remcohaszing.markdown-wysiwyg
```

## Usage

This extension is activated automatically when you open a markdown or MDX file.

## Features

This extension provides some text decorations that make the markdown and MDX editing experience feel
close to a WYSIWYG experience.

![Screenshot showing the extension in action](screenshot.png)

The following decorations are supported:

- Emphasis text is italic.
- Strong text is bold.
- Headers are bold.
- Deleted text is strike-through.
- Thematic breaks have an extended strike-through effect.
- Inline code has a darker background in light mode, and a lighter background in dark mode.
- HTML tags have a darker background in light mode, and a lighter background in dark mode.
- Code blocks have a darker background in light mode, and a lighter background in dark mode.
- Frontmatter has a darker background in light mode, and a lighter background in dark mode.
- Block quotes have a darker background in light mode, and a lighter background in dark mode. This
  effect increases as more block quotes are nested.
- MDX expressions have a darker background in light mode, and a lighter background in dark mode.

## License

[MIT](LICENSE.md) © [Remco Haszing](https://github.com/remcohaszing)
