import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as React from 'react';
import moment from 'moment';
import { IconButton } from '@material-ui/core';
import TweetCollection from '../../utils/TweetCollection';
import TwitterIcon from '@material-ui/icons/Twitter';
import FacebookIcon from '@material-ui/icons/Facebook';

interface IProps {
   tweetCollection: TweetCollection;
};

export default class TimeLine extends React.Component<IProps>{
    chart: am4charts.XYChart;

    constructor(props: any) {
      super(props);
    }

    componentDidMount(){
        this.chart = this.create();
    }

    private createDate(data: string){
        const FORMAT = "ddd MMM DD HH:mm:ss YYYY";
        const date = moment(data.replace(' +0000', ""), FORMAT).add(1, 'hours');
        return date.format('DD MMM YY HH:mm:ss');
    }

    private modifyJson(){
        const tweets = this.props.tweetCollection.getJson()
        let series: any[] = JSON.parse(tweets);
        if(series.length > 0){
            const seriesToReturn: any[] = [];
            series.forEach(element => {
                element.a = 1;
                element.username = element.user.name;
                element.created_at = this.createDate(element.created_at);

            });
            series = series.sort((a, b) => {
                if(a.created_at < b.created_at) return -1;
                else return 1;
            });

            for(let y: number = 1; y < series.length; y = y + 1){
                const tweet: any = series[y].created_at
                if(tweet){
                    if(tweet === series[y-1].created_at){
                        delete series[y-1];
                    }
                }
            }
            for(let x: number = 0; x < series.length; x = x + 1){
                let tweet : any;
                tweet = series[series.length - x - 1]
                if(tweet){
                    seriesToReturn.push(series[series.length - x - 1])
                }
            }
            return seriesToReturn.slice(0,30).reverse();
        }else{
            return [];
        }
    }


    private create() {
        this.chart =  am4core.create('chartdiv', am4charts.XYChart);
        this.chart.data = this.modifyJson();

        const categoryAxis = this.chart.yAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "created_at";
        categoryAxis.renderer.grid.template.disabled = false;
        categoryAxis.renderer.labels.template.disabled = false;
        categoryAxis.tooltip.disabled = true;


        const valueAxis = this.chart.xAxes.push(new am4charts.ValueAxis());
        valueAxis.strictMinMax = true;
        valueAxis.renderer.grid.template.disabled = true;
        valueAxis.renderer.labels.template.disabled = true;
        valueAxis.renderer.baseGrid.disabled = true;
        valueAxis.tooltip.disabled = true;


        const series = this.chart.series.push(new am4charts.LineSeries());
        series.dataFields.categoryY = "created_at";
        series.dataFields.valueX = "a";
        series.strokeWidth = 3;

        const bullet = series.bullets.push(new am4charts.Bullet());
        const square = bullet.createChild(am4core.Rectangle);
        square.width = 5;
        square.height = 5;
        square.horizontalCenter = 'middle';
        square.verticalCenter = 'middle';

        // Make square drop shadow by adding a DropShadow filter
        const shadow = new am4core.DropShadowFilter();
        shadow.dx = 2;
        shadow.dy = 2;

        const labelBullet = series.bullets.push(new am4charts.LabelBullet());
        labelBullet.label.text = "[bold]{username}​​​​​";
        labelBullet.label.maxWidth = 450;
        labelBullet.label.wrap = true;
        labelBullet.label.truncate = false;
        labelBullet.label.textAlign = 'middle';
        labelBullet.label.verticalCenter = 'middle';
        labelBullet.label.paddingTop = 65;
        labelBullet.label.paddingBottom = 65;
        labelBullet.label.fill = am4core.color('black');
        labelBullet.label.propertyFields.verticalCenter = 'center';
        labelBullet.setStateOnChildren = true;
        labelBullet.states.create("hover").properties.scale = 1.1;
        labelBullet.label.states.create("hover").properties.fill = am4core.color("#000");

        return this.chart;
    }

    render() {
        return (
            <div id='chartdiv' style={{width : "52%", height: 65 * screen.availHeight /100 + "px", display: "inline-block", overflow: "scroll"}}></div>
        );
    }
}