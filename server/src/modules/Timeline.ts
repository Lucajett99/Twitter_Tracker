import { ITweet } from '@twitter-tracker/shared';
import nodeHtmlToImage from 'node-html-to-image';
import moment from 'moment';
import fs from 'fs';

export default abstract class Timeline {

    private static createDate(data: string){
        const FORMAT = "ddd MMM DD HH:mm:ss YYYY";
        const date = moment(data.replace(' +0000', ""), FORMAT).add(1, 'hours');
        return date.format('DD MMM HH:mm:ss');
    }

    private static modifyJson(series : ITweet[]){
        const seriesToReturn: any[] = [];
        series.forEach(element => {
            element.created_at = this.createDate(element.created_at);
        });

        if(series.length > 0){
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
            return seriesToReturn.slice(0,17);
        }else{
            return [];
        }
    }

    private static getHtml(tweets: ITweet[]){
        let modifiedTweets = this.modifyJson(tweets);
        let margine = Math.trunc((37 * (17 - modifiedTweets.length))/(modifiedTweets.length));
        let html = `
        <html>
        <head>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: arial
                }
    
                .box{
                    margin:0 10%;
                    height: 630px;
                    padding: 10px 0 40px 60px
                }
    
                .box ul{
                    list-style-type: none;
                    margin: 0;
                    padding: 0;
                    position: relative;
                    transition: all 0.5s linear;
                    top:0
                }
    
                .box ul:last-of-type{top:5px}
    
                .box ul:before{
                    content: "";
                    display: block;
                    width: 0;
                    height: 100%;
                    border:1px dashed #2ea1f2;
                    position: absolute;
                    top:0;
                    left:30px
                }
    
                .box ul li{
                    margin: 0px 60px ${margine}px;
                    position: relative;
                    padding: 6px 20px;
                    background:rgba(255, 255, 255, 0.3);
                    color:black;
                    border-radius: 10px;
                    line-height: 20px;
                    width: 100%
                }
    
    
                .box ul li > span{
                    content: "";
                    display: block;
                    width: 0;
                    height: 100000%;
                    border:1px solid #2ea1f2;
                    position: absolute;
                    top:-21;
                    left:-30px
                }
    
                .box ul li > span:before{
                    content: "";
                    display: block;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #2ea1f2;
                    border:2px solid #2ea1f2;
                    position: absolute;
                    left:-7.5px
                }
    
                .box ul li > span:before{top:30px}
                .box ul li > span:after{top:95%}
    
                .box .title{
                    text-transform: uppercase;
                    font-weight: 700;
                    margin-bottom: 5px
                }
    
                .box .info:first-letter{text-transform: capitalize;line-height: 1.7}
    
                .box .name{
                    margin-top: 10px;
                    text-transform: capitalize;
                    font-style: italic;
                    text-align: right;
                    margin-right: 20px
                }
    
    
                .box .time span{
                    position: absolute;
                    left: -120px;
                    color:black;
                    font-size:80%;
                    font-weight: bold;
                }
                .box .time span:first-child{top:0px}
                .box .time span:last-child{top:14px}
            </style>
        </head>
        <body>
            <div class="box">
                <ul>
        `
        for(let tweet of modifiedTweets){
            let tweetHtml = `
            <li>
            <span></span>
            <div class="title">${tweet.user.name}</div>
            <div class="time">
                <span>${tweet.created_at.substring(0,7)}</span>
                <span>${tweet.created_at.substring(7)}</span>
            </div>
        </li>` 
            html = html.concat(tweetHtml)
        }

        html = html.concat(`
                    </ul>
                </div>
            </body>
        </html>`
        )
        fs.writeFileSync('mirko.html', html)
        return html;
    }

    public static async getTimelineImage(tweets: ITweet[]): Promise<string> {
        const image = await nodeHtmlToImage({ html: this.getHtml(tweets) });
        return image.toString('base64') ;
    }
}