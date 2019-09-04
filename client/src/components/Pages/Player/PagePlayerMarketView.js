import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import MarketOwnerService from "../../../services/MarketOwnerService";
import MarketView from "../../Market/MarketView"
import MarketRegisterPlayer from "../../Market/MarketRegisterPlayer";
import { Link } from 'react-router-dom';
import PlayerCommitForm from "../../Player/PlayerCommitForm";
import PlayerRevealForm from "../../Player/PlayerRevealForm";
import PlayerWithdrawForm from "../../Player/PlayerWithdrawForm";

class PagePlayerMarketView extends Component {

    constructor(props) {
        super(props);

        this.state = {
            hash: props.match.params.hash,
            marketInfo: MarketOwnerService.newMarketInfo(),
            loading: true,
            error: ""
        }
    }

    componentWillMount() {
        console.log(this.state);
        MarketOwnerService.getMarketByHash(this.state.hash).then(marketInfo => {
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
                                <PlayerCommitForm marketInfo={this.state.marketInfo} hash={this.state.hash}/>
                            </div>
                        }
                        {
                            this.state.marketInfo.phase === 2 &&
                            <div className='pure-u-1-2'>
                                <PlayerRevealForm marketInfo={this.state.marketInfo} hash={this.state.hash}/>
                            </div>
                        }
                        {
                            this.state.marketInfo.phase === 3 &&
                            <div className='pure-u-1-2'>
                                <PlayerWithdrawForm marketInfo={this.state.marketInfo} hash={this.state.hash}/>
                            </div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(PagePlayerMarketView);