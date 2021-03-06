#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {WebAppStack} from '../lib/web-app-stack';
import {WebAppCIUserStack} from '../lib/web-app-ci-user-stack';
import {RemovalPolicy} from '@aws-cdk/core';
import {join} from 'path';

const app = new cdk.App();

if (app.node.tryGetContext('stack') === 'ci-user') {
  const stackName = app.node.tryGetContext('stackName') ?? 'WebAppCIUserStack';
  const regions = app.node.tryGetContext('regions');
  new WebAppCIUserStack(app, stackName, {
    user: {
      username: app.node.tryGetContext('username'),
      accountNumber: app.node.tryGetContext('accountNumber'),
      regions: regions ? regions.split(',') : undefined,
      rolePolicyResourcePrefix: app.node.tryGetContext('resourcePrefix'),
    },
  });
} else {
  const stackName = app.node.tryGetContext('stackName') ?? 'WebAppStack';
  const removalPolicy = app.node.tryGetContext('removalPolicy');
  const bucketArn = app.node.tryGetContext('bucketArn');
  new WebAppStack(app, stackName, {
    sourcePath:
      app.node.tryGetContext('sourcePath') ??
      join(__dirname, '..', '..', 'web-app', 'dist', 'web-app'),
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
