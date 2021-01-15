import * as React from 'react';
import _ from 'lodash';
import { LatLngExpression } from 'leaflet';
import { withStyles, Theme } from '@material-ui/core';
import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet';
import TweetCollection from '../../utils/TweetCollection';
interface MapState{
}

interface MapProps{
	classes: any;
	tweetCollection: TweetCollection;
	mapCenter: LatLngExpression;
}

const styles = (theme: Theme) => ({
    root: {
		height: 63* screen.availHeight /100 + "px",
		width: 48 * screen.availWidth/100 + "px",
		marginTop: "20px"
	},
	mapContainer: {
		height : "100%",																					
		width:"100%"
	}
});

class Map extends React.Component<MapProps, MapState> {

	constructor(props: any) {
		super(props);
		this.state = { imageUrl : undefined };
	}

	/**
	 * Class metod which get the center of boundig_box (the midpoint of the bounding_box)
	 * @param boundingBox An array of 4 cordinates's array provided by Twitter, specified as: [ [lat, lon], [lat, lon], [lat, lon], [lat, lon] ]
	 * @returns Central coordinates
	 */
	private getCenter(boundingBox: any) : any{
		const point = boundingBox;
		const length = 4; // length of bounding_box
		const lon = (point[0][0] + point[1][0] + point[2][0] + point[3][0]) / length;
		const lat = (point[0][1] + point[1][1] + point[2][1] + point[3][1]) / length;
		const coordinates = {lat, lon};
		return coordinates;
	}

	/**
	 * Class metod which takes from all tweets only the geolocated ones
	 * @returns Geolocated tweets
	 */
	private getGeolocatedTweets() : any {
		const tweets = this.props.tweetCollection.getTweets();
		return tweets.filter((tweet) => tweet.place);
	}

	/**
	 * Class metod which set and get the markers of geolocated tweets
	 * @returns An array of markers
	 */
	private getMarkers() : any {
		const geolocatedTweets = this.getGeolocatedTweets();
		const markers: any[] = [];
		const markersArray: any[] = [];
		geolocatedTweets.forEach((tweet: any) => {
			const boundingBox = tweet.place.bounding_box.coordinates[0];
			const coordinates = this.getCenter(boundingBox);
			markers.push(coordinates);
			const images: any = [];
			if(tweet.extended_entities) {
				tweet.extended_entities.media.forEach((image: any) => {
					images.push(<img src={image.media_url} style={{width: "100px", height: "100px", display: "inline", margin:"5px"}} />)
				})
			}
			const marker = (
				<Marker position={coordinates}>
					<Popup>
						<p>{tweet.user.screen_name}:</p>
						<p>{tweet.text}</p>
						{images}
					</Popup>
				</Marker>
			);
			markersArray.push(marker);
		})
		return markersArray ;
	}

	render() {
		const { classes } = this.props;
		return (
				<div className={classes.root}>
					<MapContainer id="myMap" key={"Mymap"} center={this.props.mapCenter} zoom={6} scrollWheelZoom={false} className = {classes.mapContainer}>
						<TileLayer key={"MyLayer"} attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
						{this.getMarkers()}
					</MapContainer>
				</div>
		)
  	}
}
export default withStyles(styles, { withTheme: true })(Map);