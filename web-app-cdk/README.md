# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

## Creating a CI User

To create a user for use in CI, run the following command:

```bash
npm run cdk -- deploy \
-c stack=ci-user \
-c username={username} \
-c resourceStackNames={resourceStackNames} \
-c regions={regions} \
-c accountNumber={accounts}
```

Only the `stack` context is required. The following contexts can also be supplied:

| Name | Description | Default |
| ---- | ----------- | ------- |
| username | The username for the IAM user | `web-app-ci-user` |
| resourceStackNames | Stack Names that the user will be allowed necessary permissions on | `*` |
| regions | Regions that the user will be allowed necessary permissions on | `*` |
| accountNumber | Account number that the user will be allowed necessary permissions on | `*` |
