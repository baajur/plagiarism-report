import { Type } from '@angular/core';
import { ResultItem } from '../Matches';

/** A basic response from Copyleaks api */
export interface BasicResponse {
	status: ScanStatus;
	error?: ScanError;
	developerPayload?: string;
}

/** An error response from Copyleaks api */
export interface ScanError {
	message?: string;
	code: number;
}

/** A scan complete response from Copyleaks api */
export interface CompleteResult extends BasicResponse {
	scannedDocument: ScannedDocument;
	results: ResultPreviews;
	filters?: CompleteResultsFilters;
}

/**
 * A result preview of a complete response from Copyleaks api
 */
export interface ResultPreviews {
	internet: InternetResultPreview[];
	database: DatabaseResultPreview[];
	batch: BatchResultPreview[];
	repositories?: RepositoryResultPreview[];
	score: Score;
}

/**
 * A results filters for report view
 */
export interface CompleteResultsFilters {
	resultIds: string[];
}

/** Enum representing the status of a scan */
export enum ScanStatus {
	Success = 0,
	Error = 1,
	CreditsChecked = 2,
	Indexed = 3,
}

/** Type representing a summary of the scanned document from Copyleaks api */
export interface ScannedDocument {
	scanId: string;
	totalWords: number;
	totalExcluded: number;
	credits: number;
	creationTime: string;
}

/** Type representing a summary of the reuslts of a scanned document */
export interface Score {
	identicalWords: number;
	minorChangedWords: number;
	relatedMeaningWords: number;
	aggregatedScore: number;
}

/** Base type for a result preview  */
export interface ResultPreviewBase {
	id: string;
	title: string;
	introduction: string;
	matchedWords: number;
	type: EResultPreviewType;
	scanId?: string | void;
	url?: string | void;
	component?: Type<ResultPreviewComponentBase>;
}

/** result preview types  */
export enum EResultPreviewType {
	Batch,
	Repositroy,
	Internet,
	Database,
}

/** Type representing a scan result preview custom component base */
export interface ResultPreviewComponentBase {
	setPreview: (preview: ResultPreviewBase) => void;
	isLoading: (isLoading: boolean) => void;
	setResult: (result: ResultItem) => void;
}

/** Type containing a preview of a result from the internet */
export interface InternetResultPreview extends ResultPreviewBase {
	url: string;
	scanId: void;
}
/** Type containing a preview of a result from the copyleaks database */
export interface DatabaseResultPreview extends ResultPreviewBase {
	url: void;
	scanId?: string;
}
/** Type containing a preview of a result from a batch scan */
export interface BatchResultPreview extends ResultPreviewBase {
	scanId: string;
	url: void;
}
/** Type containing a preview of a result from a repository scan */
export interface RepositoryResultPreview extends ResultPreviewBase {
	repositoryId: string;
}

/** Type containing some preview of a result from copyleaks api */
export type ResultPreview =
	| InternetResultPreview
	| DatabaseResultPreview
	| BatchResultPreview
	| RepositoryResultPreview;

/** Enum representing the access of a result */
export enum ResultAccess {
	full,
	locked,
}
