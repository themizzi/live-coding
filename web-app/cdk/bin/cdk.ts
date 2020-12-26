#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {WebAppStack} from '../lib/web-app-stack';
<<<<<<< HEAD
import {WebAppCIUserStack} from '../lib/web-app-ci-user-stack';

const app = new cdk.App();

if (app.node.tryGetContext('stack') === 'github-actions-user') {
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
  new WebAppStack(app, stackName);
}
=======

const app = new cdk.App();
new WebAppStack(app, 'CdkStack');
>>>>>>> feature/dev-cd
