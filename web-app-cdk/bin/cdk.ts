#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {WebAppStack} from '../lib/web-app-stack';
import {WebAppCIUserStack} from '../lib/web-app-ci-user-stack';
import {RemovalPolicy} from '@aws-cdk/core';

const app = new cdk.App();

if (app.node.tryGetContext('stack') === 'ci-user') {
  const stackName = app.node.tryGetContext('stackName') ?? 'WebAppCIUserStack';
  const resourceStackNames = app.node.tryGetContext('resourceStackNames');
  const regions = app.node.tryGetContext('regions');
  new WebAppCIUserStack(app, stackName, {
    user: {
      username: app.node.tryGetContext('username'),
      resourceStackNames: resourceStackNames
        ? resourceStackNames.split(',')
        : undefined,
      accountNumber: app.node.tryGetContext('accountNumber'),
      regions: regions ? regions.split(',') : undefined,
    },
  });
} else {
  const stackName = app.node.tryGetContext('stackName') ?? 'WebAppStack';
  const removalPolicy = app.node.tryGetContext('removalPolicy');
  const bucketArn = app.node.tryGetContext('bucketArn');
  new WebAppStack(app, stackName, {
    bucket: bucketArn ?? {
      removalPolicy:
        removalPolicy === 'DESTROY'
          ? RemovalPolicy.DESTROY
          : removalPolicy === 'SNAPSHOT'
          ? RemovalPolicy.SNAPSHOT
          : removalPolicy === 'RETAIN'
          ? RemovalPolicy.RETAIN
          : undefined,
    },
    prefix: app.node.tryGetContext('bucketPrefix'),
  });
}
