import { Component, OnInit } from '@angular/core';
import { SVG } from '../../assets/images';
import { CopyleaksTranslateService, CopyleaksTranslations } from '../../services/copyleaks-translate.service';

@Component({
	selector: 'cr-powered-by',
	templateUrl: './powered-by.component.html',
	styleUrls: ['./powered-by.component.scss'],
})
export class PoweredByComponent implements OnInit {
	readonly logo = SVG.LOGO;
	translations: CopyleaksTranslations;
	constructor(private translationsService: CopyleaksTranslateService) { }
	/**
  * init translations on component init.
  */
	ngOnInit() {
		this.translations = this.translationsService.translations;
	}
}
