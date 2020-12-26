#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {WebAppStack} from '../lib/web-app-stack';

const app = new cdk.App();
new WebAppStack(app, 'CdkStack');
