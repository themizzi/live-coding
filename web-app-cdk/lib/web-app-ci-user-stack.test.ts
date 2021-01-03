import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
  haveResource,
  deepObjectLike,
} from '@aws-cdk/assert';
import {Effect} from '@aws-cdk/aws-iam';
import {App} from '@aws-cdk/core';
import {WebAppCIUserStack} from './web-app-ci-user-stack';

test('Empty Stack', () => {
  // GIVEN
  const app = new App();

  // WHEN
  const stack = new WebAppCIUserStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {},
      },
      MatchStyle.EXACT
    )
  );
});

test('User created with username', () => {
  // GIVEN
  const app = new App();

  // WHEN
  const stack = new WebAppCIUserStack(app, 'MyTestStack', {
    user: {
      username: 'test-user',
    },
  });

  // THEN
  expectCDK(stack).to(
    haveResource('AWS::IAM::User', {
      UserName: 'test-user',
    })
  );
});

test('User created with cloudformation policies', () => {
  // GIVEN
  const app = new App();

  // WHEN
  const stack = new WebAppCIUserStack(app, 'MyTestStack', {
    user: {},
  });

  // THEN
  expectCDK(stack).to(
    haveResource(
      'AWS::IAM::Policy',
      deepObjectLike({
        PolicyDocument: {
          Statement: [
            {
              Action: [
                'cloudformation:DescribeStacks',
                'cloudformation:DescribeStackEvents',
                'cloudformation:CreateStack',
                'cloudformation:GetTemplate',
                'cloudformation:DeleteStack',
                'cloudformation:CreateChangeSet',
                'cloudformation:DescribeChangeSet',
                'cloudformation:ExecuteChangeSet',
              ],
              Effect: Effect.ALLOW,
              Resource: [
                'arn:aws:cloudformation:*:*:stack/*/*',
                'arn:aws:cloudformation:*:*:stack/*',
              ],
            },
          ],
        },
      })
    )
  );
});
