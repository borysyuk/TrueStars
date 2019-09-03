import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import FormComponent from "../General/FormComponent";
import MarketOwnerService from "../../services/MarketOwnerService";
import AppStorageService from "../../services/AppStorageService";
import {NotificationManager} from "react-notifications";
import GeneralService from "../../services/GeneralService";

class PlayerCommitForm extends FormComponent {
    constructor(props) {
        super(props);

        this.state = {
            game: MarketOwnerService.newCommitment(),
        };

        this.handleInputChange = this.handleInputChange('game');
        this.handleInputChange = this.handleInputChange.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();

        var result = MarketOwnerService.generateCommitment(this.state.game.rate);

        MarketOwnerService.commit(this.props.hash, result.commitment).then( () => {
            NotificationManager.info('Please wait for confirmation.', '', 5000);
            MarketOwnerService.saveCommitmentToLocalStorage(
                AppStorageService.currentAccount,
                this.props.hash,
                this.state.game.rate,
                result.commitment,
                result.salt
            );
            this.setState({game: MarketOwnerService.newCommitment()});
        }).catch(error => {
            console.log(GeneralService.getWeb3ErrorText(error.message));
            NotificationManager.error('Cannot commit rating.', GeneralService.getWeb3ErrorText(error.message), 8000);
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
                                <label htmlFor="rate">Rate <span className="required">*</span></label>
                                <input name="rate"
                                       type="text"
                                       placeholder="Rate"
                                       value={this.state.game.rate}
                                       onChange={this.handleInputChange}

                                />&nbsp;
                                <input type="submit" className="pure-button" value="Rate it!" />
                            </div>
                        </fieldset>
                    </form>
                </div>
            </div>
        );
    }
}

export default PlayerCommitForm;