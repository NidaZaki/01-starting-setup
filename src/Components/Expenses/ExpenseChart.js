import { Bar } from "react-chartjs-2";

export const ExpenseChart = (props) => {

  if(props.chartData.datasets[0].data.every(item => item === 0)){
    return <p className = "expenses-list__fallback chart-fallback"> There is no data to show.</p>
}

  return (
    <div>
      <Bar
        data={props.chartData}
        options={{
          plugins: {
            legend: {
              display: true
            }
          },
            scales: {
              x: {
                grid: {
                  display:false
                }
              },
              y: {
                border:{
                  display: false
                },
                grid: {
                  display:false
                }
              }
            }
        }}
      />
    </div>
  );
};