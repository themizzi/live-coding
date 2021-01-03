import {Stack, Construct, StackProps, CfnOutput} from '@aws-cdk/core';
import {
  PolicyStatement,
  Effect,
  PolicyDocument,
  Policy,
  User,
} from '@aws-cdk/aws-iam';

export interface CIUserStackProps extends StackProps {
  user?: {
    username?: string;
    regions?: string[];
    accountNumber?: string;
    rolePolicyResourcePrefix?: string;
  };
}

export class WebAppCIUserStack extends Stack {
  constructor(scope: Construct, id: string, props?: CIUserStackProps) {
    super(scope, id, props);

    if (props?.user) {
      const accountNumber = props.user.accountNumber ?? '';
      const resourcePrefix = props.user.rolePolicyResourcePrefix ?? '';
      const stackStatement = new PolicyStatement({
        effect: Effect.ALLOW,
      });
      stackStatement.addActions(
        'cloudformation:DescribeStacks',
        'cloudformation:DescribeStackEvents',
        'cloudformation:CreateStack',
        'cloudformation:GetTemplate',
        'cloudformation:DeleteStack',
        'cloudformation:CreateChangeSet',
        'cloudformation:DescribeChangeSet',
        'cloudformation:ExecuteChangeSet'
      );
      stackStatement.addResources(
        `arn:aws:cloudformation:*:${
          accountNumber ?? ''
        }:stack/${resourcePrefix}*/*`,
        `arn:aws:cloudformation:*:${
          accountNumber ?? ''
        }:stack/${resourcePrefix}*`
      );

      const bucketStatement = new PolicyStatement({
        effect: Effect.ALLOW,
      });
      bucketStatement.addActions(
        's3:CreateBucket',
        's3:PutBucketPublicAccessBlock',
        's3:PutBucketPolicy',
        's3:GetBucketPolicy',
        's3:DeleteBucketPolicy'
      );
      bucketStatement.addResources(
        `arn:aws:s3:::${resourcePrefix.toLowerCase()}*`
      );

      const iamRoleStatement = new PolicyStatement({
        effect: Effect.ALLOW,
      });
      iamRoleStatement.addActions(
        'iam:CreateRole',
        'iam:AttachRolePolicy',
        'iam:DetachRolePolicy',
        'iam:DeleteRole',
        'iam:GetRolePolicy',
        'iam:PutRolePolicy',
        'iam:DeleteRolePolicy',
        'iam:GetRole',
        'iam:PassRole'
      );
      iamRoleStatement.addResources(`arn:aws:iam::*:role/${resourcePrefix}*`);

      const cloudfrontStatement = new PolicyStatement({
        effect: Effect.ALLOW,
      });
      cloudfrontStatement.addActions(
        'cloudfront:CreateCloudFrontOriginAccessIdentity',
        'cloudfront:GetCloudFrontOriginAccessIdentityConfig',
        'cloudfront:DeleteCloudFrontOriginAccessIdentity',
        'cloudfront:GetCloudFrontOriginAccessIdentity',
        'cloudfront:CreateDistribution',
        'cloudfront:TagResource',
        'cloudfront:GetDistribution',
        'cloudfront:UpdateDistribution',
        'cloudfront:DeleteDistribution'
      );
      cloudfrontStatement.addResources('*');

      const lambdaStatement = new PolicyStatement({
        effect: Effect.ALLOW,
      });
      lambdaStatement.addActions(
        'lambda:CreateFunction',
        'lambda:GetFunctionConfiguration',
        'lambda:DeleteFunction',
        'lambda:GetFunction',
        'lambda:InvokeFunction'
      );
      lambdaStatement.addResources(
        `arn:aws:lambda:*:*:function:${resourcePrefix}*`
      );

      const toolkitStatement = new PolicyStatement({
        effect: Effect.ALLOW,
      });
      toolkitStatement.addActions('cloudformation:DescribeStacks');
      toolkitStatement.addResources(
        `arn:aws:cloudformation:*:${accountNumber}:stack/CDKToolkit/*`
      );

      const stagingBucketStatement = new PolicyStatement({
        effect: Effect.ALLOW,
      });
      stagingBucketStatement.addActions(
        's3:GetBucketLocation',
        's3:PutObject',
        's3:GetObject',
        's3:ListBucket'
      );
      stagingBucketStatement.addResources(
        'arn:aws:s3:::cdktoolkit-stagingbucket-*'
      );

      const policyDocument = new PolicyDocument({
        assignSids: true,
        statements: [
          stackStatement,
          toolkitStatement,
          stagingBucketStatement,
          bucketStatement,
          iamRoleStatement,
          cloudfrontStatement,
          lambdaStatement,
        ],
      });

      const policy = new Policy(this, 'WebAppCIUserPolicy', {
        document: policyDocument,
      });

      const user = new User(this, 'WebAppCIUser', {
        userName: props.user.username ?? 'web-app-ci-user',
      });

      user.attachInlinePolicy(policy);

      new CfnOutput(this, 'WebAppCIUsername', {
        value: user.userName,
      });
    }
  }
}
