import 'mocha';
import isPng from 'is-png';
import GeoMap from '../../src/modules/GeoMap';
import { expect } from 'chai';

const markerSets = [
    {
        markers: [
            { lat: 15.44, lon: -150.32 },
            { lat: -21.36, lon: 167.94 },
            { lat: 39.20, lon: -124.33 },
            { lat: -8.36, lon: -138.50 },
            { lat: -13.39, lon: 100.00 }
        ],
        center: { lat: 8.92, lon: 167.835 },
        zoom: 1
    },
    {
        markers: [
            { lat: -13.60, lon: 83.68 },
            { lat: -13.11, lon: 83.30 },
            { lat: -12.95, lon: 83.37 },
            { lat: -12.90, lon: 83.08 },
            { lat: -12.47, lon: 83.12 }
        ],
        center: { lat: -13.035, lon: 83.38 },
        zoom: 7
    },
    {
        markers: [
            { lat: 38.40, lon: -68.90 },
            { lat: 45.36, lon: -75.36 },
            { lat: 39.20, lon: -54.30 },
            { lat: 50.62, lon: -48.99 },
            { lat: 43.33, lon: -72.65 }
        ],
        center: { lat: 44.51, lon: -62.175 },
        zoom: 3
    },
]

describe('GeoMap', () => {
    it('should calculate the center and zoom from markers', () => {
        for (const markerSet of markerSets) {
            const { center, zoom } = GeoMap.getCenterAndZoom(markerSet.markers);
            expect(center.lat).to.be.approximately(markerSet.center.lat, 0.00001);
            expect(center.lon).to.be.approximately(markerSet.center.lon, 0.00001);
            expect(zoom).to.equal(markerSet.zoom);
        }
    });
    it('should return a whole-word map if no markers are provided', async () => {
        const { center, zoom } = GeoMap.getCenterAndZoom([]);
        expect(center.lat).to.be.approximately(0, 0.00001);
        expect(center.lon).to.be.approximately(0, 0.00001);
        expect(zoom).to.equal(0);
        const image = await GeoMap.getMapImage([]);
        expect(image).to.be.a('string');
        const buffer = Buffer.from(image, 'base64');
        expect(isPng(buffer)).to.be.true;
    });
    it('should generate a map image', async () => {
        const image = await GeoMap.getMapImage(markerSets[0].markers);
        expect(image).to.be.a('string');
        const buffer = Buffer.from(image, 'base64');
        expect(isPng(buffer)).to.be.true;
    });
});