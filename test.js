/**
 * @Author: lizhi (lizhi@huoban.com)
 * @Date:   2021-03-15 10:30:26
 */
import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Chart from 'src/Component/Chart'
import {getSeriesLabelByRangeMode, labelFormatterRangeMode} from './Helper'

import {TYPES} from 'src/Constant/Chart'

import {
  getLegend,
  getColors,
  getMarkLine,
  getAxisPointerLabelFormatter,
  setSelectStyle,
} from 'src/Helper/Dashboard/Chart'

const CHART_TYPE_BORDER_RADIUS = [
  [4, 4, 0, 0], // 柱状图圆角-正值
  [0, 0, 4, 4], // 柱状图圆角-负值
  [0, 4, 4, 0], // 条图圆角-正值
  [4, 0, 0, 4], // 条图圆角-负值
]

function getBorderRadius(chartType, val) {
  if (chartType === 'bar_y') {
    if (val >= 0) {
      return CHART_TYPE_BORDER_RADIUS[2]
    }
    return CHART_TYPE_BORDER_RADIUS[3]
  } else {
    if (val >= 0) {
      return CHART_TYPE_BORDER_RADIUS[0]
    }
    return CHART_TYPE_BORDER_RADIUS[1]
  }
}

class BarChart extends React.PureComponent {
  static propTypes = {
    widget: PropTypes.object.isRequired,
    widgetValue: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    isSelect: PropTypes.bool,
    isLinkaged: PropTypes.bool,
    onLegendselectchanged: PropTypes.func,
    legendSelected: PropTypes.object,
    scrollDataIndex: PropTypes.number,
    isDrillPopoverVisible: PropTypes.bool,
  }

  static defaultProps = {
    scrollDataIndex: 0,
  }

  getMarkPoint(widgetStyle, seriesIndex, fieldKey) {
    const {widget} = this.props
    const markPointConfig = widgetStyle?.values_title || {}
    const {line_color: lineColor, colorSeries} = widgetStyle
    let data = []

    switch (markPointConfig.title) {
      case 'max':
      case 'min':
        data = [{type: markPointConfig.title, name: markPointConfig.title}]
        break
      case 'and':
        data = [
          {type: 'max', name: 'max'},
          {type: 'min', name: 'min'},
        ]
        break
      default:
    }

    let bgColor = '#5EAA7D'
    if (lineColor) {
      bgColor = lineColor[seriesIndex]?.color || '#5EAA7D'
    } else if (colorSeries) {
      bgColor = colorSeries[seriesIndex] || '#5EAA7D'
    }

    let markPoint = {
      data,
      label: {
        offset: [0, 8],
        color: 'rgba(255, 255, 255, 0.85)',
        backgroundColor: bgColor,
        padding: [2, 4, 2, 4],
        borderRadius: 3,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: 500,
        formatter: labelFormatterRangeMode(widget, fieldKey),
      },
      itemStyle: {
        color: 'transparent',
      },
    }

    if (this.props.widget.options[0].chart_type === TYPES.BAR_Y) {
      markPoint.label.position = 'insideLeft'
      markPoint.label.offset = [16, 20]
    }
    return markPoint
  }

  getAxisOption() {
    const {widget, widgetValue} = this.props
    const chartType = widget.options[0].chart_type
    const widgetStyle = widget.options[0].style
    const xAxisIsShow = widgetStyle?.x_axis?.is_show !== undefined ? widgetStyle?.x_axis?.is_show : true
    const yAxisIsShow = widgetStyle?.y_axis?.is_show !== undefined ? widgetStyle?.y_axis?.is_show : true
    let xAxis = {
      nameGap: 28,
      nameLocation: 'center',
      nameTextStyle: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: 12,
        lineHeight: 16,
      },
      axisLine: {
        show: chartType === 'bar_y' ? false : xAxisIsShow,
        lineStyle: {},
      },
      axisTick: {
        show: chartType === 'bar_y' ? false : xAxisIsShow,
        alignWithLabel: true,
        length: 4,
        lineStyle: {},
      },
      axisLabel: {
        margin: 8,
        fontSize: 12,
        lineHeight: 16,
      },
      axisPointer: {
        type: 'line',
        label: {
          margin: 6,
        },
        shadowStyle: {},
      },
      splitLine: {
        show: xAxisIsShow,
        lineStyle: {
          color: ['rgba(0,0,0,0.05)'],
        },
      },
      min: !_.isEmpty(widgetStyle?.x_axis?.min) ? widgetStyle?.x_axis?.min : undefined,
      max: !_.isEmpty(widgetStyle?.x_axis?.max) ? widgetStyle?.x_axis?.max : undefined,
    }
    let yAxis = {
      nameTextStyle: {
        align: 'left',
      },
      axisLabel: {
        margin: 12,
        fontSize: 12,
        lineHeight: 16,
      },
      splitLine: {
        show: yAxisIsShow,
        lineStyle: {
          color: ['rgba(0,0,0,0.05)'],
        },
      },
      axisPointer: {
        type: '',
        label: {
          margin: 7,
        },
        shadowStyle: {},
      },
      axisTick: {
        show: widgetStyle?.y_axis?.show_title ? widgetStyle?.y_axis?.show_title : false,
        alignWithLabel: true,
      },
      axisLine: {
        show: widgetStyle?.y_axis?.show_title ? widgetStyle?.y_axis?.show_title : false,
      },
      min: !_.isEmpty(widgetStyle?.y_axis?.min) ? widgetStyle?.y_axis?.min : undefined,
      max: !_.isEmpty(widgetStyle?.y_axis?.max) ? widgetStyle?.y_axis?.max : undefined,
    }

    let valueAxis = null

    switch (widget.options[0].chart_type) {
      case TYPES.BAR:
        xAxis = {
          ...xAxis,
          type: 'category',
          data: _.map(widgetValue?.xAxis?.data, data => {
            if (_.isEmpty(data?.value)) {
              return ' '
            } else {
              return data?.value
            }
          }),
        }
        yAxis = {
          ...yAxis,
          type: 'value',
        }
        valueAxis = yAxis
        break
      case TYPES.BAR_Y:
        xAxis = {
          ...xAxis,
          type: 'value',
        }
        yAxis = {
          ...yAxis,
          type: 'category',
          data: _.map(widgetValue?.yAxis?.data, data => {
            if (_.isEmpty(data?.value)) {
              return ' '
            } else {
              return data?.value
            }
          }),
        }
        valueAxis = xAxis
        break
      default:
        break
    }
    valueAxis.axisPointer.label.formatter = getAxisPointerLabelFormatter(widgetStyle)
    if (widgetStyle && widgetStyle.graph.type === 'percent') {
      valueAxis.max = 100
      valueAxis.axisLabel.formatter = '{value}%'
    }
    if (widgetStyle) {
      if (!widgetStyle.x_axis.is_show) {
        xAxis.show = false
      }
      if (widgetStyle.x_axis.show_title) {
        xAxis.name = widgetValue.xAxis.name
      }
      if (!widgetStyle.y_axis.is_show) {
        yAxis.show = false
      }
      if (widgetStyle.y_axis.show_title) {
        yAxis.name = widgetValue.yAxis.name
      }
      if (widgetStyle.y_axis.max) {
        yAxis.max = widgetStyle.y_axis.max
      }
      if (widgetStyle.y_axis.min) {
        yAxis.min = widgetStyle.y_axis.min
      }
    }
    return {xAxis, yAxis}
  }

  getSeries() {
    const {widget, widgetValue} = this.props
    const {series} = widgetValue
    const widgetStyle = widget.options[0].style
    const chartType = widget.options[0].chart_type
    // 判断堆积
    let isStack = false
    if (widgetStyle) {
      if (widgetStyle.graph.type === 'stack' || widgetStyle.graph.type === 'percent') {
        isStack = true
      }
    }

    return _.map(series, (signleSeries, seriesIndex) => {
      const {field_key: fieldKey, data, name} = signleSeries

      let isLast = false
      if (series.length - 1 === seriesIndex) {
        isLast = true
      }

      let seriesOption = {
        name,
        type: 'bar',
        data: data.map(item => {
          return {
            value: item,
            itemStyle:
              isLast || !isStack
                ? {
                    borderRadius: getBorderRadius(chartType, item),
                  }
                : null,
          }
        }),
        smooth: true,
        symbol: 'emptyCircle',
        symbolSize: 6,
        label: {
          show: false,
          fontSize: 12,
          lineHeight: 16,
          position: 'top',
          offset: [0, -4],
        },
        emphasis: {
          lineStyle: {
            width: 2,
          },
        },
      }

      if (widgetStyle) {
        seriesOption.stack = isStack ? 'hb' : ''
        if (widgetStyle.values_title.is_show) {
          if (widgetStyle.values_title.title !== 'all') {
            seriesOption.markPoint = this.getMarkPoint(widgetStyle, seriesIndex, fieldKey)
          } else {
            seriesOption.label = getSeriesLabelByRangeMode(widget, fieldKey)
            seriesOption.label.color = '#fff'
            if (!/inside/.test(seriesOption.label.position)) {
              seriesOption.label.color = widgetStyle.line_color[seriesIndex]?.color
            }
          }
        }
      }

      const widgetMarkLines = widget.options[0].analyze?.markline

      if (!_.isEmpty(widgetMarkLines)) {
        const currentSeriesMarkLines = _.reduce(
          widgetMarkLines,
          (res, markLine) => {
            const statValueArr = _.split(markLine.stat_value, '-')
            return statValueArr[statValueArr.length - 1] === fieldKey ? _.concat(res, markLine) : res
          },
          [],
        )
        if (!_.isEmpty(currentSeriesMarkLines)) {
          seriesOption.markLine = getMarkLine(currentSeriesMarkLines, widget, signleSeries)
        }
      }
      return seriesOption
    })
  }

  getOption() {
    const {widget, widgetValue, legendSelected, scrollDataIndex, isDrillPopoverVisible, linkageSeriesData} = this.props
    const {xAxis, yAxis} = this.getAxisOption()

    const legend = getLegend(widget, widgetValue)
    legend.selected = legendSelected
    legend.scrollDataIndex = scrollDataIndex

    const option = {
      color: getColors(widget, widgetValue),
      legend,
      xAxis,
      yAxis,
      series: this.getSeries(),
      tooltip: {
        show: !isDrillPopoverVisible,
        position: point => {
          return [point[0], point[1]]
        },
      },
    }

    setSelectStyle(option, this.props.isSelect, null, linkageSeriesData)

    return option
  }

  render() {
    // console.log('option', this.getOption())
    return (
      <Chart
        option={this.getOption()}
        onChartReady={this.props.onChartReady}
        onClick={this.props.onClick}
        onLegendselectchanged={this.props.onLegendselectchanged}
        onLegendscroll={this.props.onLegendscroll}
      />
    )
  }
}

export default BarChart
