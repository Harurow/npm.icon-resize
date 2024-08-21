#!/usr/bin/env node

import fs from "fs";
import path from "path";
import sharp from "sharp";
import minimist from "minimist";

// ヘルプメッセージ
const helpMessage = `
Usage:
  npx icon-resize <file-path> [options]

Arguments:
  <file-path>        Required: Path to the input image file.

Options:
  --output-dir=<dir> Required: Specify the output directory where resized images will be saved.
  --size=<size>      Specify the size for resizing (can be used multiple times).
                     Example: --size=32
                     Default sizes are: 16, 32, 64, 128
  --force, -f        Overwrite existing files in the output directory. Example: --force
  --watch, -w        Watch for file changes and automatically resize when the file changes. Example: --watch
  --help, -h         Show this help message.

Examples:
  npx icon-resize ./path/to/image.png --size=32 --output-dir=output-dir
  npx icon-resize ./path/to/image.png --size=64 --output-dir=output-dir --watch
  npx icon-resize ./path/to/image.png -s 16 -s 128 -o output-dir -f
`;

// サイズのデフォルト設定
const defaultSizes = [16, 32, 64, 128];

// 引数を解析
const parseArgs = () => {
  const args = minimist(process.argv.slice(2), {
    alias: {
      o: "output-dir",
      s: "size",
      f: "force",
      w: "watch",
      h: "help",
    }
  });

  // ヘルプ表示
  if (args.help || args.h) {
    console.log(helpMessage);
    process.exit(0);
  }

  // 必須項目チェック
  if (!args._[0]) {
    console.error("Error: Input image file path is required.");
    console.log(helpMessage);
    process.exit(1);
  }

  // 出力ディレクトリチェック
  if (!args["output-dir"]) {
    console.error(
      "Error: Output directory is required. Use --output-dir=<dir> to specify the output directory.",
    );
    console.log(helpMessage);
    process.exit(1);
  }

  // サイズオプションチェックとバリデーション
  const sizes = args.size
    ? Array.isArray(args.size)
      ? args.size
      : [args.size]
    : defaultSizes;
  const invalidSizes = sizes.filter(
    (size) => isNaN(Number(size)) || Number(size) < 1 || Number(size) > 1024,
  );

  if (invalidSizes.length > 0) {
    console.error(
      `Error: Invalid size option(s): ${invalidSizes.join(", ")}. Sizes must be between 1 and 1024.`,
    );
    console.log(helpMessage);
    process.exit(1);
  }

  return {
    inputFilePath: args._[0],
    outputDir: args["output-dir"],
    sizes: sizes.map((size) => Number(size)),
    force: args.force || args.f,
    watch: args.watch || args.w,
  };
};

// 画像のリサイズ処理
const resizeImage = async (params: {
  inputFilePath: string;
  outputDir: string;
  sizes: number[];
  force: boolean;
}) => {
  const { inputFilePath, outputDir, sizes, force } = params;

  if (!fs.existsSync(inputFilePath)) {
    console.error(`Error: Input file not found: ${inputFilePath}`);
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const baseName = path.basename(inputFilePath, path.extname(inputFilePath));

  for (const size of sizes) {
    const outputFilePath = path.join(outputDir, `${baseName}-${size}.png`);

    if (fs.existsSync(outputFilePath) && !force) {
      console.error(
        `Error: File already exists and --force option is not specified: ${outputFilePath}`,
      );
      process.exit(1);
    }

    try {
      await sharp(inputFilePath).resize(size, size).toFile(outputFilePath);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error: Failed to process image: ${error.message}`);
      } else {
        console.error(`Error: Failed to process image: ${String(error)}`);
      }
      process.exit(1);
    }
  }
};

// メイン処理
const main = async () => {
  const params = parseArgs();
  await resizeImage(params);

  if (params.watch) {
    fs.watchFile(params.inputFilePath, () => resizeImage(params));
  }
};

main();
