import axios from 'axios';
import * as React from 'react';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import { Button, createStyles, DialogContent, makeStyles, DialogContentText, FormControl, Theme, WithStyles, withStyles, DialogTitle, InputLabel, Select, DialogActions, TextField, List, ListItem, ListItemText } from '@material-ui/core';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Avatar from '@material-ui/core/Avatar';
import { blue } from '@material-ui/core/colors';
import {Md5} from "md5-typescript";
import { circleIn } from '@amcharts/amcharts4/.internal/core/utils/Ease';

interface HProps {
    onFileLoad: (blob: Blob) => Promise<void>;
    user : string;
    setProfile :(name : string , collection : any) => void;
    resetProfile :(name : string) => void;
}
interface HState {
   userDialog : boolean;
   selectCollect : boolean;
}

export default class Header extends React.Component<HProps,HState>{
    listCollect : any;
    propUser : any ;

    constructor(props: any) {
        super(props);
        this.state = { userDialog : false , selectCollect : false };
        this.propUser = null;
        this.listCollect = [];    
    }

    private keyDown = (event: any) => {
        const ENTER = 13;
        if (event.keyCode == ENTER)
            this.submitLogin();
    }
    
    private handleFile = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            const blob = new Blob([new Uint8Array(e.target.result as any)], { type: file.type });
            this.props.onFileLoad(blob);
        };
        reader.readAsArrayBuffer(file);
    }

        private resetUser = ():void =>{
            console.log("Reset User");
            this.props.resetProfile(null);
    }  
private onT = (state : number) : void => {
        if(state === 0){
            this.setState((userDialog) => ({
            userDialog: true,
            }));
        }else{
            this.setState((selectCollect) => ({
                selectCollect: true,
                }));
        }   
      }
      

    private onF = (state : number) : void => {
        if(state === 0){
            this.setState((userDialog) => ({
            userDialog: false,
            }));
        }else{
            
            this.setState((selectCollect) => ({
                selectCollect: false,
                }));
        }
      }

    private setLoginSection = () : void => {

        if(this.props.user !== null){
            this.propUser = null;
            this.propUser=<div><p>Ciao, {this.props.user}!<Button color="inherit" variant="contained" onClick={this.resetUser}>Esci!</Button></p></div>
        }else{
            this.propUser= <Button color="inherit" variant="contained" style={{top : "3px"}} startIcon={<AccountCircleIcon/>} onClick= {()=>this.onT(0)}>Login</Button>
        }
    }
    private submitLogin = async () => {
        const username: string = (document.getElementById('user') as HTMLInputElement).value;
        const password: string = (document.getElementById('psw') as HTMLInputElement).value;

        const passwor = Md5.init(password); //Hash function to -> (password)
       
        let token;let access = false;
        let listCollection: any[];
        //Check the user and if the request is successfull return the user's token
        await axios.post(`http://localhost:3000/login`,{username : username ,password : passwor}).then(res=>{
            
            if(res.data === -1){
                alert("Credential Not Valid!");
                access = false;
            }else{   
                access = true;
                token = res.data.token;
                listCollection = res.data.collection;
            }
        });
 
        if(listCollection !== undefined && access){
            
            listCollection.shift();
            //console.log(listCollection);
            
            if(listCollection.length < 2 ){
                this.props.setProfile(username,"Collection.json");
               
            }else{
                this.listCollect.push(<List>
                {listCollection.map((listCollection: Array<any>) => (
                <ListItem button key={"item_"+listCollection} onClick={()=>{this.props.setProfile(username,listCollection);this.onF(1)}}>
                <ListItemText primary={listCollection} />
                </ListItem>
                 ))}
                 </List>)
            }
            this.onF(0);
            if(access){    
                //console.log(token); //<---- TOKEN UTENTE
      
                if(listCollection.length > 1)
                    this.onT(1);
                
            } 
            
        
        }else if(access){
            this.onF(0);
            this.props.setProfile(username,"Collection.json");
            //console.log("new user");
        }else{
            
        }
        
}

    render() {
       
        const headerStyle = {
            border:'solid',
            borderColor:'#1da1f2',
            height:13 * screen.availHeight /100 + "px",
            backgroundColor:'#1da1f2',
            marginColor:'#1da1f2'
        };

        const title = {
            fontFamily: "Lucida Console, Courier, monospace",
            fontSize: "45px",
            fontType: "bold",
            color:"white"
        };

        const logoTwitterTracker = {
            height:"94%",
            width:"86px"
        };

        const container = {
            paddingLeft:"15px",
            width:'100%'
        };

        const col2 = {
            width:"80%",
            
        };

        this.setLoginSection();
        
        return (
            <div style={headerStyle}>
                <table style={container} >
                    <tbody>
                        <tr>
                            <td><div ><Avatar alt="Logo" src="../../img/twitterTracker.jpeg" style={logoTwitterTracker} /></div></td>
                            <td style={col2}>
                                <div >
                                    <h1 style={title}>Twitter Tracker</h1>
                                </div>
                            </td>
                            <td>
                                <label htmlFor="upload-file">
                                    <input
                                        style={{display: "none"}}
                                        accept="application/json"
                                        id="upload-file"
                                        name="upload-file"
                                        onChange={this.handleFile}
                                        type="file"
                                    />
                                                               
                                </label>
                                <Button id="btnLogin" color="inherit" variant="contained" startIcon={<NoteAddIcon/>} component="span">
                                            Upload
                                      </Button>
                                  {this.propUser}  
                               
                                
                                <Dialog
                                        open={this.state.userDialog}
                                        onClose={()=>this.onF(0)}
                                        aria-labelledby="max-width-dialog-title"
                                        
                                    >
                                        <DialogTitle id="max-width-dialog-title" >Login</DialogTitle>
                                        <DialogContent>
                                        <AccountCircleIcon/>
                                        <DialogContentText>
                                            Accedi
                                        </DialogContentText>
                                        
                                                <TextField id="user" label="username" />
                                                <br/>
                                                <TextField id="psw" type="password" label="password" onKeyDown={this.keyDown} />
                                        
                                        </DialogContent>
                                        <DialogActions>
                                        <Button onClick={()=>this.onF(0)} color="primary">
                                            Close
                                     </Button>
                                    <Button type="submit" color="primary" onClick={this.submitLogin}>Submit</Button>
                                        </DialogActions>
                                    </Dialog> 
                                    <Dialog open={this.state.selectCollect} onClose={()=>{this.onF(1);this.listCollect = []}}>
                                        <DialogTitle id="max-width-dialog-title" >Seleziona la Collection</DialogTitle>
                                    {this.listCollect}
                                    </Dialog>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}