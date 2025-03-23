import {
  Button,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
} from "@heroui/react";
import {
  DistanceUnitDropdown,
  MeasurementUnitDropdown,
  PaceUnitDropdown,
  WeightUnitDropdown,
} from "../components";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Area,
  Line,
  ReferenceArea,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { useChartColorLists, useChartDateMap } from "../hooks";
import {
  AnalyticsChartListModalPage,
  ChartComment,
  ChartDataCategory,
  ChartDataItem,
  ChartDataUnitCategory,
  ChartReferenceAreaItem,
  UseDisclosureReturnType,
  UserSettings,
} from "../typings";
import { FormatDateToShortString } from "../helpers";

type AnalyticsChartProps = {
  chartConfig: ChartConfig;
  filteredChartData: ChartDataItem[];
  chartStartDate: Date | null;
  chartEndDate: Date | null;
  chartDataAreas: ChartDataCategory[];
  shownChartDataAreas: ChartDataCategory[];
  chartDataLines: ChartDataCategory[];
  shownChartDataLines: ChartDataCategory[];
  primaryDataKey: ChartDataCategory;
  secondaryDataKey: ChartDataCategory;
  chartLineUnitCategorySet: Set<ChartDataUnitCategory>;
  secondaryDataUnitCategory: ChartDataUnitCategory;
  chartDataUnitMap: Map<ChartDataCategory, string>;
  allChartDataCategories: Set<ChartDataCategory>;
  referenceAreas: ChartReferenceAreaItem[];
  shownReferenceAreas: ChartReferenceAreaItem[];
  shownTimePeriodIdSet: Set<string>;
  filterMinDate: Date | null;
  filterMaxDate: Date | null;
  chartCommentMap: Map<string, ChartComment[]>;
  includesMultisetMap: Map<string, Set<ChartDataCategory>>;
  userSettings: UserSettings;
  weightUnit: string;
  distanceUnit: string;
  paceUnit: string;
  weightCharts: Set<Exclude<ChartDataCategory, undefined>>;
  distanceCharts: Set<Exclude<ChartDataCategory, undefined>>;
  paceCharts: Set<Exclude<ChartDataCategory, undefined>>;
  deleteModal: UseDisclosureReturnType;
  filterMinAndMaxDatesModal: UseDisclosureReturnType;
  updateShownChartLines: (chartLines: ChartDataCategory[]) => void;
  updateLeftYAxis: (chartAreas: ChartDataCategory[]) => void;
  updateRightYAxis: (
    chartLines: ChartDataCategory[],
    activeUnitCategory: ChartDataUnitCategory
  ) => void;
  updateShownReferenceAreas: (timePeriodIds: Set<string>) => void;
  formatXAxisDate: (date: string) => string;
  changeChartDataAreaToLine: (chartDataArea: ChartDataCategory) => void;
  changeChartDataLineToArea: (chartDataLine: ChartDataCategory) => void;
  updateMinDateFilter: (minDate: Date | null) => void;
  updateMaxDateFilter: (maxDate: Date | null) => void;
  removeChartStat: (dataKey: ChartDataCategory) => void;
  handleChangeUnit: (
    newUnit: string,
    unitCategory: "Weight" | "Distance" | "Pace" | "Circumference"
  ) => void;
  changeChartDataLineCategoryToArea: (
    unitCategory: ChartDataUnitCategory
  ) => void;
  handleOpenTimePeriodListModal:
    | ((modalListType: AnalyticsChartListModalPage) => Promise<void>)
    | (() => Promise<void>);
  circumferenceUnit?: string;
  circumferenceCharts?: Set<Exclude<ChartDataCategory, undefined>>;
};

export const AnalyticsChart = ({
  chartConfig,
  filteredChartData,
  chartStartDate,
  chartEndDate,
  chartDataAreas,
  shownChartDataAreas,
  chartDataLines,
  shownChartDataLines,
  primaryDataKey,
  secondaryDataKey,
  chartLineUnitCategorySet,
  secondaryDataUnitCategory,
  chartDataUnitMap,
  allChartDataCategories,
  referenceAreas,
  shownReferenceAreas,
  shownTimePeriodIdSet,
  filterMinDate,
  filterMaxDate,
  chartCommentMap,
  includesMultisetMap,
  userSettings,
  weightUnit,
  distanceUnit,
  paceUnit,
  weightCharts,
  distanceCharts,
  paceCharts,
  deleteModal,
  filterMinAndMaxDatesModal,
  updateShownChartLines,
  updateLeftYAxis,
  updateRightYAxis,
  updateShownReferenceAreas,
  formatXAxisDate,
  changeChartDataAreaToLine,
  changeChartDataLineToArea,
  updateMinDateFilter,
  updateMaxDateFilter,
  removeChartStat,
  handleChangeUnit,
  changeChartDataLineCategoryToArea,
  handleOpenTimePeriodListModal,
  circumferenceUnit,
  circumferenceCharts,
}: AnalyticsChartProps) => {
  const dateMap = useChartDateMap();

  const { chartLineColorList, chartAreaColorList, referenceAreaColorList } =
    useChartColorLists();

  return (
    <div className="flex gap-1.5 mx-1.5">
      <div className="flex flex-col gap-1 w-[12.25rem]">
        <Select
          label="Shown Areas"
          size="sm"
          variant="faded"
          selectionMode="multiple"
          selectedKeys={shownChartDataAreas as string[]}
          isDisabled={chartDataAreas.length < 2}
          onSelectionChange={(value) =>
            updateLeftYAxis(Array.from(value) as ChartDataCategory[])
          }
          disallowEmptySelection
        >
          {chartDataAreas.map((area) => (
            <SelectItem key={area} value={area}>
              {chartConfig[area ?? "default"].label}
            </SelectItem>
          ))}
        </Select>
        <Select
          label="Shown Lines"
          size="sm"
          variant="faded"
          selectionMode="multiple"
          selectedKeys={shownChartDataLines as string[]}
          onSelectionChange={(value) =>
            updateShownChartLines(Array.from(value) as ChartDataCategory[])
          }
          isDisabled={chartDataLines.length === 0}
        >
          {chartDataLines.map((line) => (
            <SelectItem key={line} value={line}>
              {chartConfig[line ?? "default"].label}
            </SelectItem>
          ))}
        </Select>
        <Select
          label="Right Y-Axis Value"
          size="sm"
          variant="faded"
          selectedKeys={
            secondaryDataUnitCategory !== undefined
              ? [secondaryDataUnitCategory]
              : []
          }
          onChange={(e) =>
            updateRightYAxis(
              shownChartDataLines,
              e.target.value as ChartDataUnitCategory
            )
          }
          disallowEmptySelection
          isDisabled={chartLineUnitCategorySet.size < 2}
        >
          {Array.from(chartLineUnitCategorySet).map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </Select>
        <Select
          label="Shown Time Periods"
          size="sm"
          variant="faded"
          selectionMode="multiple"
          selectedKeys={shownTimePeriodIdSet}
          onSelectionChange={(keys) =>
            updateShownReferenceAreas(new Set(keys) as Set<string>)
          }
          isDisabled={referenceAreas.length === 0}
        >
          {referenceAreas.map((area) => (
            <SelectItem
              key={area.timePeriodId.toString()}
              value={area.timePeriodId.toString()}
            >
              {area.label}
            </SelectItem>
          ))}
        </Select>
        <Button
          className="font-medium"
          variant="flat"
          onPress={() => handleOpenTimePeriodListModal("time-period-list")}
        >
          Load Time Period
        </Button>
        <Button
          className="font-medium"
          variant="flat"
          color="danger"
          onPress={() => deleteModal.onOpen()}
        >
          Reset Chart
        </Button>
      </div>
      <ChartContainer
        config={chartConfig}
        className="grow bg-default-50 pt-4 pb-1.5 rounded-xl"
      >
        <ComposedChart
          data={filteredChartData}
          margin={{ top: 15, right: 5, left: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => formatXAxisDate(date)}
          />
          <YAxis
            yAxisId={primaryDataKey}
            unit={chartDataUnitMap.get(primaryDataKey)}
          />
          <YAxis
            dataKey={secondaryDataKey}
            unit={chartDataUnitMap.get(secondaryDataKey)}
            orientation="right"
          />
          <ChartTooltip
            isAnimationActive={false}
            content={
              <ChartTooltipContent
                chartDataUnitMap={chartDataUnitMap}
                chartCommentMap={chartCommentMap}
                chartIncludesMultisetMap={includesMultisetMap}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {shownChartDataAreas.map((item, index) => (
            <Area
              key={item}
              isAnimationActive={false}
              yAxisId={primaryDataKey}
              dataKey={item ?? ""}
              stroke={chartAreaColorList[index % chartAreaColorList.length]}
              fill={chartAreaColorList[index % chartAreaColorList.length]}
              activeDot={{ r: 6 }}
              connectNulls
              dot
            />
          ))}
          {shownReferenceAreas.map((area, index) => (
            <ReferenceArea
              key={area.timePeriodId}
              x1={area.x1}
              x2={area.x2}
              label={{ position: "top", value: area.label }}
              opacity={0.2}
              fill={
                referenceAreaColorList[index % referenceAreaColorList.length]
              }
              stroke={
                referenceAreaColorList[index % referenceAreaColorList.length]
              }
            />
          ))}
          {shownChartDataLines.map((item, index) => (
            <Line
              key={item}
              isAnimationActive={false}
              dataKey={item}
              stroke={chartLineColorList[index % chartLineColorList.length]}
              strokeWidth={2}
              activeDot={{ r: 6 }}
              connectNulls
            />
          ))}
        </ComposedChart>
      </ChartContainer>
      <div className="flex flex-col gap-0.5 w-[12.25rem]">
        <div className="flex flex-col gap-1">
          <Dropdown>
            <DropdownTrigger>
              <Button
                className="font-medium"
                variant="flat"
                isDisabled={chartDataAreas.length === 0}
              >
                Convert Area To Line
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Chart data areas" variant="flat">
              {chartDataAreas.map((area) => (
                <DropdownItem
                  key={area as string}
                  onPress={() => changeChartDataAreaToLine(area)}
                >
                  {chartConfig[area ?? "default"].label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger>
              <Button
                className="font-medium"
                variant="flat"
                isDisabled={chartDataLines.length === 0}
              >
                Convert Line To Area
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Chart data lines" variant="flat">
              {chartDataLines.map((line) => (
                <DropdownItem
                  key={line as string}
                  onPress={() => changeChartDataLineToArea(line)}
                >
                  {chartConfig[line ?? "default"].label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger>
              <Button
                className="font-medium"
                variant="flat"
                isDisabled={chartLineUnitCategorySet.size === 0}
              >
                Change Area Category
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Chart data line unit categories"
              variant="flat"
            >
              {Array.from(chartLineUnitCategorySet).map((category) => (
                <DropdownItem
                  key={category as string}
                  onPress={() => changeChartDataLineCategoryToArea(category)}
                >
                  {category}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger>
              <Button
                className="font-medium"
                variant="flat"
                color={filterMinDate || filterMaxDate ? "secondary" : "default"}
              >
                Filter Dates
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Filter dates option menu" variant="flat">
              <>
                {/* Only show the options that can meaningfully filter the Chart */}
                {Array.from(dateMap).map(
                  ([label, date]) =>
                    date > chartStartDate! &&
                    date < chartEndDate! && (
                      <DropdownItem
                        key={label}
                        onPress={() => updateMinDateFilter(date)}
                      >
                        {label}
                      </DropdownItem>
                    )
                )}
                <DropdownItem
                  key="Custom"
                  onPress={() => filterMinAndMaxDatesModal.onOpen()}
                >
                  Custom
                </DropdownItem>
              </>
            </DropdownMenu>
          </Dropdown>
          {filterMinDate !== null && (
            <Chip
              classNames={{ content: "w-[10.625rem]" }}
              radius="sm"
              color="secondary"
              variant="flat"
              onClose={() => updateMinDateFilter(null)}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="font-semibold">Min Date: </span>
              {FormatDateToShortString(filterMinDate, userSettings.locale)}
            </Chip>
          )}
          {filterMaxDate !== null && (
            <Chip
              classNames={{ content: "w-[10.625rem]" }}
              radius="sm"
              color="secondary"
              variant="flat"
              onClose={() => updateMaxDateFilter(null)}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="font-semibold">Max Date: </span>
              {FormatDateToShortString(filterMaxDate, userSettings.locale)}
            </Chip>
          )}
          <Dropdown>
            <DropdownTrigger>
              <Button
                className="font-medium"
                variant="flat"
                color="danger"
                isDisabled={allChartDataCategories.size < 2}
              >
                Remove Chart Stat
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Chart data lines" variant="flat">
              {Array.from(allChartDataCategories).map((dataKey) => (
                <DropdownItem
                  key={dataKey as string}
                  onPress={() => removeChartStat(dataKey)}
                >
                  {chartConfig[dataKey ?? "default"].label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="flex flex-col gap-0.5 px-px">
          {weightCharts.size > 0 && (
            <WeightUnitDropdown
              value={weightUnit}
              targetType="chart"
              changeUnitInChart={handleChangeUnit}
              customLabel="Weight Unit"
              customWidthString="w-[5rem]"
              isSmall
            />
          )}
          {distanceCharts.size > 0 && (
            <DistanceUnitDropdown
              value={distanceUnit}
              targetType="chart"
              changeUnitInChart={handleChangeUnit}
              customLabel="Distance Unit"
              customWidthString="w-[5.5rem]"
              isSmall
            />
          )}
          {paceCharts.size > 0 && (
            <PaceUnitDropdown
              value={paceUnit}
              targetType="chart"
              changeUnitInChart={handleChangeUnit}
            />
          )}
          {circumferenceUnit !== undefined &&
            circumferenceCharts !== undefined &&
            circumferenceCharts.size > 0 && (
              <MeasurementUnitDropdown
                value={circumferenceUnit}
                targetType="chart"
                changeUnitInChart={handleChangeUnit}
                customWidthString="w-[7.5rem]"
                customLabel="Circumference Unit"
              />
            )}
        </div>
      </div>
    </div>
  );
};
