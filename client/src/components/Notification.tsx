import { Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import * as React from 'react';

interface NotificationProps {
    text: string;
    severity: 'success' | 'error' | 'info' | 'warning';
    onClose: () => void;
}

interface NotificationState {
    open: boolean;
}

export default class Notification extends React.Component<NotificationProps, NotificationState> {
    constructor(props: any) {
        super(props);
        this.state = { open: true };
    }

    private handleClose = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway')
            return;
        this.setState({ open: true });
        this.props.onClose();
    };

    render() {
        return (
            <div>
                <Snackbar
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "center"
                    }}
                    open={this.state.open}
                    autoHideDuration={2000}
                    onClose={this.handleClose}
                >
                    <Alert onClose={this.handleClose} severity={this.props.severity}>{this.props.text}</Alert>
                </Snackbar>
            </div>
        );
    }
}