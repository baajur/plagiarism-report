import { Component, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { untilDestroy } from '../../../shared/operators/untilDestroy';
import { MatchJumpEvent, MatchSelectEvent, MatchType } from '../../models';
import { HighlightService } from '../../services/highlight.service';
import { MatchService } from '../../services/match.service';
import { ReportService } from '../../services/report.service';
import { truthy } from '../../utils/operators';
import { HtmlHelperBase } from './HtmlHelperBase';
import iframeScript from './one-to-many-iframe-logic';

/**
 * Component to handle manipulating the scan result's html inside an iframe
 */
@Component({
	selector: 'iframe[cr-original-html-helper]',
	template: '',
	styleUrls: ['./html-helper.scss'],
})
export class OriginalHtmlHelperComponent extends HtmlHelperBase implements OnInit, OnDestroy {
	constructor(
		renderer: Renderer2,
		element: ElementRef<HTMLIFrameElement>,
		private reportService: ReportService,
		private highlightService: HighlightService,
		private matchService: MatchService
	) {
		super(renderer, element);
		const js = renderer.createElement('script') as HTMLScriptElement;
		js.textContent = iframeScript;
		this.script = js.outerHTML;
	}

	/**
	 * handle match selection
	 */
	handleMatchSelect(event: MatchSelectEvent) {
		this.highlightService.setOriginalHtmlMatch(event.index !== -1 ? this.matches[event.index] : null);
	}

	/**
	 * Life-cycle method
	 * subscribe to:
	 * - original html matches
	 * - view mode changes
	 * - source ducument
	 * - jump events
	 */
	ngOnInit() {
		const { source$, viewMode$, contentMode$ } = this.reportService;
		const { jump$ } = this.highlightService;
		const { originalHtmlMatches$ } = this.matchService;
		source$
			.pipe(
				truthy(),
				filter(source => !!source.html)
			)
			.subscribe(source => {
				this.html = source.html.value;
				this.setHtml(this.html);
			});
		combineLatest([source$.pipe(truthy()), originalHtmlMatches$])
			.pipe(untilDestroy(this))
			.subscribe(([, matches]) => {
				this.matches = matches;

				// this.matches.push({
				// 	start: 83,
				// 	end: 83,
				// 	gid: 1232132132,
				// 	type: MatchType.conversation
				// })

				// this.matches.push({
				// 	start: 474,
				// 	end: 474,
				// 	gid: 1232132132,
				// 	type: MatchType.conversation
				// })

				// this.matches.push({
				// 	start: 302,
				// 	end: 474,
				// 	gid: 1232132132,
				// 	type: MatchType.conversation
				// })

				this.renderMatches(this.matches.sort((a, b) => a.start - b.start));
			});
		const onOneToManyHtmlJump$ = combineLatest([jump$, viewMode$, contentMode$]).pipe(
			untilDestroy(this),
			filter(([, view, content]) => view === 'one-to-many' && content === 'html'),
			map(([forward]) => forward)
		);
		onOneToManyHtmlJump$.subscribe(forward => this.messageFrame({ type: 'match-jump', forward } as MatchJumpEvent));
	}

	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() { }
}
