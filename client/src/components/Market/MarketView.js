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
            <div className="pure-g">
                <div className='pure-u-1-1'>
                    <table className="pure-table" style={{textAlign: "left"}}>
                        <tbody>
                        <tr>
                            <td><b>Internal id: </b></td>
                            <td>{this.props.marketInfo.id}</td>
                        </tr>
                        <tr>
                            <td><b>Max rating</b></td>
                            <td>{this.props.marketInfo.maxRating}</td>
                        </tr>
                        <tr>
                            <td><b>Win rating</b></td>
                            <td>{this.props.marketInfo.winRating}</td>
                        </tr>
                        <tr>
                            <td><b>Win distance</b></td>
                            <td>{this.props.marketInfo.winDistance}</td>
                        </tr>
                        <tr>
                            <td><b>Stake wei</b></td>
                            <td>{this.props.marketInfo.stake}</td>
                        </tr>
                        <tr>
                            <td><b>Owner</b></td>
                            <td>{this.props.marketInfo.owner}</td>
                        </tr>
                        <tr>
                            <td><b>Phase</b></td>
                            <td>{this.props.marketInfo.phase}</td>
                        </tr>
                        <tr>
                            <td><b>Total votes</b></td>
                            <td>{this.props.marketInfo.totalVotes}</td>
                        </tr>
                        <tr>
                            <td><b>Total weights</b></td>
                            <td>{this.props.marketInfo.totalWeights}</td>
                        </tr>
                        <tr>
                            <td><b>Total withdraw</b></td>
                            <td>{this.props.marketInfo.totalWithdraw}</td>
                        </tr>
                        <tr>
                            <td><b>totalWinWeight</b></td>
                            <td>{this.props.marketInfo.totalWinWeight}</td>
                        </tr>
                        </tbody>
                    </table>

                    <div style={{margin : "10px 0px"}}>
                        {this.props.marketInfo.phase === 1 &&
                        <button className="pure-button pure-button-primary" onClick={this.handleReveal}>Move to Reveal
                            phase</button>}
                        {this.props.marketInfo.phase === 2 &&
                        <button className="pure-button pure-button-primary" onClick={this.handleWithdraw}>Move to Withdraw
                            phase</button>}
                        {this.props.marketInfo.phase === 3 &&
                        <button className="pure-button" onClick={this.handleDestroy}>Move to Destroy phase</button>}
                    </div>
                </div>
            </div>
        )
    }
}


export default withRouter(MarketView);