import { KeyboardEvent } from 'react';

const ifEnter = (callback: (...args: any) => any, ...args: any) => (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter')
        callback(...args);
};
export default ifEnter;