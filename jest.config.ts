import type {Config} from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  rootDir: './',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
}

export default config;
