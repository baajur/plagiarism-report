import {
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	Renderer2,
	SimpleChanges,
} from '@angular/core';
import { version } from '../report-version.json';
import { untilDestroy } from '../shared/operators/untilDestroy';
import { CopyleaksReportConfig, ViewMode } from './models/CopyleaksReportConfig';
import { CopyleaksService } from './services/copyleaks.service';
import { HighlightService } from './services/highlight.service';
import { MatchService } from './services/match.service';
import { ReportService } from './services/report.service';
import { StatisticsService } from './services/statistics.service';
@Component({
	selector: 'cr-copyleaks-report',
	templateUrl: 'copyleaks-report.component.html',
	styleUrls: ['./copyleaks-report.component.scss'],
	animations: [],
	providers: [ReportService, StatisticsService, MatchService, HighlightService],
})
export class CopyleaksReportComponent implements OnInit, OnDestroy, OnChanges {
	@HostBinding('class.mat-typography')
	public readonly typography = true;

	@HostBinding('class.one-to-one') get isOneToOne() {
		return this.viewMode === 'one-to-one';
	}

	@HostBinding('class.one-to-many') get isOneToMany() {
		return this.viewMode === 'one-to-many';
	}

	@Input()
	public config: CopyleaksReportConfig;
	@Output()
	public configChange = new EventEmitter<CopyleaksReportConfig>();
	@Output()
	public help = new EventEmitter<MouseEvent>();
	@Output()
	public share = new EventEmitter<MouseEvent>();
	@Output()
	public download = new EventEmitter<MouseEvent>();

	public viewMode: ViewMode;
	public resultsActive = false;
	public aaa = false;
	public hasResultsOverlay = false;

	constructor(
		private reportService: ReportService,
		private copyleaksService: CopyleaksService,
		el: ElementRef,
		renderer: Renderer2
	) {
		renderer.setAttribute(el.nativeElement, 'plagiarism-report-version', version);
	}

	/**
	 * life-cycle method
	 * Initialize the component view mode
	 */
	ngOnInit() {
		const { viewMode$, helpClick$, shareClick$, downloadClick$, configChange$ } = this.reportService;
		viewMode$.pipe(untilDestroy(this)).subscribe(viewMode => (this.viewMode = viewMode));
		helpClick$.pipe(untilDestroy(this)).subscribe(data => this.help.emit(data));
		shareClick$.pipe(untilDestroy(this)).subscribe(data => this.share.emit(data));
		downloadClick$.pipe(untilDestroy(this)).subscribe(data => this.download.emit(data));
		configChange$.pipe(untilDestroy(this)).subscribe(config => this.configChange.emit(config));
		this.hasResultsOverlay = !!this.config && !!this.config.resultsOverlayComponent;
	}

	/**
	 * Life-cycle method
	 * Handles `changes` for input properties
	 * @param changes the changes
	 */
	ngOnChanges(changes: SimpleChanges) {
		if (changes.config) {
			this.copyleaksService.setConfig({ ...changes.config.currentValue });
			this.hasResultsOverlay = !!changes.config.currentValue && !!changes.config.currentValue.resultsOverlayComponent;
		}
	}

	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}
