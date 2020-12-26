import {expect as expectCDK, matchTemplate, MatchStyle} from '@aws-cdk/assert';
import {App} from '@aws-cdk/core';
import {WebAppStack} from './web-app-stack';

test('Empty Stack', () => {
  // GIVEN
  const app = new App();

  // WHEN
  const stack = new WebAppStack(app, 'MyTestStack');

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
