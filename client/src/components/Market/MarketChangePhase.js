import React, {Component} from 'react';
import {NotificationManager} from 'react-notifications';
import {withRouter} from "react-router-dom"
import GeneralService from "../../services/GeneralService";
import MarketOwnerService from "../../services/MarketOwnerService";


class MarketChangePhase extends Component {
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
            NotificationManager.error('Cannot ' + this.state.mode + ' market.', GeneralService.getWeb3ErrorText(error.message), 8000);
            return false;
        });
    }

    handleWithdraw() {
        MarketOwnerService.switchToWithdraw(this.state.id).then(() => {
            console.log('then');
            NotificationManager.info('Please wait for confirmation.', '', 5000);
            this.props.history.push('/marketowner');
        }).catch(error => {
            console.log('error', error);
            console.log(GeneralService.getWeb3ErrorText(error.message));
            NotificationManager.error('Cannot ' + this.state.mode + ' market.', GeneralService.getWeb3ErrorText(error.message), 8000);
            return false;
        });
    }

    handleDestroy() {
        MarketOwnerService.switchToDestroy(this.state.id).then(() => {
            console.log('then');
            NotificationManager.info('Please wait for confirmation.', '', 5000);
            this.props.history.push('/marketowner');
        }).catch(error => {
            console.log('error', error);
            console.log(GeneralService.getWeb3ErrorText(error.message));
            NotificationManager.error('Cannot ' + this.state.mode + ' market.', GeneralService.getWeb3ErrorText(error.message), 8000);
            return false;
        });
    }

    render() {
        return (
            <div style={{margin: "10px 0px"}}>
                {this.props.marketInfo.phase === 1 &&
                <button className="pure-button pure-button-primary" onClick={this.handleReveal}>Move to Reveal
                    phase</button>}
                {this.props.marketInfo.phase === 2 &&
                <button className="pure-button pure-button-primary" onClick={this.handleWithdraw}>Move to Withdraw
                    phase</button>}
                {this.props.marketInfo.phase === 3 &&
                <button className="pure-button" onClick={this.handleDestroy}>Move to Destroy phase</button>}
            </div>
        )
    }
}


export default withRouter(MarketChangePhase);