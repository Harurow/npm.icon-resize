import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const tempDir = path.join(__dirname, '../temp');
const testImagePath = path.join(__dirname, 'test-image.png');
const testImage2Path = path.join(__dirname, 'test-image2.png');
const outputDir = path.join(tempDir, 'output-dir');

// テスト用画像ファイルをtempフォルダにコピーする
const copyTestImageToTemp = (filename: string) => {
  const destPath = path.join(tempDir, filename);
  fs.copyFileSync(path.join(__dirname, filename), destPath);
  return destPath;
};

const setup = () => {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  copyTestImageToTemp('test-image.png');
  copyTestImageToTemp('test-image2.png');
};

const cleanup = () => {
  // テスト後にtempフォルダをクリーンアップする
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

const clearOutputDir = () => {
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
};

const ensureDirExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

describe('正常系', () => {
  beforeEach(() => {
    setup();
    clearOutputDir();
  });

  afterEach(() => {
    cleanup();
  });

  it('指定されたサイズで画像が正しくリサイズされる', () => {
    ensureDirExists(outputDir);
    const resizedFilePath16 = path.join(outputDir, 'test-image-16.png');
    execSync(`node dist/index.js ${path.join(tempDir, 'test-image.png')} --output-dir=${outputDir} --size=16`);
    expect(fs.existsSync(resizedFilePath16)).toBe(true);
  });

  it('複数のサイズオプションで画像がリサイズされる', () => {
    ensureDirExists(outputDir);
    const resizedFilePath16 = path.join(outputDir, 'test-image-16.png');
    const resizedFilePath32 = path.join(outputDir, 'test-image-32.png');
    execSync(`node dist/index.js ${path.join(tempDir, 'test-image.png')} --output-dir=${outputDir} --size=16 --size=32`);
    expect(fs.existsSync(resizedFilePath16)).toBe(true);
    expect(fs.existsSync(resizedFilePath32)).toBe(true);
  });

  it('--forceオプションで既存ファイルが上書きされる', () => {
    ensureDirExists(outputDir);
    const resizedFilePath16 = path.join(outputDir, 'test-image-16.png');
    // 初回のファイル作成
    execSync(`node dist/index.js ${path.join(tempDir, 'test-image.png')} --output-dir=${outputDir} --size=16`);
    expect(fs.existsSync(resizedFilePath16)).toBe(true);

    // --force オプションでファイルを再作成
    execSync(`node dist/index.js ${path.join(tempDir, 'test-image.png')} --output-dir=${outputDir} --size=16 --force`);
    expect(fs.existsSync(resizedFilePath16)).toBe(true);
  });

  it('--watchオプションでファイルが変更されたときに再作成される', (done) => {
    ensureDirExists(outputDir);
    const resizedFilePath16 = path.join(outputDir, 'test-image-16.png');
    const watchFilePath = path.join(tempDir, 'test-image.png');

    // Start the watch process
    const child = exec(`node dist/index.js ${watchFilePath} --output-dir=${outputDir} --size=16 --watch`);

    // Set a timeout to allow the watch process to start
    setTimeout(() => {
      // Change the image file
      fs.writeFileSync(watchFilePath, 'new content');

      // Set another timeout to allow the watch process to detect the change
      setTimeout(() => {
        // Check if the resized file is created
        if (fs.existsSync(resizedFilePath16)) {
          child.kill(); // Stop the watch process
          done();
        } else {
          child.kill(); // Stop the watch process
          done.fail('Resized file was not created');
        }
      }, 200); // Adjust this delay if needed
    }, 200); // Adjust this delay if needed
  });
});

describe('異常系', () => {
  beforeEach(() => {
    setup();
    clearOutputDir();
  });

  afterEach(() => {
    cleanup();
  });

  it('入力ファイルが指定されていない場合エラーが発生する', () => {
    expect(() => {
      execSync(`node dist/index.js --output-dir=${outputDir}`);
    }).toThrow();
  });

  it('出力ディレクトリが指定されていない場合エラーが発生する', () => {
    expect(() => {
      execSync(`node dist/index.js ${path.join(tempDir, 'test-image.png')} --size=16`);
    }).toThrow();
  });

  it('サイズが数値でない場合エラーが発生する', () => {
    expect(() => {
      execSync(`node dist/index.js ${path.join(tempDir, 'test-image.png')} --output-dir=${outputDir} --size=abc`);
    }).toThrow();
  });

  it('指定されたサイズが範囲外の場合エラーが発生する', () => {
    expect(() => {
      execSync(`node dist/index.js ${path.join(tempDir, 'test-image.png')} --output-dir=${outputDir} --size=99999`);
    }).toThrow();
  });

  it('--forceオプションがない場合、既存ファイルが上書きされない', () => {
    ensureDirExists(outputDir);
    const resizedFilePath16 = path.join(outputDir, 'test-image-16.png');
    fs.writeFileSync(resizedFilePath16, 'dummy content');
    expect(() => {
      execSync(`node dist/index.js ${path.join(tempDir, 'test-image.png')} --output-dir=${outputDir} --size=16`);
    }).toThrow();
  });
});
