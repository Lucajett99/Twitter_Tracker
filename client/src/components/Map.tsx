import { LatLngExpression, marker } from 'leaflet';
import * as React from 'react';
import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet'

interface IState{
	mapCenter: LatLngExpression;
	markersArray : any[]; 
}

interface IProps{
	coordinateList : LatLngExpression[]; 
}

export default class Map extends React.Component<IProps, IState> {
	
	constructor(props: any) {
		super(props);
		const Roma = { lat: 41.902782, lng: 12.496366 }; //instantiation of a LatLngExpression type of leaflet
		this.state = {mapCenter: Roma, markersArray : []};
	}

	componentDidMount() {
		let auxiliarArray : any[];
		auxiliarArray = [];
		this.props.coordinateList.forEach((coordinate) => {
			const tmp = (<Marker position = {coordinate} />	)
			console.log(tmp);
			auxiliarArray.push(tmp);
		});

		this.setState({markersArray : auxiliarArray});

	}

	render() {	
		return (
			<MapContainer center={this.state.mapCenter} zoom={6} scrollWheelZoom={false} style={{height: "100%", width: "100%"}}>
				<TileLayer attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
				{this.state.markersArray}
			</MapContainer>
    	)
  	}
}
