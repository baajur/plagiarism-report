import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { take } from 'rxjs/operators';
import { ResultsSettings } from '../../models/ResultsSettings';
import { ReportService } from '../../services/report.service';
import { truthy } from '../../utils/operators';
@Component({
	selector: 'cr-results-settings-dialog',
	templateUrl: './results-settings-dialog.component.html',
	styleUrls: ['./results-settings-dialog.component.scss'],
})
export class ResultsSettingsDialogComponent implements OnInit, OnDestroy {
	constructor(private dialogRef: MatDialogRef<ResultsSettingsDialogComponent>, private reportService: ReportService) {}
	public settings: ResultsSettings;
	/**
	 * Closes the dialog while indicating whether to save changes or not.
	 */
	close(save?: boolean) {
		this.dialogRef.close(save);
	}
	/**
	 * Life-cycle method
	 * subscribe to:
	 * - current report settings ( clone it)
	 * - dialog events
	 */
	ngOnInit() {
		this.reportService.settings$.pipe(take(1)).subscribe(settings => (this.settings = { ...settings }));
		this.dialogRef
			.beforeClosed()
			.pipe(truthy())
			.subscribe(() => this.reportService.setSettings(this.settings));
	}
	/**
	 * Life-cycle method
	 * empty for `untilDestroy` rxjs operator
	 */
	ngOnDestroy() {}
}