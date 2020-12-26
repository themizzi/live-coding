import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
  haveResource,
  deepObjectLike,
  arrayWith,
} from '@aws-cdk/assert';
import {App} from '@aws-cdk/core';
import {GitHubActionsUserStack} from './github-actions-user-stack';

test('Empty Stack', () => {
  // GIVEN
  const app = new App();

  // WHEN
  const stack = new GitHubActionsUserStack(app, 'MyTestStack');
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
  const stack = new GitHubActionsUserStack(app, 'MyTestStack', {
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

[
  {
    permission: 'cloudformation:DescribeStackEvents',
    effect: 'Allow',
  },
  {
    permission: 'cloudformation:CreateStack',
    effect: 'Allow',
  },
  {
    permission: 'cloudformation:GetTemplate',
    effect: 'Allow',
  },
  {
    permission: 'cloudformation:DeleteStack',
    effect: 'Allow',
  },
  {
    permission: 'cloudformation:CreateChangeSet',
    effect: 'Allow',
  },
  {
    permission: 'cloudformation:DescribeChangeSet',
    effect: 'Allow',
  },
  {
    permission: 'cloudformation:ExecuteChangeSet',
    effect: 'Allow',
  },
  {
    permission: 'cloudformation:DescribeStacks',
    effect: 'Allow',
  },
  {
    permission: 'cloudformation:DescribeStacks',
    effect: 'Allow',
  },
].forEach(policy => {
  [undefined, ['Stack', 'Stack*']].forEach(stackNames => {
    [undefined, ['us-east-1', 'us-east-2']].forEach(regions => {
      [undefined, 'accountNumber'].forEach(accountNumber => {
        test(`User created with ${policy.permission} and ${
          stackNames ?? 'default stack names'
        } and ${regions ?? 'default regions'} and ${
          accountNumber ?? 'default account number'
        }`, () => {
          // GIVEN
          const app = new App();
          const resourceExpectations: string[] = [];
          stackNames?.forEach(stackName => {
            regions?.forEach(region => {
              resourceExpectations.push(
                `arn:aws:cloudformation:${region ?? '*'}:${
                  accountNumber ?? '*'
                }:stack/${stackName ?? '*'}/*`
              );
            });
          });
          const resourceExpectation =
            resourceExpectations.length > 1
              ? arrayWith(...resourceExpectations)
              : resourceExpectations[0];

          // WHEN
          const stack = new GitHubActionsUserStack(app, 'MyTestStack', {
            user: {
              resourceStackNames: stackNames,
              regions: regions,
              accountNumber: accountNumber,
            },
          });

          // THEN
          expectCDK(stack).to(
            haveResource(
              'AWS::IAM::Policy',
              deepObjectLike({
                PolicyDocument: {
                  Statement: [
                    {
                      Action: arrayWith(policy.permission),
                      Effect: policy.effect,
                      Resource: resourceExpectation,
                    },
                  ],
                },
              })
            )
          );
        });
      });
    });
  });
});
