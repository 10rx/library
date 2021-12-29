export default {
    transform: {
      "^.+\\.(t|j)sx?$": "ts-jest"
    },
    testRegex: "(/automatedtests/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    testPathIgnorePatterns: ["automatedtests/includes"],
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig-commonjs.json',
        useESM: true,
      }
    },
    preset: 'ts-jest/presets/default',
    moduleDirectories: ['node_modules', 'src'],
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1',
  }
}