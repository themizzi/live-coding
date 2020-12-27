import {
  Distribution,
  IDistribution,
  PriceClass,
  ViewerProtocolPolicy,
} from '@aws-cdk/aws-cloudfront';
import {S3Origin} from '@aws-cdk/aws-cloudfront-origins';
import {BlockPublicAccess, Bucket, IBucket} from '@aws-cdk/aws-s3';
import {BucketDeployment, Source} from '@aws-cdk/aws-s3-deployment';
import {
  CfnOutput,
  Construct,
  RemovalPolicy,
  Stack,
  StackProps,
} from '@aws-cdk/core';
import {join} from 'path';

export interface WebAppStackProps extends StackProps {
  bucket?: {
    bucketArn?: string;
    prefix?: string;
    removalPolicy?: RemovalPolicy;
    sourcePath?: string;
  };
}
export class WebAppStack extends Stack {
  readonly bucket: IBucket;
  readonly distribution: IDistribution;

  constructor(scope: Construct, id: string, props?: WebAppStackProps) {
    super(scope, id, props);

    if (props?.bucket) {
      this.bucket = props.bucket.bucketArn
        ? Bucket.fromBucketArn(
            this,
            'WebAppStackBucket',
            props.bucket.bucketArn
          )
        : new Bucket(this, 'WebAppStackBucket', {
            removalPolicy: props.bucket.removalPolicy ?? RemovalPolicy.RETAIN,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
          });

      new CfnOutput(this, 'BucketARN', {
        value: this.bucket.bucketArn,
      });

      new CfnOutput(this, 'BucketName', {
        value: this.bucket.bucketName,
      });

      this.distribution = new Distribution(this, 'WebAppDistribution', {
        priceClass: PriceClass.PRICE_CLASS_100,
        defaultRootObject: 'index.html',
        defaultBehavior: {
          origin: new S3Origin(this.bucket, {
            originPath: `/${props.bucket.prefix ?? 'default'}`,
          }),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      });

      new CfnOutput(this, 'Domain', {
        value: this.distribution.distributionDomainName,
      });

      new BucketDeployment(this, 'WebAppDeployment', {
        sources: [
          Source.asset(
            props.bucket.sourcePath ??
              join(__dirname, '..', '..', 'web-app', 'dist', 'web-app')
          ),
        ],
        distribution: this.distribution,
        distributionPaths: ['/*'],
        destinationBucket: this.bucket,
        destinationKeyPrefix: props.bucket.prefix ?? 'default',
      });
    }
  }
}
