import 'mocha';
import isPng from 'is-png';
import { expect } from 'chai';
import WordCloud from '../../src/modules/WordCloud';
import tweets from '../../../samples/geolocated.json';

describe('WordCloud', () => {
    it('should return the word cloud image', async () => {
        const text = tweets.map(t => t.text).join(' ');
        const image = await WordCloud.generateWordCloud(text);
        expect(image).to.be.a('string');
        const buffer = Buffer.from(image, 'base64');
        expect(isPng(buffer)).to.be.true;
    });
});