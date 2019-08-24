import React, {Component} from 'react';
import {NotificationManager} from 'react-notifications';
import {withRouter} from "react-router-dom"
import GeneralService from "../../services/GeneralService";



class MarketView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            marketInfo: props.marketInfo,
        };

    }

    render(){
        return (
            <div>Info</div>
        )
    }
}


export default withRouter(MarketView);