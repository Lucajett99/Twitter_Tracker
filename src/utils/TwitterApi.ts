import Axios from 'axios';

import { apiUrl } from '../config/Config.json';

export default class TwitterApi {
    public static async getRecent(rules: string): Promise<any> {
        const response = await Axios.get(`${apiUrl}/recents?query=${rules}`);
        return response.data;
    }
}