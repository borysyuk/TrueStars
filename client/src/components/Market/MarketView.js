import React, {Component} from 'react';
import {withRouter} from "react-router-dom"
import AppStorageService from "../../services/AppStorageService";


class MarketView extends Component {
    constructor(props) {
        super(props);
    }


    render() {
        console.log(this.props.marketInfo.stake);
        // console.log(new AppStorageService.web3.utils.BN(this.props.marketInfo.stake));
        var ethStake = AppStorageService.web3.utils.fromWei(this.props.marketInfo.stake.toString(), 'ether');
//        var ethStake = AppStorageService.web3.utils.fromWei("100000", 'ether');
        console.log('FFFFFF');
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
                            <td><b>Stake (eth)</b></td>
                            <td>{ethStake}</td>
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
                </div>
            </div>
        )
    }
}


export default withRouter(MarketView);