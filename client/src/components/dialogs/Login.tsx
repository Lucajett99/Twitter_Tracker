import * as React from 'react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, TextField, Theme, withStyles } from '@material-ui/core';
import { AccountCircle, Lock } from '@material-ui/icons';
import Api from '../../utils/Api';
import Notification from '../Notification';
import ifEnter from '../../utils/Enter';

interface LoginProps {
    classes: any;
    open: boolean;
    onClose: () => void;
}

interface LoginState {
    open: boolean;
    loading: boolean;
    error: string;
}

const styles = (theme: Theme) => ({
    root: {
        flexGrow: 1
    }
});

class Login extends React.Component<LoginProps, LoginState> {

    constructor(props: any) {
        super(props);
        this.state = {
            open: props.open,
            loading: false,
            error: ''
        };
    }

    componentDidUpdate() {
        if (this.props.open !== this.state.open)
            this.setState({ open: this.props.open });
    }

    private handleClose = () => {
        this.setState({ open: false, loading: false });
        this.props.onClose();
    };

    private handleConfirm = async () => {
        if (this.state.loading)
            return;
        this.setState({ loading: true });
        const username = (document.getElementById('username') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;
        const result = await Api.login(username, password);
        if (result.error)
            this.setState({ error: result.error });
        this.handleClose();
    };

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <Dialog open={this.state.open} onClose={this.handleClose}>
                    <DialogTitle id="form-dialog-title">Login</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="username"
                            label="Username"
                            type="text"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AccountCircle />
                                    </InputAdornment>
                                )
                            }}
                            onKeyUp={ifEnter(this.handleConfirm)}
                            fullWidth
                        />
                        <TextField
                            margin="dense"
                            id="password"
                            label="Password"
                            type="password"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock />
                                    </InputAdornment>
                                )
                            }}
                            onKeyUp={ifEnter(this.handleConfirm)}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button data-testid="cancel" onClick={this.handleClose} color="primary">
                            Cancel
                        </Button>
                        {
                            !this.state.loading ?
                            <Button data-testid="confirm" onClick={this.handleConfirm} color="primary">
                                Confirm
                            </Button> : <CircularProgress />
                        }
                    </DialogActions>
                </Dialog>
                { this.state.error ? <Notification severity="error" text={this.state.error} onClose={() => this.setState({error: ''})}></Notification> : null}
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(Login);