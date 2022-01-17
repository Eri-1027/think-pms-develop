require('dotenv').config()
module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  verbose: true,
  roots: ['<rootDir>/src/', '<rootDir>/tests/unit'],
  moduleFileExtensions: ['js', 'vue'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.tsx?$': 'ts-jest',
    'vee-validate/dist/rules': 'babel-jest'
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!vee-validate/dist/rules)'
  ],
  snapshotSerializers: [
    '<rootDir>/node_modules/jest-serializer-vue'
  ]
}
