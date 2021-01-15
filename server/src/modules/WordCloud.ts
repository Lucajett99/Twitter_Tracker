import Axios, { AxiosRequestConfig } from 'axios';
import { Canvas } from 'canvas';
import svg2png from 'svg2png';
import d3Cloud from 'd3-cloud';
import wf from 'word-freq';

import Config from '../app/Config';

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

export default abstract class WordCloud {
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

    public static async generateWordCloud(text: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const data = WordCloud.getWordSizes(text).slice(0, Config.wordCloud.maxWords);
            const canvas = new Canvas(Config.wordCloud.width, Config.wordCloud.height) as any;
            const D3Node = require('d3-node');
            const d3n = new D3Node({
                selector: '#wordcloud',
                container: `
                    <div id='container'>
                        <div id='wordcloud'></div>
                    </div>
                `
            });
            const d3 = d3n.d3;
            const layout = d3Cloud()
                .canvas(() => canvas)
                .words(data)
                .size([Config.wordCloud.width, Config.wordCloud.height])
                // tslint:disable-next-line:no-bitwise
                .rotate(() => ~~(Math.random() * 5) * 30 - 60)
                .fontSize(d => d.size!);
            layout.on('end', async (words: any) => {
                d3n.createSVG()
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
                const svg = d3n.svgString();
                const png = svg2png.sync(svg);
                const base64 = png.toString('base64');
                resolve(base64);
            }).start();
        });
    }
}