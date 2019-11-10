import { CopyleaksReportOptions } from './ResultsSettings';

/** possible view modes of the report */
export type ViewMode = 'one-to-many' | 'one-to-one';
/** possible content modes of the report */
export type ContentMode = 'text' | 'html';
/** possible text direction modes of the report */
export type DirectionMode = 'rtl' | 'ltr';

/** Type representing the report configuration and options */
export interface CopyleaksReportConfig {
	/** The content mode the report is displaying */
	contentMode?: ContentMode;
	/** The page of the source document */
	sourcePage?: number;
	/** The page of the suspect document */
	suspectPage?: number;
	/** The view mode of the report is displaying */
	viewMode?: ViewMode;
	/** The report results options */
	options?: CopyleaksReportOptions;
	/** The visibility state of the share button */
	share?: boolean;
	/** The visibility state of the download button */
	download?: boolean;
	/** The visibility state of the back button in `one-to-one` view */
	disableSuspectBackButton?: boolean;
	/** The id of the scan the report is displaying */
	scanId?: string;
	/** The suspect that is focused in the report */
	suspectId?: string;
}