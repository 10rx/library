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
      }
    },
    preset: 'ts-jest/presets/js-with-ts',
    moduleDirectories: ['node_modules', 'src'],
    moduleNameMapper: {
      "@includes/(.*)": "<rootDir>/src/includes/$1",
  }
}