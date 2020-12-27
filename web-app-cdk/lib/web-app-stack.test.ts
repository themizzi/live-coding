import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
  haveResourceLike,
  ResourcePart,
  haveOutput,
} from '@aws-cdk/assert';
import {CfnDistribution} from '@aws-cdk/aws-cloudfront';
import {CfnBucket, Bucket, IBucket} from '@aws-cdk/aws-s3';
import {App, Fn, RemovalPolicy} from '@aws-cdk/core';
import {WebAppStack, WebAppStackProps} from './web-app-stack';

describe('Web App Stack', () => {
  let app: App;

  const testStack = (props?: WebAppStackProps): WebAppStack => {
    return new WebAppStack(app, 'MyTestStack', props);
  };

  beforeEach(() => {
    app = new App();
  });

  test('Empty Stack', () => {
    // WHEN
    const stack = testStack();

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

  [undefined, RemovalPolicy.DESTROY].forEach(x => {
    test('Has bucket with removal policy', () => {
      // GIVEN
      const removalPolicy = x === RemovalPolicy.DESTROY ? 'Delete' : undefined;

      // WHEN
      const stack = testStack({
        bucket: {
          removalPolicy: x,
        },
      });

      // THEN
      expectCDK(stack).to(
        haveResourceLike(
          'AWS::S3::Bucket',
          {
            DeletionPolicy: removalPolicy,
          },
          ResourcePart.CompleteDefinition
        )
      );
    });
  });

  test('Restricts public access', () => {
    // WHEN
    const stack = testStack({
      bucket: {},
    });

    // THEN
    expectCDK(stack).to(
      haveResourceLike('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      })
    );
  });

  test('Outputs bucket arn', () => {
    // WHEN
    const stack = testStack({
      bucket: {},
    });

    // THEN
    const bucket = stack.bucket.node.defaultChild as CfnBucket;
    const logicalId = stack.resolve(bucket.logicalId);
    expectCDK(stack).to(
      haveOutput({
        outputName: 'BucketARN',
        outputValue: stack.resolve(Fn.getAtt(logicalId, 'Arn').toString()),
      })
    );
  });

  test('Outputs supplied bucket ARN', () => {
    // GIVEN
    Bucket.fromBucketArn = (scope, id, bucketArn): IBucket => {
      if (bucketArn === 'arn') {
        return new Bucket(scope, id);
      }

      throw 'fromBucketArn not called wih arn';
    };

    // WHEN
    const stack = testStack({
      bucket: 'arn',
    });

    // THEN
    const bucket = stack.bucket.node.defaultChild as CfnBucket;
    const logicalId = stack.resolve(bucket.logicalId);
    expectCDK(stack).to(
      haveOutput({
        outputName: 'BucketARN',
        outputValue: stack.resolve(Fn.getAtt(logicalId, 'Arn').toString()),
      })
    );
  });

  test('Outputs bucket name', () => {
    // WHEN
    const stack = testStack({
      bucket: {},
    });

    // THEN
    const bucket = stack.bucket.node.defaultChild as CfnBucket;
    const logicalId = stack.resolve(bucket.logicalId);
    expectCDK(stack).to(
      haveOutput({
        outputName: 'BucketName',
        outputValue: stack.resolve(Fn.ref(logicalId)),
      })
    );
  });

  test('Outputs supplied bucket name', () => {
    // GIVEN
    Bucket.fromBucketArn = (scope, id, bucketArn): IBucket => {
      if (bucketArn === 'arn') {
        return new Bucket(scope, id);
      }

      throw 'fromBucketArn not called wih arn';
    };

    // WHEN
    const stack = testStack({
      bucket: 'arn',
    });

    // THEN
    const bucket = stack.bucket.node.defaultChild as CfnBucket;
    const logicalId = stack.resolve(bucket.logicalId);
    expectCDK(stack).to(
      haveOutput({
        outputName: 'BucketName',
        outputValue: stack.resolve(Fn.ref(logicalId)),
      })
    );
  });

  test('Has distribution with price class 100', () => {
    // WHEN
    const stack = testStack({
      bucket: {},
    });

    // THEN
    expectCDK(stack).to(
      haveResourceLike('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          PriceClass: 'PriceClass_100',
        },
      })
    );
  });

  test('Has default root object of index.html', () => {
    // WHEN
    const stack = testStack({
      bucket: {},
    });

    // THEN
    expectCDK(stack).to(
      haveResourceLike('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          DefaultRootObject: 'index.html',
        },
      })
    );
  });

  test('Has bucket origin', () => {
    // WHEN
    const stack = testStack({
      bucket: {},
    });

    // THEN
    const bucket = stack.bucket.node.defaultChild as CfnBucket;
    const logicalId = stack.resolve(bucket.logicalId);
    expectCDK(stack).to(
      haveResourceLike('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          Origins: [
            {
              DomainName: stack.resolve(
                Fn.getAtt(logicalId, 'RegionalDomainName')
              ),
            },
          ],
        },
      })
    );
  });

  test('Has supplied bucket origin', () => {
    // GIVEN
    Bucket.fromBucketArn = (scope, id, bucketArn): IBucket => {
      if (bucketArn === 'arn') {
        return new Bucket(scope, id);
      }

      throw 'fromBucketArn not called wih arn';
    };

    // WHEN
    const stack = testStack({
      bucket: 'arn',
    });

    // THEN
    const bucket = stack.bucket.node.defaultChild as CfnBucket;
    const logicalId = stack.resolve(bucket.logicalId);
    expectCDK(stack).to(
      haveResourceLike('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          Origins: [
            {
              DomainName: stack.resolve(
                Fn.getAtt(logicalId, 'RegionalDomainName')
              ),
            },
          ],
        },
      })
    );
  });

  test('Has default origin path', () => {
    // WHEN
    const stack = testStack({
      bucket: {},
    });

    // THEN
    expectCDK(stack).to(
      haveResourceLike('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          Origins: [
            {
              OriginPath: '/default',
            },
          ],
        },
      })
    );
  });

  test('Uses supplied origin path', () => {
    // WHEN
    const stack = testStack({
      prefix: 'prefix',
    });

    // THEN
    expectCDK(stack).to(
      haveResourceLike('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          Origins: [
            {
              OriginPath: '/prefix',
            },
          ],
        },
      })
    );
  });

  test('Has viewer policy of https redirect', () => {
    // WHEN
    const stack = testStack({
      prefix: 'prefix',
    });

    // THEN
    expectCDK(stack).to(
      haveResourceLike('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          DefaultCacheBehavior: {
            ViewerProtocolPolicy: 'redirect-to-https',
          },
        },
      })
    );
  });

  test('Outputs distribution domain name', () => {
    // WHEN
    const stack = testStack({
      bucket: {},
    });

    // THEN
    const distribution = stack.distribution.node
      .defaultChild as CfnDistribution;
    const logicalId = stack.resolve(distribution.logicalId);
    expectCDK(stack).to(
      haveOutput({
        outputName: 'Domain',
        outputValue: stack.resolve(Fn.getAtt(logicalId, 'DomainName')),
      })
    );
  });

  test('Has bucket deployment with distribution', () => {
    // WHEN
    const stack = testStack({
      bucket: {},
    });

    // THEN
    const distribution = stack.distribution.node
      .defaultChild as CfnDistribution;
    const logicalId = stack.resolve(distribution.logicalId);
    expectCDK(stack).to(
      haveResourceLike('Custom::CDKBucketDeployment', {
        DistributionId: stack.resolve(Fn.ref(logicalId)),
      })
    );
  });

  test('Has bucket deployment with distribution paths', () => {
    // WHEN
    const stack = testStack({
      bucket: {},
    });

    // THEN
    expectCDK(stack).to(
      haveResourceLike('Custom::CDKBucketDeployment', {
        DistributionPaths: ['/*'],
      })
    );
  });

  test('Has bucket deployment with bucket', () => {
    // WHEN
    const stack = testStack({
      bucket: {},
    });

    // THEN
    const bucket = stack.bucket.node.defaultChild as CfnBucket;
    const logicalId = stack.resolve(bucket.logicalId);
    expectCDK(stack).to(
      haveResourceLike('Custom::CDKBucketDeployment', {
        DestinationBucketName: stack.resolve(Fn.ref(logicalId)),
      })
    );
  });

  test('Has bucket deployment with supplied bucket', () => {
    // GIVEN
    Bucket.fromBucketArn = (scope, id, bucketArn): IBucket => {
      if (bucketArn === 'arn') {
        return new Bucket(scope, id);
      }

      throw 'fromBucketArn not called wih arn';
    };

    // WHEN
    const stack = testStack({
      bucket: 'arn',
    });

    // THEN
    const bucket = stack.bucket.node.defaultChild as CfnBucket;
    const logicalId = stack.resolve(bucket.logicalId);
    expectCDK(stack).to(
      haveResourceLike('Custom::CDKBucketDeployment', {
        DestinationBucketName: stack.resolve(Fn.ref(logicalId)),
      })
    );
  });

  test('Has bucket deployment with bucket default prefix', () => {
    // WHEN
    const stack = testStack({
      bucket: {},
    });

    // THEN
    expectCDK(stack).to(
      haveResourceLike('Custom::CDKBucketDeployment', {
        DestinationBucketKeyPrefix: 'default',
      })
    );
  });

  test('Has bucket deployment with bucket supplied prefix', () => {
    // WHEN
    const stack = testStack({
      prefix: 'prefix',
    });

    // THEN
    expectCDK(stack).to(
      haveResourceLike('Custom::CDKBucketDeployment', {
        DestinationBucketKeyPrefix: 'prefix',
      })
    );
  });
});
