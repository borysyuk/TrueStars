import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import FormComponent from "../General/FormComponent";
import MarketOwnerService from "../../services/MarketOwnerService";
import AppStorageService from "../../services/AppStorageService";
import {NotificationManager} from "react-notifications";
import GeneralService from "../../services/GeneralService";

class PlayerRevealForm extends FormComponent {
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

        MarketOwnerService.reveal(this.props.hash, this.state.game.rate, this.state.game.salt).then( () => {
            NotificationManager.info('Please wait for confirmation.', '', 5000);
        }).catch(error => {
            console.log(GeneralService.getWeb3ErrorText(error.message));
            NotificationManager.error('Cannot reveal rating.', GeneralService.getWeb3ErrorText(error.message), 8000);
        });

        return false;
    }

    componentDidMount() {
        console.log("HELLO WORLD!", this.props);
        console.log(MarketOwnerService.loadCommitmentFromLocalStorage(AppStorageService.currentAccount, this.props.hash));
        this.setState({game: MarketOwnerService.loadCommitmentFromLocalStorage(AppStorageService.currentAccount, this.props.hash)});
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

                                /><br />
                                <label htmlFor="salt">Salt <span className="required">*</span></label>
                                <input name="salt"
                                       type="text"
                                       placeholder="Salt"
                                       value={this.state.game.salt}
                                       onChange={this.handleInputChange}

                                /><br /><br />
                                <input type="submit" className="pure-button" value="Reveal it!" />
                            </div>
                        </fieldset>
                    </form>
                </div>
            </div>
        );
    }
}

export default PlayerRevealForm;