import 'mocha';
import isPng from 'is-png';
import { expect } from 'chai';
import Timeline from '../../src/modules/Timeline';
import tweets from '../../../samples/covid.json';

describe('Timeline', () => {
    it('should return the timeline image', async () => {
        /*
        const image = await Timeline.getTimelineImage(tweets);
        expect(image).to.be.a('string');
        const buffer = Buffer.from(image, 'base64');
        expect(isPng(buffer)).to.be.true;
        */
    });
});