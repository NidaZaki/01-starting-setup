import { Pie, Doughnut } from 'react-chartjs-2';

export const ExpensePieChart = (props) => {

    if(props.pieChartData.datasets[0].data.every(item => item === 0)){
        return <p className = "expenses-list__fallback chart-fallback"> There is no data to show for this category.</p>
    }

    return (
      <div>
        <div className='chart-category-selected'>{props.category}</div>
        <Pie
          data={props.pieChartData}
          options={{
            plugins:{
                legend:{
                    display:true,
                    position:'right'
                },
                title: {
                    display: props.category ? false : true,
                    text: "Categories"
                }
            }
          }}
        />      

      </div>
    );
  };