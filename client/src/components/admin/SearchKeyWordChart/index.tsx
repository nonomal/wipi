import React, { useState, useCallback, useEffect } from "react";
import echarts from "echarts";
import ReactEcharts from "echarts-for-react";
import { SearchProvider } from "@/providers/search";

export const SearchKeyWordChart = () => {
  const [data, setData] = useState<ISearch[]>([]);
  const [loading, setLoaidng] = useState(false);

  // 获取
  const getData = useCallback(() => {
    if (loading) {
      return;
    }

    setLoaidng(true);
    SearchProvider.getRecords({ page: 1, pageSize: 500 })
      .then(res => {
        setData(res[0].reverse());
        setLoaidng(false);
      })
      .catch(() => setLoaidng(false));
  }, []);

  useEffect(() => {
    getData();
  }, []);

  const dataX = data.map(d => d.keyword);
  const dataY = data.map(d => d.count);
  const yMax = Math.max.apply(null, dataY);
  const option = {
    tooltip: {},
    color: ["#3398DB"],
    grid: {
      top: "3%",
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    dataZoom: [
      {
        type: "inside"
        // start: 0,
        // end: data.length
      },
      {
        // start: 0,
        // end: data.length,
        handleIcon:
          "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
        handleSize: "80%",
        handleStyle: {
          color: "#fff",
          shadowBlur: 3,
          shadowColor: "rgba(0, 0, 0, 0.6)",
          shadowOffsetX: 2,
          shadowOffsetY: 2
        }
      }
    ],
    xAxis: {
      type: "category",
      data: dataX,
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        type: "bar",
        itemStyle: {
          color: "rgba(0,0,0,0.05)"
        },
        barGap: "-100%",
        barCategoryGap: "40%",
        data: dataY.map(() => yMax),
        animation: false,
        tooltip: { trigger: "none" }
      },
      {
        type: "bar",
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#83bff6" },
            { offset: 0.5, color: "#188df0" },
            { offset: 1, color: "#188df0" }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#2378f7" },
              { offset: 0.7, color: "#2378f7" },
              { offset: 1, color: "#83bff6" }
            ])
          }
        },
        data: dataY
      }
    ]
  };

  return (
    <ReactEcharts
      option={option}
      onEvents={{
        click: (params, chart) => {
          let zoomSize = 6;
          chart.dispatchAction({
            type: "dataZoom",
            startValue: dataX[Math.max(params.dataIndex - zoomSize / 2, 0)],
            endValue:
              dataX[Math.min(params.dataIndex + zoomSize / 2, data.length - 1)]
          });
        }
      }}
    />
  );
};
