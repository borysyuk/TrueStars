import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import { Link } from 'react-router-dom';
import MarketFind from "../../Market/MarketFind";
import MarketOwnerService from "../../../services/MarketOwnerService";


class PageMarketOwnerView extends Component {

    constructor (props) {
        super(props);

        this.state = {
            marketId: props.match.params.id,
            marketInfo: MarketOwnerService.newMarketInfo(),
            loading: true,
            error: ""
        }
    }

    componentWillMount() {
        MarketOwnerService.getMarket(this.state.id).then(marketInfo => {

        })
    }

    render() {
        return (
            <div className="pure-g generalPage">
                <div className='pure-u-1-1'>
                    <MarketFind marketId="" marketHash="" />
                </div>

            </div>
        )
    }
}

export default withRouter(PageMarketOwnerView);