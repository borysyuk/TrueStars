import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import FormComponent from "../General/FormComponent";
import {NotificationManager} from "react-notifications";
import MarketOwnerService from "../../services/MarketOwnerService";
import GeneralService from "../../services/GeneralService";

class PlayerWithdrawForm extends FormComponent {
    constructor(props) {
        super(props);

        this.state = {
            marketHash: props.marketHash
        };

        this.handleInputChange = this.handleInputChange('marketHash');
        this.handleInputChange = this.handleInputChange.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();

        MarketOwnerService.withdraw(this.props.hash).then( () => {
            NotificationManager.info('Please wait for confirmation.', '', 5000);
        }).catch(error => {
            console.log(GeneralService.getWeb3ErrorText(error.message));
            NotificationManager.error('Cannot reveal rating.', GeneralService.getWeb3ErrorText(error.message), 8000);
        });

        return false;
    }

    render() {
        console.log('FORM STATE: ', this.state);
        return (
            <div className="pure-g">
                <div className='pure-u-1-1' style={{padding: "10px"}}>

                    <form className="pure-form pure-form-aligned" onSubmit={this.handleSubmit}>
                        <fieldset>
                            <div className="pure-control-group">
                                <input type="submit" className="pure-button" value="Withdraw" />
                                {/*<Link to={this.state.marketHash} className="pure-button">Find market</Link>*/}
                            </div>
                        </fieldset>
                    </form>
                </div>
            </div>
        );
    }
}

export default PlayerWithdrawForm;