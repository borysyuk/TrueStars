import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import MarketOwnerService from "../../../services/MarketOwnerService";
import MarketAdd from "../../Market/MarketAdd";

class PageMarketOwnerMarketNew extends Component {
    constructor(props) {
        super(props);
        this.state = {
            market: MarketOwnerService.newEntity()
        };
    }

    render() {
        return (
            <div className="pure-g generalPage">
                <div className='pure-u-1-1'>
                    <MarketAdd market={this.state.market} mode="add" submit={MarketOwnerService.addMarket.bind(MarketOwnerService)}/>

                </div>
            </div>
        )
    }
}

export default withRouter(PageMarketOwnerMarketNew);