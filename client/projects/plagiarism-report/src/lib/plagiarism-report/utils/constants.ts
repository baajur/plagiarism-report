import { InjectionToken } from '@angular/core';
import { CopyleaksReportConfig } from '../models';

/** Constants related to `report.service.ts` */
export const REPORT_SERVICE = {
	RESULTS_SETTINGS_KEY: 'copyleaks-results-settings',
	BTN_THROTTLE_MS: 250,
};

/** The default config of the report component. */
export const DEFAULT_CONFIG: CopyleaksReportConfig = {
	contentMode: 'html',
	share: false,
	download: false,
	dialogConfig: {
		height: 'auto',
		width: 'auto',
	},
};

/** Font size unit for increasing/decreasing font size while in `text` content mode */
export const TEXT_FONT_SIZE_UNIT = 0.25;

/** Max font size zoom level */
export const MAX_TEXT_ZOOM = 4;

/** Min font size zoom level */
export const MIN_TEXT_ZOOM = 0.5;

/** User messages for text exclusion cases */

export const EXCLUDE_MESSAGE = {
	1: 'Quotation are omitted according to your settings',
	2: 'References are omitted according to your settings',
	5: 'HTML templates are omitted according to your settings',
	6: 'Tables of content are omitted according to your settings',
};
/** Injection token used to override the default config of the report */
export const COPYLEAKS_CONFIG_INJECTION_TOKEN = new InjectionToken<CopyleaksReportConfig>('copyleaks-config');

/** The current Copyleaks API version that this library supports */
export const CURRENT_API_VERSION = 3;

/** Message used for `CompleteResult` object validation error */
export const COMPLETE_RESULT_VALIDATION_ERROR =
	'Wrong argument supplied. Should be a CompleteResult.\n' +
	'See https://api.copyleaks.com/documentation/v3/webhooks/completed';

/** Message used for `NewResult` object validation error */
export const NEW_RESULT_VALIDATION_ERROR =
	'Wrong argument supplied. Should be a NewResult.\n' +
	'See https://api.copyleaks.com/documentation/v3/webhooks/new-result';

/** Message used for `ScanResult` object validation error */
export const SCAN_RESULT_VALIDATION_ERROR =
	'Wrong argument supplied. Should be a ScanResult.\n' +
	'See https://api.copyleaks.com/documentation/v3/downloads/result';

/** Message used for `ScanSource` object validation error */
export const SCAN_SOURCE_VALIDATION_ERROR =
	'Wrong argument supplied. Should be a ScanSource.\n' +
	'See https://api.copyleaks.com/documentation/v3/downloads/source';

/** Message used for `version` number validation error */
export const VERSION_VALIDATION_ERROR =
	'argument was generated by an outdated version of the API.\n' +
	`please provide an argument generated by API version: ${CURRENT_API_VERSION}\n` +
	`See https://api.copyleaks.com/documentation/v${CURRENT_API_VERSION}`;