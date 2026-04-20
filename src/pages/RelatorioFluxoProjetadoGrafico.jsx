 
import ReactECharts from "echarts-for-react";

export default function RelatorioFluxoProjetadpGrafico() {
  const option = {
    xAxis: {
      type: "category",
      data: ["A", "B", "C"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: [10, 20, 30],
        type: "bar",
      },
    ],
  };

  return (
    <div style={{ height: 400 }}>
      <ReactECharts option={option} />
    </div>
  );
}
