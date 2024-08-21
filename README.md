# @harurow/icon-resize

This project is a CLI tool for resizing images. It is designed to be simple and efficient, allowing you to resize images to various sizes. It also supports automatic processing when files are updated by monitoring changes.

## Features

- Resizes images to the specified size.
- Monitors file changes and automatically resizes on update.
- Supports overwriting existing files with the `--force` option.
- Allows specifying multiple sizes.
- Custom output directory configuration.

## Installation

To use this tool, you need to have [Node.js](https://nodejs.org/) installed. Once Node.js is set up, you can install the tool globally using the following command:

```bash
npm install -g icon-resize
```

Alternatively, you can run the tool using npx without installing it globally:

```bash
npx @harurow/icon-resize <file-path> [options]
```

## Usage

### Basic Command

```bash
npx icon-resize <file-path> [options]
```

### Options

- `--output-dir=<dir>`: Required. Specifies the output directory where the resized images will be saved.
- `--size=<size>`: Specifies the size for resizing (can be used multiple times). Example: `--size=32`. Default sizes are `16, 32, 64, 128`.
- `--force, -f`: Overwrites existing files in the output directory. Example: `--force`.
- `--watch, -w`: Watches for file changes and automatically resizes when the file changes. Example: `--watch`.
- `--help, -h`: Shows this help message.

### Examples

1. Resize an image to 32x32 pixels and save it to a directory:

```bash
npx icon-resize ./path/to/image.png --size=32 --output-dir=output-dir
```

2. Monitor an image file for changes and automatically resize on change:

```bash
npx icon-resize ./path/to/image.png --size=64 --output-dir=output-dir --watch
```

3. Resize an image to multiple sizes and overwrite existing files:

```bash
npx icon-resize ./path/to/image.png -s 16 -s 128 -o output-dir -f
```

## Development

### Prerequisites

* Node.js
* npm

### Setup

Clone the repository:

```bash
git clone https://github.com/yourusername/icon-resize.git
cd icon-resize
npm install
```

### Running Tests

You can run tests with the following command:

```bash
npm test
```

The tests are located in the tests directory. During testing, images are automatically copied to a temporary directory, and the output directory is cleared for each test.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
