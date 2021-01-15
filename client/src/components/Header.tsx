import * as React from 'react';
import { AppBar, Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, TextField, Theme, ThemeProvider, Toolbar, Typography, withStyles } from '@material-ui/core';
import { AccountCircle, Add, Close, CloudDownload, CloudUpload, Description, ExitToApp, Facebook, GetApp, LockOpen, Publish, RotateLeft, Twitter } from '@material-ui/icons';
import TweetCollection from '../utils/TweetCollection';
import TweetProvider from '../utils/TweetProvider';
import Notification from './Notification';
import ifEnter from '../utils/Enter';
import { IUser } from '@twitter-tracker/shared';
import Config from '../utils/Config';

interface HeaderProps {
    classes: any;
    user: IUser;
    collection: TweetCollection;
    userActionHandler: (action: 'login' | 'logout' | 'twitterLogin' | 'twitterLogout' | 'facebookLogin' | 'facebookLogout') => void,
    collectionActionHandler: (action: 'new' | 'load' | 'download' | 'open' | 'save' | 'close' | 'reset', params ?: any) => void,
    onMobile : boolean
}

interface HeaderState {
    tweetCollectionMenuAnchor: null | HTMLElement;
    userMenuAnchor: null | HTMLElement;
    dialogHandleClose : boolean;
    isNewCollection: boolean;
    selectCollect: boolean;
    warning: string;
    openConfirmDialog: boolean;
}

const styles = (theme: Theme) => ({
    root: {
        flexGrow: 1
    },
    avatar: {
        width: '50px',
        height: '50px'
    },
    menuButton: {
        marginRight: theme.spacing(2)
    },
    toolbar: {
        backgroundColor: '#2ea1f2'
    },
    title: {
        flexGrow: 1
    }
});

class Header extends React.Component<HeaderProps, HeaderState> {
    private listCollection: any[];
    private confirmValue: string;
    private actionHandler: 'new' | 'load' | 'download' | 'open' | 'save' | 'close' | 'reset';

    constructor(props: any) {
        super(props);
        this.state = {
            openConfirmDialog: false,
            tweetCollectionMenuAnchor: null,
            userMenuAnchor: null,
            dialogHandleClose: false,
            isNewCollection: false,
            selectCollect: false,
            warning: ''
        };
        this.confirmValue = null;
        this.listCollection = [];
        this.actionHandler = null;
    }

    private handleTweetCollectionMenu = (event: React.MouseEvent<HTMLElement>) => {
        this.setState({ tweetCollectionMenuAnchor: event.currentTarget, userMenuAnchor: null });
    };

    private userAction = (action: 'login' | 'logout' | 'twitterLogin' | 'twitterLogout' | 'facebookLogin' | 'facebookLogout') => {
        this.handleClose();
        this.props.userActionHandler(action);
    };

    private populateListCollection (list : any[]) : void{
        this.listCollection.push(<List>
            {list.map((l: any, index: number) => (
            <ListItem button key={'item_' + index} onClick={()=>{this.props.collectionActionHandler('open',l);this.selectCollectOff()}}>
            <ListItemText primary={l} />
            </ListItem>
             ))}
             </List>)

    }

    private collectionAction = async (action: 'new' | 'load' | 'download' | 'open' | 'save' | 'close' | 'reset') => {
        this.handleClose();
        switch(action){
            case 'new':
                this.setState({isNewCollection : true});
                this.dialogOn();
                break;
            case 'open':
                let list : any[];
                this.listCollection = [];
                list = await TweetProvider.getTweetCollections();

                if(list.length > 0 ){
                    this.populateListCollection(list);
                    this.dialogOff();
                    this.selectCollectOn();
                } else {
                    this.setState({ warning: "You have no saved collections" });
                }
                break;
            case 'load':
                this.setState({isNewCollection : false});
                this.dialogOn();
            case 'reset':
            case 'download':
            case 'save':
            case 'close':
                this.props.collectionActionHandler(action);
        }
    };

    private collectionConfirm = async (action: 'new' | 'load' | 'download' | 'open' | 'save' | 'close' | 'reset') => {
        if (this.props.collection && action !== 'save'){
            this.actionHandler = action;
            switch(action){
                case 'new':
                case 'load':
                case 'open':
                    this.confirmValue = "discard";
                    break;
                case 'download':
                    this.confirmValue = "download";
                    break;
                case 'close':
                case 'reset':
                    this.confirmValue = "discard";
                    break;
            }
            this.handleOpenConfirmDialog();
        }else{
            this.collectionAction(action);
        }
    }

    private handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        this.setState({ tweetCollectionMenuAnchor: null, userMenuAnchor: event.currentTarget });
    };

    private handleClose = () => {
        this.setState({ tweetCollectionMenuAnchor: null, userMenuAnchor: null });
    };

    private dialogOn = () => {
        this.setState({dialogHandleClose: true});
    }
    private dialogOff = () => {
        this.setState({dialogHandleClose: false});
    }

    private selectCollectOn = () => {
        this.setState({selectCollect: true});
    }

    private selectCollectOff = () => {
        this.setState({selectCollect: false});
    }

    private handleCloseConfirmDialog = () => {
        this.setState({openConfirmDialog: false })
    }

    private handleOpenConfirmDialog = () => {
        this.setState({openConfirmDialog: true })
    }
    private handleFile = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            const blob = new Blob([new Uint8Array(e.target.result as any)], { type: file.type });
            this.props.collectionActionHandler('load', { blob, name: file.name.split('.').slice(0, -1).join('.') });
        };
        reader.readAsArrayBuffer(file);
        this.dialogOff();
    }
    private collectionName = () : void=>{
        const name = (document.getElementById('inputTextCollection') as HTMLInputElement).value;
        this.props.collectionActionHandler('new', { name })
        this.dialogOff();
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <AppBar position="static" title="Twitter Tracker">
                    <Toolbar className={classes.toolbar}>
                        <Avatar className={classes.avatar} src={Config.apiUrl + '/img/twitterTracker.jpeg'}></Avatar>
                        <Typography className={classes.title} variant="h3">
                            &nbsp;Twitter Tracker
                        </Typography>
                        <div className={classes.grow} />
                        {!this.props.onMobile ?
                        <div>
                            <IconButton
                                onClick={this.handleTweetCollectionMenu}
                                color="inherit"
                            >
                                <Description />
                            </IconButton>
                            <Menu
                                id="menu-tweet-collection"
                                anchorEl={this.state.tweetCollectionMenuAnchor}
                                getContentAnchorEl={null}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                open={Boolean(this.state.tweetCollectionMenuAnchor)}
                                onClose={this.handleClose}
                            >

                                <Dialog open={this.state.selectCollect} onClose={()=>{this.selectCollectOff();this.listCollection = []}}>
                                    <DialogTitle>Select collection </DialogTitle>
                                {this.listCollection}
                                </Dialog>

                                <Dialog open={this.state.dialogHandleClose} onClose={this.dialogOff}>
                                    <DialogTitle>{!this.state.isNewCollection ? 'Select collection to load' : 'Insert new collection\'s name' }</DialogTitle>
                                    <DialogContent>
                                        {!this.state.isNewCollection ? <input
                                            accept="application/json"
                                            id="upload-file"
                                            name="upload-file"
                                            onChange={this.handleFile}
                                            type="file"
                                        /> :
                                            <TextField
                                                autoFocus
                                                onKeyUp={ifEnter(this.collectionName)}
                                                id="inputTextCollection" />
                                        }
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={this.dialogOff} color="primary">
                                            Cancel
                                        </Button>
                                        {this.state.isNewCollection ?
                                        <Button onClick={this.collectionName} color="primary" autoFocus>
                                            Confirm
                                        </Button> : null
                                        }
                                    </DialogActions>
                                </Dialog>
                                <MenuItem onClick={() => this.collectionConfirm('new')}>
                                    <ListItemIcon>
                                        <Add fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="New" />
                                </MenuItem>
                                <MenuItem onClick={() => this.collectionConfirm('load')}>
                                    <ListItemIcon>
                                        <Publish fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Load" />
                                </MenuItem>
                                {this.props.collection ?
                                <MenuItem onClick={() => this.collectionConfirm('download')}>
                                    <ListItemIcon>
                                        <GetApp fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Download" />
                                </MenuItem>:''}
                                {this.props.user?
                                <MenuItem onClick={() => this.collectionConfirm('open')}>
                                        <ListItemIcon>
                                            <CloudDownload fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Open" />
                                    </MenuItem>:''}
                                    {this.props.user && this.props.collection ?
                                     <MenuItem onClick={() => this.collectionConfirm('save')}>
                                            <ListItemIcon>
                                                <CloudUpload fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText primary="Save" />
                                        </MenuItem>: ''}
                                {this.props.collection?
                                <MenuItem onClick={() => this.collectionConfirm('reset')}>
                                    <ListItemIcon>
                                        <RotateLeft fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Reset" />
                                </MenuItem>:''}
                                {this.props.collection?
                                <MenuItem onClick={() => this.collectionConfirm('close')}>
                                    <ListItemIcon>
                                        <Close fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Close" />
                                </MenuItem>
                                :''}
                            </Menu>
                            <Dialog
                                open={this.state.openConfirmDialog}
                                onClose={this.handleCloseConfirmDialog}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <DialogTitle id="alert-dialog-title">Warning</DialogTitle>
                                <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    Are you sure to {this.confirmValue} the actual collection?
                                </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                <Button onClick={this.handleCloseConfirmDialog} color="primary">
                                    Cancel
                                </Button>
                                <Button onClick={()=>{this.collectionAction(this.actionHandler);this.handleCloseConfirmDialog()}} color="primary" autoFocus>
                                    Confirm
                                </Button>
                                </DialogActions>
                            </Dialog>
                            <IconButton
                                onClick={this.handleUserMenu}
                                id="menuButton"
                                color="inherit"
                            >
                                <AccountCircle />
                                &nbsp;
                                {this.props.user ? <Typography>{this.props.user.username}</Typography> : ''}
                            </IconButton>
                            <Menu
                                id="menu-user"
                                getContentAnchorEl={null}
                                anchorEl={this.state.userMenuAnchor}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                open={Boolean(this.state.userMenuAnchor)}
                                onClose={this.handleClose}
                            >
                                {
                                    !this.props.user ?
                                        <MenuItem onClick={() => this.userAction('login')}>
                                            <ListItemIcon>
                                                <LockOpen fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText primary="Login" />
                                        </MenuItem>
                                        :
                                        <MenuItem onClick={() => this.userAction('logout')}>
                                            <ListItemIcon>
                                                <ExitToApp fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText primary="Logout" />
                                        </MenuItem>
                                }
                                {
                                    !this.props.user?.twitter ?
                                        <MenuItem onClick={() => this.userAction('twitterLogin')}>
                                            <ListItemIcon>
                                                <Twitter fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText primary="Twitter" />
                                        </MenuItem> : null
                                }
                            </Menu>
                            {this.state.warning ? <Notification severity="warning" text={this.state.warning} onClose={() => this.setState({ warning: '' })}></Notification> : null}
                        </div> : ""}
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(Header);