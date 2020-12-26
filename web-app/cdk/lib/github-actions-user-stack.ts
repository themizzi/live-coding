import {Stack, Construct, StackProps, CfnOutput} from '@aws-cdk/core';
import {
  PolicyStatement,
  Effect,
  PolicyDocument,
  Policy,
  User,
} from '@aws-cdk/aws-iam';

export interface GitHubActionsStackProps extends StackProps {
  user?: {
    username?: string;
    resourceStackNames?: string[];
    regions?: string[];
    accountNumber?: string;
  };
}

export class GitHubActionsUserStack extends Stack {
  constructor(scope: Construct, id: string, props?: GitHubActionsStackProps) {
    super(scope, id, props);

    if (props?.user) {
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
      const resourceStackNames = props.user.resourceStackNames ?? ['*'];
      const regions = props.user.regions ?? ['*'];
      const accountNumber = props.user.accountNumber ?? '*';
      const resources: string[] = [];
      resourceStackNames.forEach(x =>
        regions.forEach(y =>
          resources.push(
            `arn:aws:cloudformation:${y}:${accountNumber}:stack/${x}/*`
          )
        )
      );
      if (resources.length > 0) {
        stackStatement.addResources(...resources);
      }

      const toolkitStatement = new PolicyStatement({
        effect: Effect.ALLOW,
      });
      toolkitStatement.addActions('cloudformation:DescribeStacks');
      toolkitStatement.addResources(
        `arn:aws:cloudformation:*:${props.env?.account}:stack/CDKToolkit/*`
      );

      const policyDocument = new PolicyDocument({
        assignSids: true,
        statements: [stackStatement, toolkitStatement],
      });

      const policy = new Policy(this, 'GitHubActionPolicy', {
        document: policyDocument,
      });

      const user = new User(this, 'GithubActionsUser', {
        userName: props.user.username,
      });

      user.attachInlinePolicy(policy);

      new CfnOutput(this, 'GitHubActionsWebAppUsername', {
        value: user.userName,
      });
    }
  }
}
