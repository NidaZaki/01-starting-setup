import { Doughnut } from 'react-chartjs-2';

export const ExpenseDonutChart = (props) => {
    
    return (
          <div>
        <div className='chart-category-selected'>{props.category}
        <Doughnut
          data={props.donutChartData}
          options={{
            plugins:{
                legend:{
                    display:true,
                    position:'right'
                },
                title: {
                    display: true,
                    text: "Expenses By Each Category"
                }
            }
          }}
        />
        </div>
        </div>
      

    );
  };