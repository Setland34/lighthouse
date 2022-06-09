/**
 * @license Copyright 2017 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/**
 * @fileoverview Audits a page to determine if it is calling deprecated APIs.
 */

const Audit = require('./audit.js');
const JsBundles = require('../computed/js-bundles.js');
const i18n = require('../lib/i18n/i18n.js');
const {getIssueDetailDescription} = require('./deprecations-strings.js');

/* eslint-disable max-len */
const UIStrings = {
  /** Title of a Lighthouse audit that provides detail on the use of deprecated APIs. This descriptive title is shown to users when the page does not use deprecated APIs. */
  title: 'Avoids deprecated APIs',
  /** Title of a Lighthouse audit that provides detail on the use of deprecated APIs. This descriptive title is shown to users when the page uses deprecated APIs. */
  failureTitle: 'Uses deprecated APIs',
  /** Description of a Lighthouse audit that tells the user why they should not use deprecated APIs on their page. This is displayed after a user expands the section to see more. No character length limits. 'Learn More' becomes link text to additional documentation. */
  description: 'Deprecated APIs will eventually be removed from the browser. ' +
      '[Learn more](https://web.dev/deprecations/).',
  /** [ICU Syntax] Label for the audit identifying the number of warnings generated by using deprecated APIs. */
  displayValue: `{itemCount, plural,
    =1 {1 warning found}
    other {# warnings found}
    }`,
  /** Header of the table column which displays the warning message describing use of a deprecated API by code running in the web page. */
  columnDeprecate: 'Deprecation / Warning',
  /** Table column header for line of code (eg. 432) that is using a deprecated API. */
  columnLine: 'Line',
};
/* eslint-enable max-len */

const str_ = i18n.createMessageInstanceIdFn(__filename, UIStrings);

class Deprecations extends Audit {
  /**
   * @return {LH.Audit.Meta}
   */
  static get meta() {
    return {
      id: 'deprecations',
      title: str_(UIStrings.title),
      failureTitle: str_(UIStrings.failureTitle),
      description: str_(UIStrings.description),
      requiredArtifacts: ['InspectorIssues', 'SourceMaps', 'Scripts'],
    };
  }

  /**
   * @param {LH.Artifacts} artifacts
   * @param {LH.Audit.Context} context
   * @return {Promise<LH.Audit.Product>}
   */
  static async audit(artifacts, context) {
    const bundles = await JsBundles.request(artifacts, context);

    const deprecations = artifacts.InspectorIssues.deprecationIssue
      .map(deprecation => {
        const {scriptId, url, lineNumber, columnNumber} = deprecation.sourceCodeLocation;
        const bundle = bundles.find(bundle => bundle.script.scriptId === scriptId);
        const deprecationMeta = getIssueDetailDescription(deprecation);

        /** @type {LH.Audit.Details.TableSubItems=} */
        let subItems = undefined;
        if (deprecationMeta.links.length) {
          subItems = {
            type: 'subitems',
            items: deprecationMeta.links.map(link => ({
              type: 'link',
              url: link.link,
              text: link.linkTitle,
            })),
          };
        }

        // @ts-expect-error: The english string used to be included on the protocol, but no longer is.
        const legacyMessage = deprecation.message;

        /** @type {LH.Audit.Details.TableItem} */
        const item = {
          value: deprecationMeta.message || legacyMessage || deprecation.type,
          // Protocol.Audits.SourceCodeLocation.columnNumber is 1-indexed, but we use 0-indexed.
          source: Audit.makeSourceLocation(url, lineNumber, columnNumber - 1, bundle),
          subItems,
        };
        return item;
      });

    /** @type {LH.Audit.Details.Table['headings']} */
    const headings = [
      {key: 'value', itemType: 'text', text: str_(UIStrings.columnDeprecate)},
      {key: 'source', itemType: 'source-location', text: str_(i18n.UIStrings.columnSource)},
    ];
    const details = Audit.makeTableDetails(headings, deprecations);

    let displayValue;
    if (deprecations.length > 0) {
      displayValue = str_(UIStrings.displayValue, {itemCount: deprecations.length});
    }

    return {
      score: Number(deprecations.length === 0),
      displayValue,
      details,
    };
  }
}

module.exports = Deprecations;
module.exports.UIStrings = UIStrings;
