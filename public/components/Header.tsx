import * as React from 'react';

import Avatar from '@material-ui/core/Avatar';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';


export default  class Header extends React.Component{
    

    render(){
       

        const s = {
            border:'solid',
            borderColor:'#1da1f2',
            height:13 * screen.availHeight /100 + "px",
            backgroundColor:'#1da1f2',
            marginColor:'#1da1f2'
        }

        const title={
            fontFamily: "Lucida Console , Courier, monospace",
            fontSize: "45px",
            fontType: "bold",
            color:"white"
           // width:"20px"
        }

        const avtr ={
                height:"94%",
                width:"86px"
        }
        const tab = {
            paddingLeft:"15px",
            width:'100%',
 
            
        }

        const col2 = {
            width:"93%",
        }

        return <div style={s}>
                    <table style={tab} >
                        <tbody>
                        <tr>
                            <td><div ><Avatar alt="Logo" src="../../public/img/twitterTracker.jpeg" style={avtr} /></div></td>
                            <td style={col2}><div ><h1 style={title}>Twitter Tracker
                                        </h1>
                            </div> </td>
                            </tr>
                        </tbody>
                    </table>





                     
                    </div>
    }
}