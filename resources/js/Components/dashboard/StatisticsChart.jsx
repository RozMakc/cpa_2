import Chart from "react-apexcharts";
import { useState, useEffect } from "react";
import { usePage } from '@inertiajs/react';

export default function StatisticsChart() {
  const { props } = usePage();
  const [chartData, setChartData] = useState({
    clicks: Array(30).fill(0),
    conversions: Array(30).fill(0),
    dates: Array(30).fill('')
  });

  // Генерация дат для последних 30 дней
  const generateDates = () => {
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }));
    }
    return dates;
  };

  useEffect(() => {
    if (props.chartData) {
      setChartData(props.chartData);
    } else {
      // Fallback данные если с бэкенда ничего не пришло
      setChartData({
        clicks: Array(30).fill(0).map(() => Math.floor(Math.random() * 100) + 50),
        conversions: Array(30).fill(0).map(() => Math.floor(Math.random() * 30) + 10),
        dates: generateDates()
      });
    }
  }, [props.chartData]);

  const options = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#10B981"], // Синий для кликов, зеленый для конверсий
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      x: {
        format: "dd MMM",
      },
    },
    xaxis: {
      type: "category",
      categories: chartData.dates,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      labels: {
        style: {
          fontSize: "10px",
        },
        rotate: -45,
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
      title: {
        text: "",
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  const series = [
    {
      name: "Переходы",
      data: chartData.clicks,
    },
    {
      name: "Заказы",
      data: chartData.conversions,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Статистика за 30 дней
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Переходы и конверсии по дням
          </p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}