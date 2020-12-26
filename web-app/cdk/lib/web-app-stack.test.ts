import {expect as expectCDK, matchTemplate, MatchStyle} from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Cdk from './web-app-stack';

test('Empty Stack', () => {
  // GIVEN
  const app = new cdk.App();

  // WHEN
  const stack = new Cdk.CdkStack(app, 'MyTestStack');

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
