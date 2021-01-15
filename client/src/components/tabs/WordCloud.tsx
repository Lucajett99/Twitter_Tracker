import * as React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import d3Cloud from 'd3-cloud';
import { IconButton } from '@material-ui/core';
import TweetCollection from '../../utils/TweetCollection';
import TwitterIcon from '@material-ui/icons/Twitter';
import FacebookIcon from '@material-ui/icons/Facebook';
// @ts-ignore
import * as wf from 'word-freq';

interface WordCloudState {
    image: string;
}

interface WordCloudProps {
    tweetCollection: TweetCollection;
}

interface WordCloudOptions {
    text: string;
    scale: number;
    width: number;
    height: number;
    colors?: string[];
    font?: string;
    use_stopwords?: boolean;
    language?: string;
    uppercase?: boolean;
}

const Config = {
    wordCloud: {
        width: 600,
        height: 400,
        scale: 2,
        maxWords: 100,
        padding: 5,
        font: 'serif',
        minSize: 20,
        maxSize: 100
    },
    tagBlacklist: ['https']
}

export default class WordCloud extends React.Component<WordCloudProps, WordCloudState> {

    constructor(props: any) {
        super(props);
        this.state = { image: '' };
    }

    componentDidMount() {
        this.generateWordCloud(this.props.tweetCollection);
    }

    private static getWordSizes(text: string): { text: string, size: number }[] {
        const occurrences = WordCloud.getWordOccurrences(text);
        const max = Math.log(occurrences[0].occurrences);
        const size = (occs: number) => Math.round(Math.log(occs) * Config.wordCloud.maxSize / max);
        const words = occurrences.map(occ => ({ text: occ.text, size: size(occ.occurrences) }));
        return words;
    }

    private static getWordOccurrences(text: string): { text: string, occurrences: number }[] {
        let raw = text;
        for (const word of Config.tagBlacklist)
            raw = raw.replace(new RegExp(word, 'g'), '');
        const frequency = wf.freq(raw, true, false);
        const occurrences = Object.keys(frequency)
            .map((word: any) => ({ text: word, occurrences: frequency[word] }))
            .sort((w1, w2) => w2.occurrences - w1.occurrences);
        return occurrences;
    }

    public static getSummary(text: string) {
        const occurrences = WordCloud.getWordOccurrences(text).slice(0, Config.wordCloud.maxWords);
        let summary = '';
        for (const occ of occurrences)
            for (let i = 0; i < occ.occurrences; i++)
                summary += occ.text + ' ';
        return summary;
    }

    private async generateWordCloud(tweetCollection: TweetCollection) {
        return new Promise(resolve => {
            const text = tweetCollection.getTweets().map(t => t.text).join(' ');
            const data = WordCloud.getWordSizes(text).slice(0, Config.wordCloud.maxWords);
            const layout = d3Cloud()
                .words(data)
                .size([Config.wordCloud.width, Config.wordCloud.height])
                // tslint:disable-next-line:no-bitwise
                .rotate(() => ~~(Math.random() * 5) * 30 - 60)
                .fontSize(d => d.size!);
            layout.on('end', (words: any) => {
                d3.select('#svg').append('svg')
                    .attr('width', layout.size()[0])
                    .attr('height', layout.size()[1])
                    .append('g')
                    .attr('transform', 'translate(' + layout.size()[0] / 2 + ',' + layout.size()[1] / 2 + ')')
                    .selectAll('text').data(words)
                    .enter().append('text')
                    .style('font-size', (d: any) => d.size + 'px')
                    .style('font-family', 'Arial')
                    .style('fill', (d: any, i: any) => d3.schemeCategory10[i % 10])
                    .attr('text-anchor', 'middle')
                    .attr('transform', (d: any) => 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')')
                    .text((d: any) => d.text);
            }).start();
        });
    }

    render() {
        return (
            <div id="svg"></div>
        );
    }
}
