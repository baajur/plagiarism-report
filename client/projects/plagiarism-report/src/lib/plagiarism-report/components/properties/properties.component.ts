import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { CopyleaksReportOptions, ReportStatistics, ViewMode, CopyleaksTextConfig } from '../../models';
import { CompleteResult } from '../../models/api-models/CompleteResult';
import { LayoutMediaQueryService } from '../../services/layout-media-query.service';
import { ReportService } from '../../services/report.service';
import { StatisticsService } from '../../services/statistics.service';
import { truthy } from '../../utils/operators';
import { OptionsDialogComponent } from '../options-dialog/options-dialog.component';
import { DEFAULT_TEXT_CONFIG } from '../../utils/constants';
import { take } from 'rxjs/operators';
import { CopyleaksTranslateService, CopyleaksTranslations } from '../../services/copyleaks-translate.service';

@Component({
	selector: 'cr-properties',
	templateUrl: './properties.component.html',
	styleUrls: ['./properties.component.scss'],
	animations: [],
})
export class PropertiesComponent implements OnInit, OnDestroy {
	@HostBinding('class.mobile') isMobile: boolean;

	public options: CopyleaksReportOptions;
	public stats: ReportStatistics;
	public progress?: number = null;
	public help: boolean;
	public share: boolean;
	public download: boolean;
	public previewCount = 0;
	public hiddenResultsCount = 0;
	public metadata: CompleteResult;
	public viewMode: ViewMode;
	public identical: number;
	public minor: number;
	public related: number;

	public customColors = [
		{ name: 'Identical', value: '#ff6666' },
		{ name: 'Minor changes', value: '#ff9a9a' },
		{ name: 'Related meaning', value: '#ffd9b0' },
		{ name: 'Original', value: '#f7f7f7' },
	];
	public chartData = [];
	loa: any;

	previewsLoading = false;
	messages: CopyleaksTextConfig = DEFAULT_TEXT_CONFIG;
	translations: CopyleaksTranslations;

	constructor(
		// @Inject(COPYLEAKS_TEXT_CONFIG_INJECTION_TOKEN)
		// public messages: CopyleaksTextConfig,
		private reportService: ReportService,
		private layoutService: LayoutMediaQueryService,
		private dialogService: MatDialog,
		private statistics: StatisticsService,
		private translationsService: CopyleaksTranslateService
	) {}

	get isScanning() {
		return this.progress && (this.progress >= 0 || this.progress < 100);
	}
	get done() {
		return this.progress === 100;
	}

	get total(): number {
		return this.metadata.scannedDocument.totalWords;
	}
	get combined() {
		return this.stats.identical + this.stats.relatedMeaning + this.stats.minorChanges;
	}
	get score() {
		const res = Math.min(1, this.combined / (this.stats.total - this.stats.omittedWords));
		return isNaN(res) ? 0 : res;
	}
	get severity() {
		if (this.score <= 0.1) {
			return 'low';
		}
		if (this.score <= 0.5) {
			return 'medium';
		}
		return 'high';
	}

	get isShowingPartialStats() {
		if (!this.options || !this.stats) {
			return false;
		}
		if (!this.options.showIdentical && this.metadata.results.score.identicalWords > 0) {
			return true;
		}
		if (!this.options.showMinorChanges && this.metadata.results.score.minorChangedWords > 0) {
			return true;
		}
		if (!this.options.showRelated && this.metadata.results.score.relatedMeaningWords > 0) {
			return true;
		}
		return false;
	}

	/**
	 * Help button click handler
	 * Passes the click event to `ReportService`
	 * @param event native mouse event
	 */
	helpClicked(event: MouseEvent) {
		this.reportService.helpBtnClicked(event);
	}

	/**
	 * Share button click handler
	 * Passes the click event to `ReportService`
	 * @param event native mouse event
	 */
	shareClicked(event: MouseEvent) {
		this.reportService.shareBtnClicked(event);
	}

	/**
	 * Download button click handler
	 * Passes the click event to `ReportService`
	 * @param event native mouse event
	 */
	downloadClicked(event: MouseEvent) {
		this.reportService.downloadBtnClicked(event);
	}

	/** Toggle a comparison */
	toggleComparison(type: keyof CopyleaksReportOptions) {
		const options = { ...this.options };
		options[type] = !options[type];
		this.reportService.configure({ options });
	}
	/**
	 * Life-cycle method
	 * subscribe to:
	 * - progress changes
	 * - scan metadata
	 * - share / download visibility
	 * - statistics
	 * - layout changes
	 */
	ngOnInit() {
		this.translations = this.translationsService.translations;
		const {
			help$,
			share$,
			download$,
			completeResult$,
			progress$,
			previews$,
			viewMode$,
			options$,
			hiddenResults$,
			filteredPreviews$,
		} = this.reportService;

		completeResult$.pipe(untilDestroy(this)).subscribe(meta => {
			this.metadata = meta;
			if (meta.filters && meta.filters.resultIds) {
				filteredPreviews$.pipe(untilDestroy(this)).subscribe(previews => {
					let counter = previews.length;
					this.previewsLoading = counter !== 0;
					for (const preview of previews) {
						const result$ = this.reportService.findResultById$(preview.id);
						result$.pipe(take(1), untilDestroy(this)).subscribe(() => {
							--counter;
							if (counter === 0) {
								this.previewsLoading = false;
							}
						});
					}
				});
			}
		});

		previews$.pipe(untilDestroy(this)).subscribe(previews => (this.previewCount = previews.length));
		hiddenResults$
			.pipe(untilDestroy(this))
			.subscribe(hiddneResults => (this.hiddenResultsCount = hiddneResults.length));
		help$.pipe(untilDestroy(this)).subscribe(help => (this.help = help));
		share$.pipe(untilDestroy(this)).subscribe(share => (this.share = share));
		download$.pipe(untilDestroy(this)).subscribe(download => (this.download = download));
		progress$.pipe(untilDestroy(this)).subscribe(value => (this.progress = value));
		viewMode$.pipe(untilDestroy(this)).subscribe(viewMode => (this.viewMode = viewMode));
		options$.pipe(untilDestroy(this)).subscribe(options => (this.options = options));

		this.statistics.statistics$.pipe(untilDestroy(this), truthy()).subscribe(value => {
			this.stats = value;
			const { identical, minorChanges, relatedMeaning, omittedWords, total } = value;
			this.chartData = [
				{ name: 'Identical', value: identical },
				{ name: 'Minor changes', value: minorChanges },
				{ name: 'Related meaning', value: relatedMeaning },
				{ name: 'Original', value: total - (identical + minorChanges + relatedMeaning + omittedWords) },
			];
		});
		this.layoutService.isMobile$.pipe(untilDestroy(this)).subscribe(value => (this.isMobile = value));
	}

	/**
	 * Displays the settings dialog modal
	 */
	openSettingsDialog() {
		this.dialogService.open<OptionsDialogComponent, ReportService>(OptionsDialogComponent, {
			data: this.reportService,
		});
	}

	get resultsFound() {
		if (this.previewCount) {
			return this.previewCount - this.hiddenResultsCount;
		}
		return 0;
	}
	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}
