# 10rx-library

## Publishing a new version

Run the following command to publish a new version of the library:

```
npm version [major | minor | patch]
```

Where major bumps the major version of the library, minor to bump the minor version, and patch to bump the patch version

Example:

Given version of the library 1.0.2. Then running the following command will change the version from 1.0.2 to 1.0.3 and publish it to our internal repository.

```
npm version patch
```

<span style="color:red">**This needs to be run on the master branch only. It will not work if run on another branch. A CI/CD task is triggered in gitlab that validates the version of the library and then publishes the new version automatically to our repository.** </span>