import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as React from 'react';

interface IProps {
  
};

export default class TimeLine extends React.Component<IProps>{
    chart: am4charts.XYChart;
    
    constructor(props: any) {
      super(props);
  }
    
    private create() {
        this.chart =  am4core.create("chartdiv", am4charts.XYChart);
        let DateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
        DateAxis.dataFields.date = "x";
        DateAxis.renderer.grid.template.disabled = false;
        DateAxis.renderer.labels.template.disabled = false;
        DateAxis.tooltip.disabled = true;
        DateAxis.periodChangeDateFormats.setKey("hour", "[bold]day[/]"); 

        let TweetAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
        TweetAxis.min = 0;
        TweetAxis.max = 2;
        TweetAxis.strictMinMax = true;
        TweetAxis.renderer.grid.template.disabled = true;
        TweetAxis.renderer.labels.template.disabled = true;
        TweetAxis.renderer.baseGrid.disabled = true;
        TweetAxis.tooltip.disabled = true;
        let series = this.chart.series.push(new am4charts.LineSeries());
        this.chart.dataSource.url = "../../sample/usaelection.json";
        this.chart.dataSource.load();
        series.dataFields.dateX = "1";
        series.dataFields.valueY = "1";
        series.strokeWidth = 3;
        
        let bullet = series.bullets.push(new am4charts.Bullet());
        let image = bullet.createChild(am4core.Image);
        image.propertyFields.href = "img";
        image.width = 110;
        image.height = 110;
        image.horizontalCenter = "middle";
        image.verticalCenter = "middle";
        /**let square = bullet.createChild(am4core.Rectangle);
        square.width = 10;
        square.height = 10;
        square.horizontalCenter = "middle";
        square.verticalCenter = "middle";
        // Add outline to the square bullet
        square.stroke = am4core.color("#2F4858");
        square.strokeWidth = 1;
*/
        // Make square drop shadow by adding a DropShadow filter
        let shadow = new am4core.DropShadowFilter();
        shadow.dx = 2;
        shadow.dy = 2;

        let labelBullet = series.bullets.push(new am4charts.LabelBullet());
        labelBullet.label.text = "[bold]{author}[\] \n{desc}";
        labelBullet.label.maxWidth = 150;
        labelBullet.label.wrap = true;
        labelBullet.label.truncate = false;
        labelBullet.label.textAlign = "middle";
        labelBullet.label.verticalCenter = "bottom";
        labelBullet.label.paddingTop = 65;
        labelBullet.label.paddingBottom = 65;
        labelBullet.label.fill = am4core.color("black");
        labelBullet.label.propertyFields.verticalCenter = "center";
        labelBullet.setStateOnChildren = true;
        labelBullet.states.create("hover").properties.scale = 1.2;
        labelBullet.label.states.create("hover").properties.fill = am4core.color("#000");
        }

        render() {
          let chart = this.create()
          return <div id="chartdiv">
                </div>
        }
}

/**
 *         return (
            <div style={style}>
                <div id="chartdiv" style={s_tagcloud}>
                    <TimeLine/>
                </div>
                <div style={s_card}>{cards}</div>
            </div>
        );
 */