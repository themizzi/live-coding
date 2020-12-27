import {
  Distribution,
  IDistribution,
  PriceClass,
  ViewerProtocolPolicy,
} from '@aws-cdk/aws-cloudfront';
import {S3Origin} from '@aws-cdk/aws-cloudfront-origins';
import {BlockPublicAccess, Bucket, IBucket} from '@aws-cdk/aws-s3';
import {BucketDeployment, ISource, Source} from '@aws-cdk/aws-s3-deployment';
import {
  CfnOutput,
  Construct,
  RemovalPolicy,
  Stack,
  StackProps,
} from '@aws-cdk/core';

export interface WebAppStackProps extends StackProps {
  bucket?:
    | {
        removalPolicy?: RemovalPolicy;
        name?: string;
      }
    | string;
  sourcePath?: string;
  bucketArn?: string;
  prefix?: string;
}
export class WebAppStack extends Stack {
  readonly bucket: IBucket;
  readonly distribution: IDistribution;

  constructor(scope: Construct, id: string, props?: WebAppStackProps) {
    super(scope, id, props);

    if (!props) return;

    this.bucket =
      typeof props.bucket === 'string'
        ? Bucket.fromBucketArn(this, 'WebAppStackBucket', props.bucket)
        : new Bucket(this, 'WebAppStackBucket', {
            bucketName: `web-app${props.bucket?.name ? '-' : ''}${
              props.bucket?.name ?? ''
            }`,
            removalPolicy: props.bucket?.removalPolicy ?? RemovalPolicy.RETAIN,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
          });

    new CfnOutput(this, 'BucketARN', {
      value: this.bucket.bucketArn,
    });

    new CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
    });

    const prefix = props?.prefix ?? 'default';

    this.distribution = new Distribution(this, 'WebAppDistribution', {
      priceClass: PriceClass.PRICE_CLASS_100,
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new S3Origin(this.bucket, {
          originPath: `/${prefix}`,
        }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    new CfnOutput(this, 'Domain', {
      value: this.distribution.distributionDomainName,
    });

    const sources: ISource[] = [];
    if (props.sourcePath) {
      sources.push(Source.asset(props.sourcePath));
    }
    new BucketDeployment(this, 'WebAppDeployment', {
      sources: sources,
      distribution: this.distribution,
      distributionPaths: ['/*'],
      destinationBucket: this.bucket,
      destinationKeyPrefix: prefix,
    });
  }
}
