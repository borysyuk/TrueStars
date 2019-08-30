import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import MarketOwnerService from "../../../services/MarketOwnerService";
import MarketView from "../../Market/MarketView"
import MarketRegisterPlayer from "../../Market/MarketRegisterPlayer";

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
        console.log(this.state);
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
            console.log("market error", error);
            this.setState({
                loading: false,
                error: "Error: Cannot load market.",
            });
        })
    }

    render() {
        return (
            <div className="pure-g">
                <div className='pure-u-1-1'>
                    <h2>Market Info!</h2>
                    <div className="pure-g">
                        <div className='pure-u-1-2'>
                            <MarketView marketInfo={this.state.marketInfo} id={this.state.id}/>
                        </div>
                        {
                            this.state.marketInfo.phase === 1 &&
                            <div className='pure-u-1-2'>
                                <MarketRegisterPlayer id={this.state.id} submit={MarketOwnerService.addPlayerToMarket.bind(MarketOwnerService)}/>
                            </div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(PageMarketOwnerView);