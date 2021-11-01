"use strict";

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class VisualSettings extends DataViewObjectsParser {
  public customSettings: CustomSettings = new CustomSettings();
}

export class CustomSettings {
  public barColor: string = "#2867b2";
}

