import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import MarketOwnerService from "../../../services/MarketOwnerService";
import MarketView from "../../Market/MarketView"
import MarketRegisterPlayer from "../../Market/MarketRegisterPlayer";
import {Link} from 'react-router-dom';
import MarketChangePhase from "../../Market/MarketChangePhase";

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

    componentDidMount() {
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
                            <MarketChangePhase marketInfo={this.state.marketInfo} id={this.state.id}/>
                        </div>
                        <div className='pure-u-1-2'>
                            {
                                this.state.marketInfo.phase === 1 &&
                                <MarketRegisterPlayer id={this.state.id}
                                                      submit={MarketOwnerService.addPlayerToMarket.bind(MarketOwnerService)}/>
                            }
                            <div style={{padding: "10px"}}>
                                <Link to={"/player/market/" + this.state.marketInfo.hash}>Go to player section</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(PageMarketOwnerView);