import { ElementRef, HostBinding, HostListener, Renderer2 } from '@angular/core';
import { Match, MatchSelectEvent, MatchType, PostMessageEvent, ConversationSelectEvent, ExcludeReason } from '../../models';
import { EXCLUDE_MESSAGE } from '../../utils/constants';
import iframeStyle from './iframe-styles';

export abstract class HtmlHelperBase {
	/** the original html */
	protected html: string;
	/** string representation of the external css that will be inserted to the frame */
	protected style: string;
	/** string representation of the extrnal js that will be inserted to the frmae */
	protected script: string;
	/** the matches to process */
	protected matches: Match[];
	/** sets the seamsless attribute to the iframe */
	@HostBinding('attr.seamless') readonly seamless = true;
	/** sets the sandbox attribute to the iframe */
	@HostBinding('attr.sandbox') readonly sandbox = 'allow-scripts';

	constructor(protected renderer: Renderer2, protected element: ElementRef<HTMLIFrameElement>) {
		const css = renderer.createElement('style') as HTMLStyleElement;
		css.textContent = iframeStyle;
		this.style = css.outerHTML;
	}
	/**
	 * Handles the `match-select` event
	 * @param event the event object containing the match `index`
	 */
	abstract handleMatchSelect(event: MatchSelectEvent): void;

	/**
	 * Handles PostMessage events, making sure its from the correct iframe.
	 * @param event the default PostMessage event
	 */
	@HostListener('window:message', ['$event'])
	onFrameMessage(event) {
		const { source, data } = event;
		if (source !== this.frame) {
			return;
		}
		const pmevent = data as PostMessageEvent;
		switch (pmevent.type) {
			case 'match-select':
				this.handleMatchSelect(pmevent);
				break;
			case 'match-warn':
				console.warn('match not found');
				break;
			case 'conversation-select':
				this.handleConversationSelectEvent(pmevent);
				break;
			default:
				console.error('unknown event', pmevent);
		}
	}

	protected get frame() {
		return this.element.nativeElement.contentWindow;
	}

	/**
	 * Send a message to the iframe using PostMessage API
	 * @param data the data to post
	 */
	protected messageFrame(data: any) {
		this.frame && this.frame.postMessage(data, '*');
	}

	/**
	 * Set the iframe srcdoc html to the given html string
	 * @param html the html string
	 */
	protected setHtml(html: string) {
		this.renderer.setAttribute(this.element.nativeElement, 'srcdoc', html + this.style + this.script);
	}

	/**
	 * highlight a single match in the iframe
	 * @param index the index of the match to mark
	 */
	protected markSingleMatchInFrame(index: number) {
		this.messageFrame({ type: 'match-select', index } as MatchSelectEvent);
	}

	/**
	 * Render list of matches in the iframe's HTML
	 * @param matches the matches to render
	 */
	protected renderMatches(matches: Match[]) {
		this.matches = matches;
		const html = matches.reduceRight((prev: string, curr: Match, i: number) => {
			let slice = this.html.substring(curr.start, curr.end);
			switch (curr.type) {
				case MatchType.conversation:
					slice = `<span copyleaks-extra="" class="pin" data-index="${i}" id="${curr.gid}"></span>`;
					break;
				case MatchType.excluded:
					slice = `<span copyleaks-extra="" exclude="" title="${EXCLUDE_MESSAGE[curr.reason]}" class="">${slice}</span>`;
					break;
				case MatchType.none:
					break;
				default:
					slice = `<span copyleaks-extra="" match="" data-type="${curr.type}" data-index="${i}" data-gid="${curr.gid}" class="">${slice}</span>`;
					break;
			}
			return slice.concat(prev);
		}, '');
		this.renderer.setAttribute(this.element.nativeElement, 'srcdoc', html + this.style + this.script);
	}

	// tslint:disable-next-line: completed-docs
	private handleConversationSelectEvent(event: ConversationSelectEvent) {
		const htmlTagLength = `<html>`.length + 1;
		const latestHtml = event.html.trim();

		// tslint:disable-next-line: prefer-const (regexp match is chaning this property, and if it in const it will cos to infinite while loop)
		let beforePointHTML = latestHtml.slice(0, event.start);

		console.log(latestHtml.slice(0, event.start));

		const copyleaksExtraRegexp = /<span[^>]+?copyleaks-extra.*?>([\s\S]*?)<\/span>/g;
		let match = copyleaksExtraRegexp.exec(beforePointHTML);
		const execludedMatches = [];
		while (match != null) {
			const spanMatch = match[0];
			const template = document.createElement('template');
			template.innerHTML = spanMatch.trim();
			const spanElement = template.content.firstChild as HTMLSpanElement;
			execludedMatches.push({
				matchIndex: +spanElement.getAttribute('data-index'),
				match: match[0],
				content: match[1]
			});
			match = copyleaksExtraRegexp.exec(beforePointHTML);
		}

		console.log(execludedMatches);

		console.log(event.start);
		console.log(`${execludedMatches.map(s => s.match).join('')} (${execludedMatches.map(s => s.match).join('').length})`);
		console.log(`${execludedMatches.map(s => s.content).join('')} (${execludedMatches.map(s => s.content).join('').length})`);
		event.start = event.start - (execludedMatches.map(s => s.match).join('').length) + (execludedMatches.map(s => s.content).join('').length);
		console.log(event.start);

		console.log(this.html.trim().slice(0, event.start + 1));

		let matches = this.matches.slice();
		matches.push({
			start: event.start,
			end: event.start,
			type: MatchType.conversation,
			gid: +event.id
		})
		matches = matches.sort((a, b) => a.start - b.start);
		// this.renderMatches(matches);
	}
}
