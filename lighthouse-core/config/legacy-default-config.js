/**
 * @license Copyright 2018 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

import defaultConfig from './default-config.js';

const unsupportedAuditIds = [
  'experimental-interaction-to-next-paint',
  'uses-responsive-images-snapshot',
  'work-during-interaction',
];

const audits = defaultConfig.audits?.filter(audit =>
  !unsupportedAuditIds.find(auditId => audit.toString().endsWith(auditId)));

/** @type {LH.Config.Category} */
const performance = {
  // @ts-expect-error categories will always exist on the default config.
  ...defaultConfig.categories['performance'],
  auditRefs: defaultConfig.categories?.['performance'].auditRefs
    .filter(auditRef => !unsupportedAuditIds.includes(auditRef.id)) || [],
};

/** @type {Record<string, LH.Config.Category>} */
const categories = {
  ...defaultConfig.categories,
  'performance': performance,
};

/** @type {LH.Config.Json} */
const legacyDefaultConfig = {
  passes: [{
    passName: 'defaultPass',
    recordTrace: true,
    useThrottling: true,
    pauseAfterFcpMs: 1000,
    pauseAfterLoadMs: 1000,
    networkQuietThresholdMs: 1000,
    cpuQuietThresholdMs: 1000,
    gatherers: [
      'css-usage',
      'js-usage',
      'viewport-dimensions',
      'console-messages',
      'anchor-elements',
      'image-elements',
      'link-elements',
      'meta-elements',
      'script-elements',
      'scripts',
      'iframe-elements',
      'inputs',
      'main-document-content',
      'global-listeners',
      'dobetterweb/doctype',
      'dobetterweb/domstats',
      'dobetterweb/optimized-images',
      'dobetterweb/password-inputs-with-prevented-paste',
      'dobetterweb/response-compression',
      'dobetterweb/tags-blocking-first-paint',
      'seo/font-size',
      'seo/embedded-content',
      'seo/robots-txt',
      'seo/tap-targets',
      'accessibility',
      'trace-elements',
      'inspector-issues',
      'source-maps',
      'full-page-screenshot',
    ],
  },
  {
    passName: 'offlinePass',
    loadFailureMode: 'ignore',
    gatherers: [
      'service-worker',
    ],
  }],
  audits,
  categories,
  groups: defaultConfig.groups,
  settings: defaultConfig.settings,
};

export default legacyDefaultConfig;
