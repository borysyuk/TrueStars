import React, {Component} from 'react';
import {NotificationManager} from 'react-notifications';
import {withRouter} from "react-router-dom"
import GeneralService from "../../services/GeneralService";
import MarketOwnerService from "../../services/MarketOwnerService";



class MarketView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            marketInfo: props.marketInfo,
            id: props.id,
        };

        this.handleReveal = this.handleReveal.bind(this);
        this.handleWithdraw = this.handleWithdraw.bind(this);
        this.handleDestroy = this.handleDestroy.bind(this);
    }

    handleReveal() {
        MarketOwnerService.switchToReveal(this.state.id).then(() => {
            console.log('then');
            NotificationManager.info('Please wait for confirmation.', '', 5000);
            this.props.history.push('/marketowner');
        }).catch(error => {
            console.log('error', error);
            console.log(GeneralService.getWeb3ErrorText(error.message));
            NotificationManager.error('Cannot '+this.state.mode+' market.', GeneralService.getWeb3ErrorText(error.message), 8000);
            return false;
        });
    }

    handleWithdraw() {

    }

    handleDestroy(){

    }

    render(){
        return (
            <div>
                <b>maxRate :</b> {this.props.marketInfo.maxRate}<br/>
                <b>winRate :</b> {this.props.marketInfo.winRate}<br/>
                <b>winDistance :</b>  {this.props.marketInfo.winDistance}<br/>
                <b>stake :</b> {this.props.marketInfo.stake}<br/>
                <b>owner :</b> {this.props.marketInfo.owner}<br/>
                <b>phase :</b>  {this.props.marketInfo.phase}<br/>
                <b>totalVotes :</b>  {this.props.marketInfo.totalVotes}<br/>

                {this.props.marketInfo.phase === 1 && <button className="pure-button pure-button-primary" onClick={this.handleReveal}>Move to Reveal phase</button>}
                {this.props.marketInfo.phase === 2 && <button className="pure-button pure-button-primary" onClick={this.handleWithdraw}>Move to Withdraw phase</button>}
                {this.props.marketInfo.phase === 3 && <button className="pure-button" onClick={this.handleDestroy}>Move to Destroy phase</button>}
            </div>
        )
    }
}


export default withRouter(MarketView);