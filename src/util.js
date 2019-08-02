import shelljs from 'shelljs'

export const thirdPartyCliChecker = (dependencies) => {
  const notInstalledDeps = dependencies.filter(dependency => !shelljs.which(dependency))
  if (notInstalledDeps && notInstalledDeps.length) {
    shelljs.echo(`Sorry, this script requires the following: ${notInstalledDeps.toString()}`)
    shelljs.exit(1)
  }
}
