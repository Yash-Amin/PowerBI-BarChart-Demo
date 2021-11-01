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
    private barContainer: d3.Selection<SVGElement, {}, HTMLElement, any>;


    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);

        this.svgRoot = d3
            .select(options.element)
            .append("svg");

        this.barContainer = this.svgRoot
            .append("g")
            .attr("fill", "royalblue");
    }

    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        let { height, width } = options.viewport;

        let data = options.dataViews[0].categorical;
        let datapoints = buildDataPoints(data);
        const maxYaxisValue = Math.max(...datapoints.map(d => d.count));


        this.svgRoot
            .attr("height", height)
            .attr("width", width);

        const xScaleBand = d3
            .scaleBand()
            .domain(datapoints.map(d => d.category))
            .range([0, width])
            .padding(0.1);

        const yScaleLinear = d3
            .scaleLinear<number>()
            .domain([0, maxYaxisValue])
            .range([height, 0]);

        this.barContainer
            .selectAll("rect")
            .remove();


        this.barContainer
            .attr("fill", "#2867b2")
            .selectAll("rect")
            .data(datapoints.sort((a, b) => d3.descending(a.count, b.count)))
            .enter()
                .append("rect")
                .attr("id", (d) => d.category)
                .attr("x", (d) => xScaleBand(d.category))
                .attr("y", (d, i) => yScaleLinear(d.count))
                .attr("height", (d, i) => yScaleLinear(0) - yScaleLinear(d.count))
                .attr("width", (d, i) => xScaleBand.bandwidth())
                  .append("title")
                  .text(d=>d.category)
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