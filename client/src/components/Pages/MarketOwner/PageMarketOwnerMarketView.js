import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Link} from 'react-router-dom';
import MarketFind from "../../Market/MarketFind";
import MarketOwnerService from "../../../services/MarketOwnerService";
import MarketView from "../../Market/MarketView"

class PageMarketOwnerView extends Component {

    constructor(props) {
        super(props);

        this.state = {
            id: props.match.params.id,
            marketInfo: MarketOwnerService.newMarketInfo(),
            loading: true,
            error: ""
        }
    }

    componentWillMount() {
        MarketOwnerService.getMarket(this.state.id).then(marketInfo => {
            console.log("marketInfo", marketInfo);
            if (marketInfo !== null) {
                this.setState({
                    marketInfo: {...marketInfo},
                    loading: false,
                    error: "",
                });
            } else {
                console.log("market NULL");
            }

        }).catch(error => {
            this.setState({
                loading: false,
                error: "Error: Cannot load market.",
            });
        })
    }

    render() {
        return (
            <div className="pure-g generalPage">
                <div className='pure-u-1-1'>
                    <h2>Market Info</h2>
                    <MarketView marketInfo={this.state.marketInfo} id={this.state.id} />

                </div>

            </div>
        )
    }
}

export default withRouter(PageMarketOwnerView);