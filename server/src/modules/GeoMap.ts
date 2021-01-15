import path from 'path';
import fs from 'fs';
import { IMapOptions, IGeoPoint } from '@twitter-tracker/shared';
import nodeHtmlToImage from 'node-html-to-image';

const requests = [
    '/components/leaflet-map/leaflet-map.css',
    '/components/leaflet/leaflet.css',
    '/components/leaflet/leaflet.js',
    '/components/leaflet/images/marker-shadow.png',
    '/components/leaflet/images/marker-icon.png'
];

const blacklist = [
    '/server-components-for-web.js',
    '/components/leaflet-map/leaflet-map.js',
    '/src/leaflet-marker.js'
];

export default abstract class GeoMap {
    private static getLeafletHtml(options: IMapOptions) {
        let html = `
            <html>
            <head>
                <style>
                    body {
                        width: 500px;
                        height: 500px;
                    }
                </style>
            </head>
            <body>
                <leaflet-map lat="${options.center.lat.toFixed(6)}" long="${options.center.lon.toFixed(6)}" zoom="${Math.round(options.zoom)}">
                    {{ markers }}
                </leaflet-map>
            </body>
            </html>
        `;
        const markers: string[] = [];
        for (const marker of options.markers)
            markers.push(`<leaflet-marker lat="${marker.lat.toFixed(6)}" long="${marker.lon.toFixed(6)}"></leaflet-marker>`);
        html = html.replace('{{ markers }}', markers.join(''));
        return html;
    }

    private static getSelfContainedHtml(linkedHtml: string): string {
        const componentsStatic = require('server-components-static');
        const componentStaticRegex = new RegExp(componentsStatic.baseUrl + '/([^/]+)/(.+)');
        for (const request of requests) {
            const match = request.match(componentStaticRegex)!;
            let filePath: string;
            if (match) {
                const componentName = match[1];
                const requestedFile = match[2];
                filePath = componentsStatic.getPath(componentName, requestedFile);
            } else
                filePath = path.join(__dirname, '..', '..', 'node_modules', 'leaflet-map-server-component', request);
            const fileContent = fs.readFileSync(filePath);
            if (filePath.endsWith('.css'))
                linkedHtml = linkedHtml.replace(`<link rel="stylesheet" href="${request}">`, `<style>${fileContent.toString('utf-8')}</style>`);
            else if (filePath.endsWith('.png'))
                linkedHtml = linkedHtml.replace(new RegExp(`src="${request}"`, 'g'), `src="data:image/png;base64,${fileContent.toString('base64')}"`);
            else if (filePath.endsWith('.js'))
                linkedHtml = linkedHtml.replace(`<script type="text/javascript" src="${request}"></script>`, blacklist.includes(request) ? '' : `<script type="text/javascript">${fileContent.toString('utf-8')}</script>`);
        }
        return linkedHtml;
    }

    public static getCenterAndZoom(markers: IGeoPoint[]): { center: IGeoPoint, zoom: number } {
        if (markers.length === 0)
            return { center: { lat: 0, lon: 0 }, zoom: 0 };
        else if (markers.length === 1)
            return { center: markers[0], zoom: 8 };
        const lats = markers.map((marker: IGeoPoint) => marker.lat);
        const lons = markers.map((marker: IGeoPoint) => marker.lon);
        const top = Math.max(...lats);
        const bottom = Math.min(...lats);
        const height = top - bottom;

        const left0 = Math.min(...lons);
        const right0 = Math.max(...lons);
        const width0 = right0 - left0;
        const left180 = Math.min(180, ...lons.filter((l: number) => l >= 0));
        const right180 = Math.max(-180, ...lons.filter((l: number) => l <= 0));
        const width180 = 360 + right180 - left180;
        const translated = !(width0 < width180);
        const width = !translated ? width0 : width180;

        const lon0 = (left0 + right0) / 2;
        const lon180Translated = (left180 + right180) / 2;
        const lon180 = lon180Translated + (lon180Translated >= 0 ? -1 : 1) * 180;
        const lat = (top + bottom) / 2;
        const lon = !translated ? lon0 : lon180;
        const center = { lat, lon };

        const latZoom = Math.floor(Math.log2(360 / width));
        const lonZoom = Math.floor(Math.log2(180 / height));
        const zoom = Math.min(latZoom, lonZoom);

        return { center, zoom };
    }

    public static async getMapImage(markers: IGeoPoint[]) {
        const components = require('server-components');
        try {
            require('leaflet-map-server-component');
            const { center, zoom } = GeoMap.getCenterAndZoom(markers);
            const options: IMapOptions = { center, zoom, markers };
            const html = GeoMap.getLeafletHtml(options);
            const linkedHtml: string = await components.renderPage(html);
            const selfContainedHtml = GeoMap.getSelfContainedHtml(linkedHtml);
            const image = await nodeHtmlToImage({ html: selfContainedHtml });
            return image.toString('base64');
        } catch (err) {
            console.error(err);
            return '';
        }
    }
}