import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { distinctUntilChanged } from 'rxjs/operators';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { ReportStatistics, ViewMode } from '../../models';
import { CompleteResult } from '../../models/api-models/CompleteResult';
import { LayoutMediaQueryService } from '../../services/layout-media-query.service';
import { ReportService } from '../../services/report.service';
import { StatisticsService } from '../../services/statistics.service';
import { fadeIn } from '../../utils/animations';
import { truthy } from '../../utils/operators';

@Component({
	selector: 'cr-properties',
	templateUrl: './properties.component.html',
	styleUrls: ['./properties.component.scss'],
	animations: [fadeIn],
})
export class PropertiesComponent implements OnInit, OnDestroy {
	@HostBinding('class.mobile') isMobile: boolean;

	public stats: ReportStatistics;
	public progress?: number = null;
	public share: boolean;
	public download: boolean;
	public previewCount = 0;
	public metadata: CompleteResult;
	public viewMode: ViewMode;
	public identical: number;
	public minor: number;
	public related: number;
	public customColors = [
		{ name: 'identical', value: '#ff6666' },
		{ name: 'minor changes', value: '#ff9a9a' },
		{ name: 'related meaning', value: '#ffd9b0' },
		{ name: 'original', value: '#f7f7f7' },
	];
	public chartData = [];

	constructor(
		private reportService: ReportService,
		private layoutService: LayoutMediaQueryService,
		private statistics: StatisticsService
	) {}

	get done() {
		return this.progress === 100;
	}

	get total(): number {
		return this.metadata.scannedDocument.totalWords;
	}

	/**
	 * Download button click handler
	 * Pass the click event to `ReportService`
	 */
	downloadClicked(event: MouseEvent) {
		this.reportService.downloadBtnClicked(event);
	}

	/**
	 * Share button click handler
	 * Pass the click event to `ReportService`
	 */
	shareClicked(event: MouseEvent) {
		this.reportService.shareBtnClicked(event);
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
		const { share$, download$, completeResult$, progress$, previews$, viewMode$ } = this.reportService;
		completeResult$.pipe(untilDestroy(this)).subscribe(meta => (this.metadata = meta));
		previews$.subscribe(({ length }) => (this.previewCount = length));
		share$.pipe(untilDestroy(this)).subscribe(share => (this.share = share));
		download$.pipe(untilDestroy(this)).subscribe(download => (this.download = download));
		progress$.pipe(untilDestroy(this)).subscribe(value => (this.progress = value));
		viewMode$.pipe(untilDestroy(this)).subscribe(viewMode => (this.viewMode = viewMode));
		this.statistics.statistics$
			.pipe(
				distinctUntilChanged(),
				truthy(),
				untilDestroy(this)
			)
			.subscribe(value => {
				this.stats = value;
				const { identical, minorChanges, relatedMeaning, omittedWords, total } = value;
				this.chartData = [
					{ name: 'identical', value: identical },
					{ name: 'minor changes', value: minorChanges },
					{ name: 'related meaning', value: relatedMeaning },
					{ name: 'original', value: total - (identical + minorChanges + relatedMeaning + omittedWords) },
				];
			});
		this.layoutService.isMobile$.pipe(untilDestroy(this)).subscribe(value => (this.isMobile = value));
	}
	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}