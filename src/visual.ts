"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import * as d3 from "d3";

import { VisualSettings } from "./settings";
import { DataPoint } from './types';



function buildDataPoints(data: powerbi.DataViewCategorical): DataPoint[] {
    let datapoints: DataPoint[] = [];

    for (let i = 0; i < data.categories[0].values.length; i++) {
        datapoints.push(<DataPoint>{
            category: data.categories[0].values[i],
            count: data.values[0].values[i]
        })
    }

    return datapoints;
}

export class Visual implements IVisual {
    private settings: VisualSettings;
    private svgRoot: d3.Selection<SVGElement, {}, HTMLElement, any>;


    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.svgRoot = d3
            .select(options.element)
            .append("svg");
    }

    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

        let data = options.dataViews[0].categorical;
        let datapoints = buildDataPoints(data);

        this.svgRoot
            .selectAll("text")
            .remove();

        this.svgRoot
            .selectAll("text")
            .data(datapoints)
            .enter()
            .append("text")
                .attr("x", 0)
                .attr("y", (d,i)=>(1 + i)*20)
                .text(d=>`${d.category} = ${d.count}`);
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}