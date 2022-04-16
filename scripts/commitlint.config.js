const {
  default: getWorkspacePackages,
} = require('@pnpm/find-workspace-packages')

const { searchForWorkspaceRoot } = require('vite')

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [2, 'never'],
    'subject-case': [0, 'never'],
    'scope-enum': async () => {
      const packages = (await getWorkspacePackages(
        searchForWorkspaceRoot(process.cwd())
      )).map((pkg) => pkg.manifest.name).filter(Boolean)
      return [2, 'always', [
        'chore',
        'style',
        'docs',
        'ci',
        'dev',
        'build',
        'deploy',
        'other',
        ...packages
      ]]
    }
  }
}
