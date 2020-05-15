import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/** Routes for router module */
const routes: Routes = [
	{
		path: 'demo',
		loadChildren: () => import(`./pages/report/report.module`).then(mod => mod.ReportModule),
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'demo/default',
	},
];

@NgModule({
	declarations: [],
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class RoutingModule { }
