import * as React from 'react';


interface IProps {
    file: any;
};

interface IState {
  
};


export default class Tweet extends React.Component<IProps, IState>{
   
    
    constructor(props: any) {
        super(props);

    }

  render(){
        const style={

                border:'solid',
                borderColor:'#a4cde2',
                height:50 * screen.availHeight /100 + "px",
                backgroundColor:'#a4cde2'
            
        }

        const column1 = {
        
            height:'100%',
            width:'100%',
            border:'solid',
            borderColor:'yellow',
            //position:'absolute',
            right:'1px'
            
        }

        const column2 = {
            
            height:'100%',
            width:'100%',
            border:'solid',
            borderColor:'red',
            //position:'absolute',
            left:'1px'

        }

        const tab = {
            height:'100%',
            width:'100%',
            borderColor:'green',
            border:'solid'
        }
        return <div style={style}>Tweet Div
                    <table style= {tab}>
                        <tbody>
                        <tr>
                            <td><div style={column1}>{this.props.file }</div></td>
                            <td><div style={column2}>Prova colonna 2</div> </td>
                        </tr>
                        </tbody>
                    </table>
                </div>

        }
}