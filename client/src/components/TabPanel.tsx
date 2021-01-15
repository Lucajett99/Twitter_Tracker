import { Box } from '@material-ui/core';
import * as React from 'react';

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}

// tslint:disable-next-line:no-empty-interface
interface TabPanelState {

}

export default class TabPanel extends React.Component<TabPanelProps, TabPanelState>{
    render(){
        const { children, value, index } = this.props;
        return (
            <div role={'tabpanel'} hidden={value !== index}>
                {value === index && (
                    <Box p={1} display="flex" flexDirection="row" flexWrap="wrap">
                        {children}
                    </Box>
                )}
            </div>
        );
    }
}